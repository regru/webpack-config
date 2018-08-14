const validateSchema = require('webpack/lib/validateSchema');
const schema = require('webpack/schemas/webpackOptionsSchema');
const buildError = require('webpack/lib/WebpackOptionsValidationError');
const config = require('../webpack-base.config');

const testConfig = Object.assign( {}, config, {
    entry : {
        main : 'test.js',
    },
} );

describe( 'webpack config', function() {
    it( 'should pass schema test', function() {
        const result = validateSchema( schema, testConfig );



        if ( !( result && result.length ) ) {
            return;
        }

        throw new buildError( result );
    } );
} );