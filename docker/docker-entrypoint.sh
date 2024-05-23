#!/bin/sh

export JSON_STRING='window.runtimeVariables = (() => ({\
  VITE_SUPPORTED_LANGUAGES: "'${VITE_SUPPORTED_LANGUAGES}'",\
  VITE_BOTHUB_WEBAPP_USE_SENTRY: "'${VITE_BOTHUB_WEBAPP_USE_SENTRY}'",\
  VITE_BOTHUB_WEBAPP_USE_HOTJAR: "'${VITE_BOTHUB_WEBAPP_USE_HOTJAR}'",\
  VITE_API_BASE_URL: "'${VITE_API_BASE_URL}'",\
  SENTRY_ENVIRONMENT: "'${SENTRY_ENVIRONMENT}'",\
  NEXUS_API_BASE_URL: "'${NEXUS_API_BASE_URL}'",\
  FLOWS_API_BASE_URL: "'${FLOWS_API_BASE_URL}'",\
  get(name){\
    return this[name];\
  }\
}))();\
}'

sed "s|\/\/CONFIGURATIONS_PLACEHOLDER|${JSON_STRING}|" /usr/share/nginx/html/bothub-webapp/index.html.tmpl > /tmp/index.html

exec "$@"
