/// <reference path='../../typings/tv4-via-typenames-node/tv4-via-typenames-node.d.ts' />
/// <reference path='../../typings/tv4-via-typenames/tv4-via-typenames.d.ts' />
/// <reference path='../../typings/node/node.d.ts' />
/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />


import fs                               = require('fs');
import path                             = require('path');
import tv4vtn                           = require('tv4-via-typenames');
import tv4vtnNode                       = require('tv4-via-typenames-node');



// TODO: find proper home for this general function
function readJSONFile(filename : string) : Promise<{filename: string, obj: any}> {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, {"encoding": "utf-8"}, (error, data) => {
            if (error) {
                reject(error);
            } else {
                try {
                    var obj = JSON.parse(data);
                    resolve({filename: filename, obj: obj});
                }
                catch (error) {
                    reject(error);
                }
            }
        });
    });
}



export class SchemaFiles {

    static DRAFT_SCHEMA_TYPENAME = tv4vtn.DRAFT_SCHEMA_TYPENAME;
    private static SCHEMA_FILENAME_REGEXP = '^([a-zA-Z0-9][-_a-zA-Z0-9]*).schema.json$';
    private static schemasDir: string;


    static getSchemaFilenameFromTypename(typename : string) : string {
        return SchemaFiles.schemasDir + '/' + typename + ".schema.json";
    }


    static getTypenameFromSchemaFilename(pathname : string) : string {
        var filename = path.basename(pathname);
        var m = filename.match(this.SCHEMA_FILENAME_REGEXP);
        return ((m != null) ? m[1] : null);
    }


    readSchemaFileFromTypename(typename) : Promise<{filename: string, schema: tv4vtn.ISchema}> {
        var filename = SchemaFiles.getSchemaFilenameFromTypename(typename);
        return readJSONFile(filename).then(
            (result) => {
                return {filename: result.filename, schema: result.obj};
            },
            // without this onRejected handler, the rejection doesn't get passed to the caller!
            (error) => {
                throw error;
            }
        );
    }
    
    // Find the types referenced by the schema for the given typenames.
    // All associated schema are registered.
    // @param query_typenames May be either a string, or an array of strings
    //   If an array, then the first typename is the main one.
    //
    loadRequiredSchema(query_typenames : any) : Promise<tv4vtn.ILoadSchemaResultIndex> {
        return tv4vtn.loadRequiredSchema(query_typenames);
    }


    // Find the types referenced by the schema for the given typenames.
    // All associated schema are registered.
    // @param query_typenames May be either a string, or an array of strings
    //   If an array, then the first typename is the main one.
    //
    validate(typename, instance) : TV4MultiResult {
        return tv4vtn.validate(typename, instance);
    }


    // This may only be created once.
    constructor(args: tv4vtnNode.IConfig) {
        SchemaFiles.schemasDir = args.schemasDir;
        let config : tv4vtn.ISchemasConfig = {getSchemaFromTypename: this.readSchemaFileFromTypename};
        tv4vtn.configure(config);
    }
        

    // This also loads the schema for the schema specification itself, if not already loaded.
    init() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let schema = tv4vtn.getLoadedSchema(SchemaFiles.DRAFT_SCHEMA_TYPENAME);
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


    hasSchema(typename : string) : boolean {
        return tv4vtn.hasSchema(typename);
    }


    getLoadedSchema(typename : string) : tv4vtn.ISchema {
        return tv4vtn.getLoadedSchema(typename);
    }

}

