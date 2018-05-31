export SHELL := /bin/bash
export PATH  := $(CURDIR)/node_modules/.bin:$(PATH)

SOURCES := $(wildcard src/*)
VERSION := $(shell node -pe "require('./package.json').version")
OK := \033[32;01m✓\033[0m

PACKAGE := cached-iterable
GLOBAL  := CachedIterable

# The default target.
all: lint test build

lint:
	@eslint --config $(CURDIR)/eslint_src.json --max-warnings 0 src/
	@eslint --config $(CURDIR)/eslint_test.json --max-warnings 0 test/
	@echo -e " $(OK) $@"

.PHONY: test
test:
	@mocha --recursive --ui tdd \
	    --require mocha_config \
	    test/**/*_test.js

build: $(PACKAGE).js compat.js

$(PACKAGE).js: $(SOURCES)
	@rollup $(CURDIR)/src/index.mjs \
	    --config $(CURDIR)/bundle_config.js \
	    --banner "/* $(PACKAGE)@$(VERSION) */" \
	    --amd.id $(PACKAGE) \
	    --name $(GLOBAL) \
	    --output.file $@
	@echo -e " $(OK) $@ built"

compat.js: $(SOURCES)
	@rollup $(CURDIR)/src/index.mjs \
	    --config $(CURDIR)/compat_config.js \
	    --banner "/* $(PACKAGE)@$(VERSION) */" \
	    --amd.id $(PACKAGE) \
	    --name $(GLOBAL) \
	    --output.file $@
	@echo -e " $(OK) $@ built"

clean:
	@rm -f $(PACKAGE).js compat.js
	@echo -e " $(OK) clean"
