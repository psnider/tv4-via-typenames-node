PACKAGE_NAME=tv4-via-typenames-node
DEFINITELY_TYPED=~/devel/reference/borisyankov/DefinitelyTyped




all: build test

build: build-commonjs build-tests

test: test-commonjs

setup:
	npm install
	make install-decls

.PHONY: clean
clean:
	rm -fr commonjs generated
	mkdir commonjs


.PHONY: echo
echo:
	echo common_commonjs_filenames=$(common_commonjs_filenames)



# if this install is for a dependent package
#     copy the declaration files into the containing project
npm-postinstall:
	@if [ -f '../../package.json' ]; then \
		echo This is a dependent package, copying Typescript declaration files into main project... ;\
		mkdir -p ../../decl ;\
		cp -r decl/$(PACKAGE_NAME) ../../decl;\
	fi

# if this uninstall is for a dependent package
#     remove the declaration files from the containing project
npm-uninstall:
	@if [ -f '../../package.json' ]; then \
		rm -fr ../../decl/$(PACKAGE_NAME);\
	fi

dev_decls=chai mocha
dependent_decls=node es6-promise

install-decls:
	mkdir -p decl
	$(foreach package, $(dev_decls), rm -fr decl/$(package); cp -r $(DEFINITELY_TYPED)/$(package) decl;)
	$(foreach package, $(dependent_decls), rm -fr decl/$(package); cp -r $(DEFINITELY_TYPED)/$(package) decl;)


decl_files=$(wildcard decl/tv4-via-typenames-node/*.d.ts)

commonjs/%.js: src/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs


commonjs/%.js: test/src/ts/%.ts  $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs


########################################################################################################
# Common

	

build-commonjs : commonjs/tv4-via-typenames-node.js

test_ts_filename := $(wildcard test/src/ts/*.ts)
test_ts_basenames = $(notdir $(test_ts_filename))
test_js_basenames = $(test_ts_basenames:ts=js)
test_commonjs_filenames = $(addprefix commonjs/, $(test_js_basenames))

build-commonjs-tests: $(test_commonjs_filenames)
	
build-tests: build-commonjs-tests
	
test-tv4-via-typenames-node: build-commonjs build-tests
	mocha $(MOCHA_ARGS) -R spec commonjs/tv4-via-typenames-node.tests.js	
	
test-tv4-via-typenames-node-README-example: build-commonjs build-tests
	mocha $(MOCHA_ARGS) -R spec commonjs/tv4-via-typenames-node-README-example.tests.js
	
test-commonjs: test-tv4-via-typenames-node test-tv4-via-typenames-node-README-example


