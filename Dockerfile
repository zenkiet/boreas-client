FROM node:26-alpine AS build

ARG PNPM_VERSION=latest

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:${PATH} \
    CI=true

WORKDIR /app

RUN npm install --global "pnpm@${PNPM_VERSION}"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches

RUN --mount=type=cache,id=boreas-client-pnpm,target=/pnpm/store,sharing=locked \
    pnpm config set store-dir /pnpm/store \
    && pnpm install --frozen-lockfile

COPY angular.json tsconfig.json tsconfig.app.json .postcssrc.json ./
COPY public ./public
COPY src ./src

RUN pnpm build --configuration production

FROM nginx:alpine AS runtime

ENV NGINX_ENTRYPOINT_QUIET_LOGS=1

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/boreas-client/browser/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1/healthz"]
