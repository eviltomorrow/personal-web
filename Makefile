# colors compatible setting
CRED:=$(shell tput setaf 1 2>/dev/null)
CGREEN:=$(shell tput setaf 2 2>/dev/null)
CYELLOW:=$(shell tput setaf 3 2>/dev/null)
CEND:=$(shell tput sgr0 2>/dev/null)

MAINVERSION=$(shell cat version | sed 's/^[ \t]*//g')
GITSHA := $(shell git rev-parse HEAD)
BUILDTIME=$(shell date +%FT%T%z)
REGISTRY=registry.cn-beijing.aliyuncs.com
ACCOUNT=eviltomorrow

.PHONY: node_version_check
NODE_VERSION_MIN=18
node_version_check:
	@echo "$(CGREEN)=> Node.js version check ...$(CEND)"
	@node_version=$$(node --version | sed 's/v//' | awk -F. '{print $$1}'); \
	if [ $$node_version -lt $(NODE_VERSION_MIN) ]; then \
		printf "Node.js $(NODE_VERSION_MIN)+ required, found: "; node --version; exit 1; \
	else \
		echo "Node.js version check pass"; \
	fi

# Code format
.PHONY: fmt
fmt: node_version_check
	@echo "$(CGREEN)=> Run eslint on all source files ...$(CEND)"
	@npm run lint

# build
.PHONY: build
build: fmt
	@echo "$(CGREEN)=> Build Next.js production bundle ...$(CEND)"
	@npm run build

# docker
.PHONY: docker
docker:
	@echo "$(CGREEN)=> Building docker image ...$(CEND)"
	@docker build --target prod -t personal-web:$(MAINVERSION) . \
		--build-arg APPNAME=personal-web \
		--build-arg MAINVERSION=$(MAINVERSION) \
		--build-arg GITSHA=$(GITSHA) \
		--build-arg BUILDTIME=$(BUILDTIME)
	@docker tag personal-web:$(MAINVERSION) $(REGISTRY)/$(ACCOUNT)/personal-web:$(MAINVERSION)

# clear
.PHONY: clear
clear:
	@echo "$(CGREEN)=> Clear .next ...$(CEND)"
	@rm -rf .next

# mod
.PHONY: mod
mod:
	@echo "$(CGREEN)=> npm install$(CEND)"
	@npm install

# push
.PHONY: push
push:
	@echo "$(CGREEN)=> docker push image$(CEND)"
	@docker push $(REGISTRY)/$(ACCOUNT)/personal-web:$(MAINVERSION)
