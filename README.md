# tv4-via-typenames-node
[![NPM version](http://img.shields.io/npm/v/tv4-via-typenames-node.svg)](https://www.npmjs.org/package/tv4-via-typenames-node)
[![Build Status via Travis CI](https://travis-ci.org/psnider/tv4-via-typenames-node.svg?branch=master)](https://travis-ci.org/psnider/tv4-via-typenames-node)

# Overview
tv4-via-typenames-node provides a typename-oriented schema loading and validation system for node.
It has a minimal interface for validating typed data against JSON-schemas from like-named files.
It wraps the [tv4-via-typenames](https://www.npmjs.com/package/tv4-via-typenames) module,
and validates data against [draft-4 JSON schema](http://json-schema.org/).  

tv4-via-typenames-node recursively loads, validates, and registers referenced schema,
and all of their referenced schema, both those referenced directly and indirectly. 
Schema are validated against the draft-4 standard.
tv4-via-typenames-node registers only correct schema, and returns errors for any incorrect schema.
 

# A Complete Example
When you run it, it will print this message if successful:  
*The validity checks worked as expected!*

```javascript
var tv4vtnNode = require('tv4-via-typenames-node');
var SchemaFiles = tv4vtnNode.SchemaFiles;

var schema_files = new SchemaFiles({ schemasDir: './test/data/schemas' });
var init_promise = schema_files.init();
var schemas_ready_promise = init_promise.then(function (result) {
    return schema_files.loadRequiredSchema(['Person', 'ASHBC']);
});

function main() {
    var succeeded = true;
    var validity = schema_files.validate('ASHBC', 'hello');
    if (validity.valid != true) {
        succeeded = false;
        console.log('should be false, but validity.valid=' + validity.valid);
    }
    validity = schema_files.validate('ASHBC', { hello: 'hello' });
    if (validity.valid != false) {
        succeeded = false;
        console.log('should be false, but validity.valid=' + validity.valid);
    }
    if (succeeded) {
        console.log('The validity checks worked as expected!');
    }
}

schemas_ready_promise.then(function (result) {
    main();
}, function (error) {
    console.log('Couldnt load your schemas. error.message=' + error.message);
    throw error;
});
```

# Running the Example
This example runs in the development setup, as it uses the schemas that are part of the git repo, which are not included in the npm package. So first, clone the git repo:
```
git clone git@github.com:psnider/tv4-via-typenames-node.git
```
You must then install the required npm packages:
```
npm install
```
This example works from the root directory of the repo for this package.
It loads schemas from the ./test/data/schemas directory.

Then open up the node REPL:
```
node
```
and cut and paste the code below into the node REPL.


# Capabilities not Supported
tv4-via-typenames-node does not:  
- support customizing the mapping between schema files and type names.


# API
To validate data as type instances against their schema, run these operations:

- construct an instance of this module  
  The constructor is synchronous.  
  ```
  let schema_files = new SchemaFiles({schemasDir: './test/data/schemas'});
  ```  
- initialize it  
  The initialization is asynchronous.  
  ```
  let init_promise = schema_files.init();
  ```  
- Call loadRequiredSchema() with a list of the top-level type names of the schema you will use.  
  You may load the schema after the init()'s promise resolves:  
  ```
  let load_promise = schema_files.loadRequiredSchema(['SomeRequest', 'Person']);
  ```
  This will also recursively load any schema referenced by the named schema.  
- Call validate() to validate a data object.
  You may validate data of any of the types referenced by schema requested by loadRequiredSchema(),
  after loadRequiredSchema()'s promise resolves.  
  ```
  let validity = schema_files.validate('Person', some_person);
  ```

See the [TypeScript declaration file](typings/tv4-via-typenames-node/tv4-via-typenames-node.d.ts) for the full API.

See the tests for more examples of usage.

# Conventions

- The name of the type (TYPENAME) of a data object is used as the key for locating all schema-related data.
- Schema names match the TYPENAME.
- All schema files are stored locally in: ./CONFIGURED_SCHEMAS_DIR/TYPENAME.schema.json
- Schema IDs are: urn:TYPENAME.schema.json#
- The $schema field is: http://json-schema.org/draft-04/schema#
- All references to other schema use the same conventions. So a $ref field contains a schema ID as above.


# Install
```
npm install tv4-via-typenames-node
```
You may use this module directly as a commonjs module.


Dependencies

- es6 promises
- tv4


## Installing as a Dependency of Another Module
If you install this package as a dependency of another module, 
it will install its TypeScript declaration files into that module's *./typings* directory, using the npm script *npm-postinstall*.


# Build Setup
You only need to do this if you will be building (developing) tv4-via-typenames-node.

## Simple Setup

This module is built with TypeScript 1.5, so you must have it installed in order to build. See [http://www.typescriptlang.org/#Download](http://www.typescriptlang.org/#Download)
You do not need TypeScript in order to use this module,
as the code that makes up the distribution is all javascript.

You can install TypeScript globally:
```
npm install -g typescript
```

Then clone from git:
```
git clone git@github.com:psnider/tv4-via-typenames-node.git
```

This code expects that ./commonjs is on node's load path:
```
NODE_PATH=$(NODE_PATH):./commonjs
```

And prepare your new repo for building with:
```
make setup
```
## Full Environment Setup
See our full instructions for setting up a [MEAN stack + TypeScript](https://github.com/psnider/setup-mean-ts) enviroment,
and setup the parts you want to use. We use Atom.

# Build
To build:
```
make build
```

To force a clean build:
```
make clean build
```

To build and test:
```
make
```


# Test

The test-runner is mocha, so you should probably have that installed globally:
```
npm install -g mocha
```

Then run the tests:
```
make test
```
