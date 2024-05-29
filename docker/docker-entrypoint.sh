#!/bin/sh
echo "COPY VARIABLES"
if [ ! -f /usr/share/nginx/html/bothub-webapp/config.js ] ; then
	envsubst < /usr/share/nginx/html/bothub-webapp/config.js.tmpl > /usr/share/nginx/html/bothub-webapp/config.js
fi

echo "RUNNING SERVER"

exec "$@"
