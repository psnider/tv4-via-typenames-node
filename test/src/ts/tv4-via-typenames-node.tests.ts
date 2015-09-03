/// <reference path='../../../typings/chai/chai.d.ts' />
/// <reference path='../../../typings/tv4-via-typenames/tv4-via-typenames.d.ts' />
/// <reference path='../../../typings/tv4-via-typenames-node/tv4-via-typenames-node.d.ts' />
/// <reference path='../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../typings/node/node.d.ts' />



import chai                             = require('chai');
var expect                              = chai.expect;
import fs                               = require("fs");
import tv4vtn                           = require('tv4-via-typenames');
import tv4vtnNode                       = require('tv4-via-typenames-node');
import SchemaFiles                      = tv4vtnNode.SchemaFiles;




describe('tv4-via-typenames-node', function () {

    const SCHEMAS_DIR = './test/data/schemas';
    let schema_files;


    before(() => {
        schema_files = new SchemaFiles({schemasDir: SCHEMAS_DIR});
    });


    describe('init', function () {
        
        it("+ should load Draft-04 schema", function (done) {
            schema_files.init().then(
                () => {
                    expect(schema_files.hasSchema(SchemaFiles.DRAFT_SCHEMA_TYPENAME)).to.be.true;
                    done();
                },
                (error) => {done(error);}
            );
        });
        
    });


    describe('getSchemaFilenameFromTypename', function () {
        
        it("+ should get the filename for a typename's schema", function () {
            expect(schema_files.test.getSchemaFilenameFromTypename('A')).to.equal('./test/data/schemas/A.schema.json');
        });
        
    });


    describe('getTypenameFromSchemaFilename', function () {
        
        it("+ should get the filename for a typename's schema", function () {
            debugger
            expect(schema_files.test.getTypenameFromSchemaFilename('./test/data/schemas/A.schema.json')).to.equal('A');
        });
        
    });


    describe('loadRequiredSchema', function () {
                        
        it("+ should load a valid simple schema without references to other schema", function (done) {
            schema_files.loadRequiredSchema('UUID').then(
                (result : tv4vtn.LoadSchemaResultIndex) => {
                    expect(result).to.have.property('UUID');
                    let load_result = result['UUID'];
                    expect(load_result.typename).to.equal('UUID');
                    expect(load_result.referencedTypenames).to.be.empty;
                    done();
                },
                (error) => {
                    done(error);
                }
            );
        });
        
        
        it("+ should return an error for an invalid schema", function (done) {
            schema_files.loadRequiredSchema('test-invalid-type').then(
                (result : tv4vtn.LoadSchemaResultIndex) => {
                    done(new Error('test-invalid-type should have failed'));
                },
                (error) => {
                    expect(error.message).to.equal('Couldnt register typename=test-invalid-type');
                    done();
                }
            );
        });
        
        
        it("+ should not load an invalid schema", (done) => {
            expect(schema_files.hasSchema('test-invalid-type')).to.be.false;
            schema_files.loadRequiredSchema('test-invalid-type').then(
                (result : tv4vtn.LoadSchemaResultIndex) => {
                    done(new Error('test-invalid-type should have failed'));
                },
                (error) => {
                    expect(schema_files.hasSchema('test-invalid-type')).to.be.false;
                    done();
                }
            );
        });


        it("+ should return an error for a missing schema file", (done) => {
            schema_files.loadRequiredSchema('test-no-schema-file').then(
                (result : tv4vtn.LoadSchemaResultIndex) => {
                    done(new Error('test-invalid-type should have failed'));
                },
                (error) => {
                    expect(error.message).to.equal("ENOENT, open './test/data/schemas/test-no-schema-file.schema.json'");
                    done();
                }
            );
        });    

    });


    describe('validate', function () {

        it("+ should call tv4vtn.validate()", function () {
            let count = 0;
            const cached = tv4vtn.validate;
            {
                tv4vtn.validate = (typename: string, query: any) : tv4.MultiResult => {count++;  return null;}
                schema_files.validate('test-no-op', {});
                expect(count).to.equal(1);
            }
            tv4vtn.validate = cached;
        });
                
    });        

});


