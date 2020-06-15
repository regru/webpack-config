const MAX_DATA_URL_LEN = 1;

const urlLoader = {
    loader  : 'svg-url-loader',
    options : {
        name  : '[name].[ext]',
        limit : MAX_DATA_URL_LEN,
    },
};
const imgLoader = {
    loader  : '@regru/img-loader',
    options : {
        enabled  : true,
        gifsicle : false,
        mozjpeg  : false,
        optipng  : false,
        pngquant : false,
        svgo     : {
            plugins : [
                { removeTitle: true },
                { cleanupAttrs: true },
                { cleanupEnableBackground: true },
                { cleanupIDs: true },
                { cleanupNumericValues: true },
                { collapseGroups: true },
                { convertColors: true },
                { mergePaths: true },
                { convertShapeToPath: true },
                { convertStyleToAttrs: true },
                { convertTransform: true },
                { moveElemsAttrsToGroup: true },
                { moveGroupAttrsToElems: true },
                { removeComments: true },
                { removeDesc: true },
                { removeDoctype: true },
                { removeEditorsNSData: true },
                { removeEmptyAttrs: true },
                { removeEmptyContainers: true },
                { removeEmptyText: true },
                { removeHiddenElems: true },
                { removeMetadata: true },
                { removeNonInheritableGroupAttrs: true },
                { removeUnknownsAndDefaults: true },
                { removeUnusedNS: true },
                { removeUselessStrokeAndFill: true },
                { removeXMLProcInst: true },
                { convertPathData: false },
            ],
        },
    },
};

function getLoadersList( withOptimizers, env, context ) {
    const isProductionBuild = 2;
    const isDevBuild = 0;
    const isDevServer = 1;

    switch ( env ) {
        case isProductionBuild:
        case isDevBuild:
        default:
            urlLoader.options.name = '[name].[hash].[ext]';

            if ( withOptimizers ) {
                return [
                    urlLoader,
                    imgLoader,
                ];
            }

            return [
                urlLoader,
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
