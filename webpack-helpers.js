const path = require('path');

const { StatsWriterPlugin } = require('@regru/webpack-stats-plugin');
const safeDump = require('js-yaml').safeDump;

const CONFIG_FILTRES = { fonts: /\.(eot|woff(?:2)?|ttf)/ };

function getInitialModuleName( file ) {
    return path.basename( file ).replace( /\.[0-9a-f]{32}/, '' );
}

function checkModuleByMask( file ) {
    let isMatch = 0;

    for ( let mask of Object.keys( CONFIG_FILTRES ) ) {
        if ( CONFIG_FILTRES[ mask ].test( file ) ) {
            isMatch = 1;

            break;
        }
    }

    return isMatch;
}

module.exports = {
    getStatsWriterPlugin( project, options ) {
        return new StatsWriterPlugin( {
            filename : path.relative( options.output.path, `${process.cwd()}/config/frontend/${project}.yaml` ),
            fields   : [
                'assetsByChunkName',
                'assets',
            ],
            transform( source ) {
                const assets = source.assetsByChunkName;
                const chunks = {};
                const { publicPath } = options.output;
                let modules;

                for ( let chunkName of Object.keys( assets ) ) {
                    let files = assets[chunkName];

                    if ( !Array.isArray( files ) ) {
                        chunks[chunkName] = {
                            [path.extname( files ).replace( '.', '' )] : path.join( publicPath, files ),
                        };

                        continue;
                    }

                    chunks[chunkName] = assets[chunkName].reduce( ( result, file ) => {
                        if ( !file.match( chunkName ) ) {
                            return result;
                        }

                        result[ path.extname( file ).replace( '.', '' ) ] = path.join( publicPath, file );

                        return result;
                    }, {} );
                }

                modules = source.assets.reduce( ( result, moduleInfo ) => {
                    const file = moduleInfo.name;

                    if ( !checkModuleByMask( file ) ) {
                        return result;
                    }

                    result[ getInitialModuleName( file ) ] = path.join( publicPath, file );

                    return result;
                }, {} );

                return safeDump( {
                    '@default' : {
                        chunks,
                        modules,
                    },
                } ).replace( '\'@default\'', '@default' );
            },
        } );
    },
};
