#!/bin/sh

npm run build
docker build . -t raptorbox/raptor-ui
docker push raptorbox/raptor-ui
