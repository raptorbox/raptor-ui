.PHONY: docker/build docker/push build

name := raptorbox/raptor-ui

gittag := $(shell git describe --tag --always)
tag := $(shell echo ${gittag} | cut -d'-' -f 1)
basetag := $(shell echo ${gittag} | cut -d'.' -f 1)

build:
	npm i
	npm run build

docker/build: build
	echo "Building ${tag}"
	docker build . -t ${name}:${tag}
	docker tag ${name}:${tag} ${name}:${basetag}

docker/push: docker/build
	docker push ${name}:${tag}
	docker push ${name}:${basetag}
