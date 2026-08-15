#!/usr/bin/env bash

set -Eeuo pipefail
set +x

# Print a consistently prefixed progress message.
log() {
    printf '[docker-publish] %s\n' "$*"
}

# Print an error and stop the publish immediately.
die() {
    printf '[docker-publish] error: %s\n' "$*" >&2
    exit 1
}

# Fail early when a required CLI is unavailable.
require_command() {
    command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

# Convert an arbitrary release value into a valid Docker tag.
sanitize_tag() {
    local raw="$1"
    local tag

    tag="$(printf '%s' "$raw" | sed -E \
        -e 's/[^A-Za-z0-9_.-]+/-/g' \
        -e 's/^[.-]+//' \
        -e 's/[.-]+$//')"
    tag="${tag:0:128}"

    [[ -n "$tag" ]] || die "Image tag is empty after normalization: $raw"
    printf '%s' "$tag"
}

# Normalize and append an image tag once, preserving tag order.
add_tag() {
    local raw="$1"
    local tag

    tag="$(sanitize_tag "$raw")"

    if [[ "$tag" != "$raw" ]]; then
        log "Normalized tag '$raw' to '$tag'"
    fi

    local existing
    for existing in "${tags[@]:-}"; do
        [[ "$existing" == "$tag" ]] && return
    done

    tags+=("$tag")
}

# Convert common Git remote formats into a public OCI source URL.
source_url_from_remote() {
    local url="$1"

    url="${url%%\?*}"
    url="${url%%\#*}"
    url="${url%.git}"

    if [[ "$url" =~ ^git@([^:]+):(.+)$ ]]; then
        printf 'https://%s/%s' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
        return
    fi

    if [[ "$url" =~ ^ssh://[^@]+@([^/]+)/(.+)$ ]]; then
        printf 'https://%s/%s' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
        return
    fi

    if [[ "$url" =~ ^https?:// ]]; then
        printf '%s' "$url" | sed -E 's#^(https?://)[^/@]+@#\1#'
    fi
}

require_command docker
require_command git
require_command grep
require_command sed

[[ -n "${DOCKERHUB_USERNAME:-}" ]] || die 'Set DOCKERHUB_USERNAME to your Docker Hub username.'
[[ -n "${DOCKERHUB_TOKEN:-}" ]] || die 'Set DOCKERHUB_TOKEN to a Docker Hub personal access token with Read & Write permission.'

dockerhub_token="$DOCKERHUB_TOKEN"
unset DOCKERHUB_TOKEN

script_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(git -C "$script_dir" rev-parse --show-toplevel 2>/dev/null)" \
    || die 'The script must be located inside a Git repository.'

revision="$(git -C "$repo_root" rev-parse HEAD 2>/dev/null)" \
    || die 'The repository does not have a commit to publish.'
short_revision="${revision:0:12}"

# A commit-based tag must describe the exact image inputs being published.
if [[ "${ALLOW_DIRTY:-0}" != '1' ]] \
    && [[ -n "$(git -C "$repo_root" status --porcelain --untracked-files=normal)" ]]; then
    die 'The working tree is dirty. Commit the image inputs or set ALLOW_DIRTY=1 explicitly.'
fi

if [[ "${ALLOW_DIRTY:-0}" == '1' ]] \
    && [[ -n "$(git -C "$repo_root" status --porcelain --untracked-files=normal)" ]]; then
    log 'Warning: publishing uncommitted content under a commit-based image tag.'
fi

namespace="${DOCKERHUB_NAMESPACE:-$DOCKERHUB_USERNAME}"
image_name="${IMAGE_NAME:-boreas-client}"

[[ "$namespace" =~ ^[a-z0-9]+([._-][a-z0-9]+)*$ ]] \
    || die "Invalid Docker Hub namespace: $namespace"
[[ "$image_name" =~ ^[a-z0-9]+([._-][a-z0-9]+)*$ ]] \
    || die "Invalid Docker image name: $image_name"

repository="docker.io/${namespace}/${image_name}"
platforms='linux/amd64,linux/arm64'

branch=''
if [[ "${GITHUB_REF_TYPE:-}" == 'branch' && -n "${GITHUB_REF_NAME:-}" ]]; then
    branch="$GITHUB_REF_NAME"
elif [[ "${GITHUB_REF_TYPE:-}" == 'tag' || "${GITHUB_REF:-}" == refs/tags/* || -n "${CI_COMMIT_TAG:-}" ]]; then
    branch=''
elif [[ "${GITHUB_REF:-}" == refs/heads/* ]]; then
    branch="${GITHUB_REF#refs/heads/}"
elif [[ -n "${CI_COMMIT_BRANCH:-}" ]]; then
    branch="$CI_COMMIT_BRANCH"
else
    branch="$(git -C "$repo_root" symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
fi

release_tag=''
if [[ "${GITHUB_REF_TYPE:-}" == 'tag' && -n "${GITHUB_REF_NAME:-}" ]]; then
    release_tag="$GITHUB_REF_NAME"
elif [[ "${GITHUB_REF:-}" == refs/tags/* ]]; then
    release_tag="${GITHUB_REF#refs/tags/}"
elif [[ -n "${CI_COMMIT_TAG:-}" ]]; then
    release_tag="$CI_COMMIT_TAG"
else
    release_tag="$(git -C "$repo_root" describe --tags --exact-match 2>/dev/null || true)"
fi

tags=()
add_tag "sha-${short_revision}"
[[ -n "$release_tag" ]] && add_tag "$release_tag"
[[ "$branch" == 'main' ]] && add_tag 'latest'
[[ -n "${IMAGE_TAG:-}" ]] && add_tag "$IMAGE_TAG"

version_tag="${release_tag:-${IMAGE_TAG:-sha-${short_revision}}}"
version_tag="$(sanitize_tag "$version_tag")"

source_url="${SOURCE_URL:-}"
if [[ -z "$source_url" && -n "${GITHUB_SERVER_URL:-}" && -n "${GITHUB_REPOSITORY:-}" ]]; then
    source_url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}"
elif [[ -z "$source_url" && -n "${CI_PROJECT_URL:-}" ]]; then
    source_url="$CI_PROJECT_URL"
elif [[ -z "$source_url" ]]; then
    remote_url="$(git -C "$repo_root" remote get-url origin 2>/dev/null || true)"
    source_url="$(source_url_from_remote "$remote_url")"
fi

docker info >/dev/null 2>&1 || die 'Docker daemon is not available.'
docker buildx version >/dev/null 2>&1 || die 'Docker Buildx is not available.'

original_docker_config="${DOCKER_CONFIG:-${HOME:?HOME is not set}/.docker}"
current_context="$(docker context show 2>/dev/null)" \
    || die 'Unable to determine the active Docker context.'
temporary_docker_config=''
builder_name=''

# Remove ephemeral credentials and builder state while preserving the exit code.
cleanup() {
    local status=$?
    trap - EXIT

    if [[ -n "$builder_name" ]]; then
        docker buildx rm "$builder_name" >/dev/null 2>&1 || true
    fi

    if [[ -n "$temporary_docker_config" && -d "$temporary_docker_config" ]]; then
        rm -rf -- "$temporary_docker_config"
    fi

    unset dockerhub_token
    exit "$status"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# Isolate docker login so the CI token never persists in the user's Docker config.
temporary_docker_config="$(mktemp -d "${TMPDIR:-/tmp}/boreas-docker.XXXXXX")"

if [[ -d "$original_docker_config/contexts" ]]; then
    cp -R "$original_docker_config/contexts" "$temporary_docker_config/contexts"
fi

if [[ -d "$original_docker_config/cli-plugins" ]]; then
    ln -s "$original_docker_config/cli-plugins" "$temporary_docker_config/cli-plugins"
fi

export DOCKER_CONFIG="$temporary_docker_config"
if [[ -n "${DOCKER_CONTEXT:-}" || -z "${DOCKER_HOST:-}" ]]; then
    export DOCKER_CONTEXT="$current_context"
fi

log "Logging in to Docker Hub as $DOCKERHUB_USERNAME"
printf '%s' "$dockerhub_token" \
    | docker login docker.io --username "$DOCKERHUB_USERNAME" --password-stdin >/dev/null
unset dockerhub_token

builder_name="boreas-${short_revision}-$$"
log "Creating isolated Buildx builder $builder_name"
docker buildx create --name "$builder_name" --driver docker-container --use >/dev/null
builder_info="$(docker buildx inspect --builder "$builder_name" --bootstrap)"

# Multi-platform publication must fail before building if either target is unavailable.
grep -q 'linux/amd64' <<<"$builder_info" \
    || die 'The Buildx builder does not support linux/amd64.'
grep -q 'linux/arm64' <<<"$builder_info" \
    || die 'The Buildx builder does not support linux/arm64. Configure QEMU/binfmt or use a native ARM64 builder.'

build_args=(
    buildx build
    --builder "$builder_name"
    --file "$repo_root/Dockerfile"
    --platform "$platforms"
    --cache-from "type=registry,ref=${repository}:buildcache"
    --cache-to "type=registry,ref=${repository}:buildcache,mode=max"
    --label "org.opencontainers.image.title=${image_name}"
    --label "org.opencontainers.image.revision=${revision}"
    --label "org.opencontainers.image.version=${version_tag}"
    --provenance=mode=max
    --sbom=true
    --pull
    --push
)

if [[ -n "$source_url" ]]; then
    build_args+=(--label "org.opencontainers.image.source=${source_url}")
fi

if [[ -n "${CREATED_AT:-}" ]]; then
    build_args+=(--label "org.opencontainers.image.created=${CREATED_AT}")
fi

for tag in "${tags[@]}"; do
    build_args+=(--tag "${repository}:${tag}")
done

build_args+=("$repo_root")

log "Building and pushing $repository for $platforms"
docker "${build_args[@]}"

immutable_ref="${repository}:sha-${short_revision}"
manifest="$(docker buildx imagetools inspect "$immutable_ref")"

# Verify Docker Hub received a complete multi-platform manifest, not a partial push.
grep -Eq 'Platform:[[:space:]]+linux/amd64' <<<"$manifest" \
    || die "Published manifest is missing linux/amd64: $immutable_ref"
grep -Eq 'Platform:[[:space:]]+linux/arm64' <<<"$manifest" \
    || die "Published manifest is missing linux/arm64: $immutable_ref"

log "Published and verified:"
for tag in "${tags[@]}"; do
    printf '  %s:%s\n' "$repository" "$tag"
done
