const JPEG_QUALITY = 93;
const fileLoader = {
    loader  : 'file-loader',
    options : { name: '[name].[ext]' },
};
const imgLoader = {
    loader  : '@regru/img-loader',
    options : {
        enabled : false, // ivan.sobolev у меня не получается наладить
        // Module build failed: Error: spawn /www/srs/node_modules/mozjpeg/vendor/cjpeg ENOENT
        mozjpeg : {
            quality     : JPEG_QUALITY,
            progressive : true,
            arithmetic  : false,
        },
        optipng : false,
    },
};

function getLoadersList( withOptimizers, env, context ) {
    const isProductionBuild = 2;
    const isDevBuild = 0;
    const isDevServer = 1;

    switch ( env ) {
        case isProductionBuild:
            fileLoader.options.name = '[name].[hash].[ext]';

            if ( withOptimizers ) {
                return [
                    fileLoader,
                    imgLoader,
                ];
            }

            return [ fileLoader ];

        case isDevBuild:
        default:
            if ( withOptimizers ) {
                return [
                    fileLoader,
                    imgLoader,
                ];
            }

            return [
                fileLoader,
            ];

        case isDevServer:
            return [
                {
                    loader  : '@regru/img-dev-loader',
                    options : {
                        context : context,
                        prefix  : process.env.IMG_DEV_LOADER_URL_PREFIX || '',
                    },
                },
            ];
    }
}

module.exports = getLoadersList;
