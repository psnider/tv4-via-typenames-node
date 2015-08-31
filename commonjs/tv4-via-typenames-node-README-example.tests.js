/// <reference path='../../../typings/chai/chai.d.ts' />
/// <reference path='../../../typings/tv4-via-typenames/tv4-via-typenames.d.ts' />
/// <reference path='../../../typings/tv4-via-typenames-node/tv4-via-typenames-node.d.ts' />
/// <reference path='../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../typings/node/node.d.ts' />
var chai = require('chai');
var expect = chai.expect;
var tv4vtnNode = require('tv4-via-typenames-node');
var SchemaFiles = tv4vtnNode.SchemaFiles;
describe('example from README.md', function () {
    it("+ should determine validatity of typed data instances", function (done) {
        function main() {
            var succeeded = true;
            var validity = schema_files.validate('ASHBC', 'hello');
            expect(validity.valid).to.be.true;
            if (validity.valid != true) {
                succeeded = false;
                console.log('should be false, but validity.valid=' + validity.valid);
            }
            validity = schema_files.validate('ASHBC', { hello: 'hello' });
            expect(validity.valid).to.be.false;
            if (validity.valid != false) {
                succeeded = false;
                console.log('should be false, but validity.valid=' + validity.valid);
            }
            if (succeeded) {
                console.log('The validity checks worked as expected!');
            }
        }
        var schema_files = new SchemaFiles({ schemasDir: './test/data/schemas' });
        var init_promise = schema_files.init();
        var schemas_ready_promise = init_promise.then(function (result) {
            return schema_files.loadRequiredSchema(['Person', 'ASHBC']);
        });
        schemas_ready_promise.then(function (result) {
            main();
            done();
        }, function (error) {
            console.log('Couldnt load your schemas. error.message=' + error.message);
            done(error);
            throw error;
        });
    });
});
