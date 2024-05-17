#!/bin/sh

if [ ! -f /usr/share/nginx/html/intelligence-webapp/config.js ] ; then
	envsubst < /usr/share/nginx/html/intelligence-webapp/config.js.tmpl > /usr/share/nginx/html/intelligence-webapp/config.js
fi

exec "$@"
