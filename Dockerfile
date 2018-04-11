FROM halverneus/static-file-server
COPY ./dist ./web
COPY ./dist/widget.js ./web/widget.js