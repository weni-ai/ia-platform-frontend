# syntax = docker/dockerfile:1

ARG NODE_VERSION="18.19.1"
ARG BASE_VERSION="alpine3.19"
ARG OLD_IMAGE="intelligence-webapp:latest"
ARG KEEP_DAYS=60

FROM node:${NODE_VERSION}-${BASE_VERSION} AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY package.json yarn.lock ./

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install

COPY . ./

RUN yarn build

FROM ${OLD_IMAGE} AS old_css

FROM nginxinc/nginx-unprivileged:1.25-alpine

ARG OLD_IMAGE=${OLD_IMAGE}
ARG KEEP_DAYS

COPY --chown=nginx:nginx docker/nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx docker/headers /usr/share/nginx/html/headers
COPY --chown=nginx:nginx docker/file_handler.sh /
COPY docker/docker-entrypoint.sh /
COPY --from=builder --chown=nginx:nginx /app/dist /app/config.js.tmpl /usr/share/nginx/html/bothub-webapp/
COPY --from=old_css --chown=nginx:nginx /usr/share/nginx/html/bothub-webapp/assets/all.tx[t] /usr/share/nginx/html/bothub-webapp/assets/*.css /usr/share/nginx/html/bothub-webapp/assets/

RUN mv /usr/share/nginx/html/bothub-webapp/index.html /usr/share/nginx/html/bothub-webapp/index.html.tmpl \
    && cd /usr/share/nginx/html/bothub-webapp/ \
    && ln -s /tmp/index.html \
    && /file_handler.sh css

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
