#!/bin/sh

echo "COPY VARIABLES"

if [ ! -f /tmp/config.js ] ; then
	envsubst < /usr/share/nginx/html/bothub-webapp/config.js.tmpl > /tmp/config.js
fi

echo "RUNNING SERVER"

exec "$@"
