/// <reference path='../../typings/node/node.d.ts' />
/// <reference path='../../typings/json-file/json-file.d.ts' />
/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path='../../typings/tv4-via-typenames/tv4-via-typenames.d.ts' />
/// <reference path='../../typings/tv4-via-typenames-node/tv4-via-typenames-node.d.ts' />
var path = require('path');
var json_file = require('json-file');
var tv4vtn = require('tv4-via-typenames');
var SchemaFiles = (function () {
    // This may only be created once.
    function SchemaFiles(args) {
        SchemaFiles.schemasDir = args.schemasDir;
        var config = { getSchemaFromTypename: this.readSchemaFileFromTypename };
        tv4vtn.configure(config);
        this.test = {
            getSchemaFilenameFromTypename: SchemaFiles.getSchemaFilenameFromTypename,
            getTypenameFromSchemaFilename: SchemaFiles.getTypenameFromSchemaFilename,
            hasSchema: this.hasSchema,
            getLoadedSchema: this.getLoadedSchema
        };
    }
    SchemaFiles.getSchemaFilenameFromTypename = function (typename) {
        return SchemaFiles.schemasDir + '/' + typename + ".schema.json";
    };
    SchemaFiles.getTypenameFromSchemaFilename = function (pathname) {
        var filename = path.basename(pathname);
        var m = filename.match(SchemaFiles.SCHEMA_FILENAME_REGEXP);
        return ((m != null) ? m[1] : null);
    };
    SchemaFiles.prototype.readSchemaFileFromTypename = function (typename) {
        var filename = SchemaFiles.getSchemaFilenameFromTypename(typename);
        return json_file.readJSONFile(filename).then(function (result) {
            return { filename: result.filename, schema: result.contents };
        });
    };
    // Find the types referenced by the schema for the given typenames.
    // All associated schema are registered.
    // @param query_typenames May be either a string, or an array of strings
    //   If an array, then the first typename is the main one.
    //
    SchemaFiles.prototype.loadRequiredSchema = function (query_typenames) {
        return tv4vtn.loadRequiredSchema(query_typenames);
    };
    // Find the types referenced by the schema for the given typenames.
    // All associated schema are registered.
    // @param query_typenames May be either a string, or an array of strings
    //   If an array, then the first typename is the main one.
    //
    SchemaFiles.prototype.validate = function (typename, instance) {
        return tv4vtn.validate(typename, instance);
    };
    // This also loads the schema for the schema specification itself, if not already loaded.
    SchemaFiles.prototype.init = function () {
        return new Promise(function (resolve, reject) {
            var schema = tv4vtn.test.getLoadedSchema(SchemaFiles.DRAFT_SCHEMA_TYPENAME);
            if (schema) {
                resolve();
            }
            else {
                var promise = tv4vtn.loadSchemaDraftV4().then(function () {
                    return;
                });
                resolve(promise);
            }
        });
    };
    SchemaFiles.prototype.hasSchema = function (typename) {
        return tv4vtn.test.hasSchema(typename);
    };
    SchemaFiles.prototype.getLoadedSchema = function (typename) {
        return tv4vtn.test.getLoadedSchema(typename);
    };
    SchemaFiles.DRAFT_SCHEMA_TYPENAME = tv4vtn.DRAFT_SCHEMA_TYPENAME;
    SchemaFiles.SCHEMA_FILENAME_REGEXP = '^([a-zA-Z0-9][-_a-zA-Z0-9]*).schema.json$';
    return SchemaFiles;
})();
exports.SchemaFiles = SchemaFiles;
