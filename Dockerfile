FROM node:24.19.0-alpine AS build

ARG PNPM_VERSION=11.24.0

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:${PATH} \
    CI=true

WORKDIR /app

RUN corepack enable \
    && corepack prepare "pnpm@${PNPM_VERSION}" --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=boreas-client-pnpm,target=/pnpm/store,sharing=locked \
    pnpm config set store-dir /pnpm/store \
    && pnpm install --frozen-lockfile

COPY angular.json tsconfig.json tsconfig.app.json .postcssrc.json ./
COPY public ./public
COPY src ./src

RUN pnpm build --configuration production

FROM nginx:1.31.3-alpine AS runtime

ENV NGINX_ENTRYPOINT_QUIET_LOGS=1

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/boreas-client/browser/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1/healthz"]
