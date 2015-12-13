/// <reference path='../../typings/node/node.d.ts' />
/// <reference path='../../typings/json-file/json-file.d.ts' />
/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path='../../typings/tv4-via-typenames/tv4-via-typenames.d.ts' />
/// <reference path='../../typings/tv4-via-typenames-node/tv4-via-typenames-node.d.ts' />


import fs                               = require('fs');
import path                             = require('path');
import json_file                        = require('json-file');
import tv4vtn                           = require('tv4-via-typenames');
import tv4vtnNode                       = require('tv4-via-typenames-node');




export class SchemaFiles {

    static DRAFT_SCHEMA_TYPENAME = tv4vtn.DRAFT_SCHEMA_TYPENAME;
    private static SCHEMA_FILENAME_REGEXP = '^([a-zA-Z0-9][-_a-zA-Z0-9]*).schema.json$';
    private static schemasDir: string;
    test: tv4vtnNode.TestFunctions;


    private static getSchemaFilenameFromTypename(typename : string) : string {
        return SchemaFiles.schemasDir + '/' + typename + ".schema.json";
    }


    private static getTypenameFromSchemaFilename(pathname : string) : string {
        var filename = path.basename(pathname);
        var m = filename.match(SchemaFiles.SCHEMA_FILENAME_REGEXP);
        return ((m != null) ? m[1] : null);
    }


    private readSchemaFileFromTypename(typename) : Promise<{filename: string, schema: tv4.JsonSchema}> {
        var filename = SchemaFiles.getSchemaFilenameFromTypename(typename);
        return json_file.readJSONFile(filename).then(
            (result) => {
                return {filename: result.filename, schema: result.contents}
            }
        )
    }

    // Find the types referenced by the schema for the given typenames.
    // All associated schema are registered.
    // @param query_typenames May be either a string, or an array of strings
    //   If an array, then the first typename is the main one.
    //
    loadRequiredSchema(query_typenames : any) : Promise<tv4vtn.LoadSchemaResultIndex> {
        return tv4vtn.loadRequiredSchema(query_typenames);
    }


    // Find the types referenced by the schema for the given typenames.
    // All associated schema are registered.
    // @param query_typenames May be either a string, or an array of strings
    //   If an array, then the first typename is the main one.
    //
    validate(typename, instance) : tv4.MultiResult {
        return tv4vtn.validate(typename, instance);
    }


    // This may only be created once.
    constructor(args: tv4vtnNode.Config) {
        SchemaFiles.schemasDir = args.schemasDir;
        let config : tv4vtn.SchemasConfig = {getSchemaFromTypename: this.readSchemaFileFromTypename};
        tv4vtn.configure(config);

        this.test = {
            getSchemaFilenameFromTypename: SchemaFiles.getSchemaFilenameFromTypename,
            getTypenameFromSchemaFilename: SchemaFiles.getTypenameFromSchemaFilename,
            hasSchema: this.hasSchema,
            getLoadedSchema: this.getLoadedSchema
        }
    }


    // This also loads the schema for the schema specification itself, if not already loaded.
    init() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let schema = tv4vtn.test.getLoadedSchema(SchemaFiles.DRAFT_SCHEMA_TYPENAME);
            if (schema) {
                resolve();
            } else {
                var promise = tv4vtn.loadSchemaDraftV4().then(
                    () => {
                        return;
                    }
                );
                resolve(promise);
            }
        })
    }


    private hasSchema(typename : string) : boolean {
        return tv4vtn.test.hasSchema(typename);
    }


    private getLoadedSchema(typename : string) : tv4.JsonSchema {
        return tv4vtn.test.getLoadedSchema(typename);
    }

}
