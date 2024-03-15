FROM node:18.19.1-alpine3.19 as builder

WORKDIR /app

RUN apk add --no-cache git

COPY package.json yarn.lock .
RUN yarn install

COPY . .

RUN yarn lint --fix
RUN yarn build

FROM nginxinc/nginx-unprivileged:1.25

COPY --chown=nginx:root nginx.conf /etc/nginx/nginx.conf
COPY --from=builder --chown=nginx:nginx /app/dist /app/config.js.tmpl /usr/share/nginx/html/bothub-webapp
COPY docker-entrypoint.sh /

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
