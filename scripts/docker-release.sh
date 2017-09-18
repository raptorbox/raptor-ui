#!/bin/sh

docker build . -t raptorbox/raptor-ui
docker push raptorbox/raptor-ui
