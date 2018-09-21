const path = require('path');

const glob = require('glob');
const readYaml = require('read-yaml');
const ExtractTextPlugin = require('@regru/extract-text-webpack-plugin');
const { DefinePlugin } = require('webpack');
const ShakePlugin = require('webpack-common-shake').Plugin;
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const imageLoadersList = require('./imageLoadersList');
const svgLoadersList = require('./svgLoadersList');

const LEVELS       = glob.sync('bem/blocks*').map( level => path.resolve( `./${level}` ) );
const isProduction = process.env.NODE_ENV === 'production';
const isDevServer  = process.argv.reduce( ( prev, arg ) => prev + arg.includes('webpack-dev-server'), 0 );
const rootPath     = absolutePath();

function absolutePath( ...dirs ) {
    return path.join( process.cwd(), ...dirs );
}

module.exports = {
    resolve : {

        modules : [
            ...LEVELS,
            path.resolve('./assets'),
            path.resolve('./bem/apps'),
            path.resolve('./node_modules'),
            path.resolve('./bower_components'),
        ],

        alias : {
            dictionary : absolutePath('assets/locales'),
            zoneinfo   : absolutePath('config/zoneinfo'),
            modernizr$ : absolutePath('.modernizrrc'),
            jQuery$    : 'jquery',
            vue$       : 'vue/dist/vue.esm.js',
        },
    },

    module : {
        rules : [
            {
                test : /\.(bemdecl|deps)\.js$/,
                use  : [
                    {
                        loader  : '@regru/bem-loader',
                        options : {
                            bem : {
                                levels     : LEVELS,
                                extensions : [
                                    'deps.js',
                                    'coffee',
                                    'less',
                                    'css',
                                    'babel.js',
                                    'js',
                                ],
                            },
                        },
                    },
                ],
            },

            {
                test   : /\.coffee$/,
                loader : 'coffee-loader',
            },

            {
                test    : /\.js$/,
                exclude : [
                    /(deps|bemdecl)\.js$/,
                    /bower_components/,
                    /node_modules(?!\/(cloudvps-panel|frontend-components))/,
                ],
                use : [ 'babel-loader' ],
            },

            {
                test    : /\.(?:jade|pug)$/,
                exclude : /\.example\.jade$/,
                use     : [
                    'babel-loader',
                    {
                        loader  : 'pug-loader',
                        options : {
                            self : true,
                        },
                    },
                ],
            },

            {
                test   : /\.less$/,
                loader : ExtractTextPlugin.extract( {
                    use : [
                        {
                            loader  : 'css-loader',
                            options : {
                                minimize      : isProduction,
                                importLoaders : 2,
                            },
                        },
                        'postcss-loader',
                        'less-loader',
                    ],
                } ),
            },

            {
                test   : /\.css$/,
                loader : ExtractTextPlugin.extract( {
                    use : [
                        {
                            loader  : 'css-loader',
                            options : {
                                minimize      : isProduction,
                                importLoaders : 1,
                            },
                        },
                        'postcss-loader',
                    ],
                } ),
            },

            {
                test : /\.svg$/,
                use  : svgLoadersList( 1, isProduction << 1 | isDevServer, rootPath ),
            },

            {
                test : /\.(png|jpe?g|gif|ico)$/,
                use  : imageLoadersList( 0, isProduction << 1 | isDevServer, rootPath ),
            },

            {
                test    : /\.(ttf|eot|woff|woff2)$/,
                loaders : [
                    'file-loader?name=[name].[hash].[ext]',
                ],
            },

            {
                test    : /\.swf$/,
                loaders : [
                    'file-loader?name=[name].[ext]',
                ],
            },

            {
                test : /\.yaml$/,
                use  : [
                    {
                        loader  : '@regru/dict-loader',
                        options : {
                            babelfish : {
                                fallback      : 'ru',
                                testNamespace : /^([\w-]+)\.js/,
                                testLocale    : /([a-z]{2})_[A-Z]{2}\.\w+/,
                            },

                            typograf : {

                                // htmlEntity : { type: 'name' },
                                rules : {
                                    disabled : [
                                        'common/space/afterPunctuation',
                                        'ru/space/afterPunctuation',
                                        'common/space/bracket',
                                        'common/space/delRepeatSpace',
                                        'ru/other/phone-number',
                                    ],
                                },
                            },

                            markdown : { html: true },

                            bemFilters : getFilters(),
                        },
                    },
                    'yaml-loader',
                ],
            },

            {
                test    : /\.modernizrrc$/,
                loaders : [
                    'modernizr-loader',
                    'json-loader',
                ],
            },

            {
                test : /\.vue$/,
                use  : [
                    {
                        loader  : 'vue-loader',
                    },
                ],
            },

            {
                test    : /\.(graphql|gql)$/,
                loaders : [
                    'graphql-tag/loader',
                ],
            },
        ],
    },

    devtool : isProduction ? 'source-map' : 'cheap-eval-source-map',

    stats : 'errors-only',
};

module.exports.plugins = [

    new VueLoaderPlugin(),

    new ExtractTextPlugin( {
        filename  : isProduction ? '[name].[contenthash].css' : '[name].css',
        allChunks : true,
    } ),

    new DefinePlugin( { 'process.env': { NODE_ENV: `"${process.env.NODE_ENV}"` } } ),
];

if ( isProduction ) {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin( {
            warnings : false,
            comments : false,
            compress : {
                drop_console  : true,
                drop_debugger : true,
            },
        } ),

        new CompressionPlugin( {
            asset     : '[path].gz',
            algorithm : 'gzip',
            test      : /\.js$|\.css$/,
            threshold : 10240, // eslint-disable-line no-magic-numbers
            minRatio  : 0.8, // eslint-disable-line no-magic-numbers
        } ),

        new ShakePlugin(),
    );
}

function getFilters() {
    let filters = [];
    let files;

    try {
        files = glob.sync('config/bem/*.yaml');
        for ( let file of files ) {
            filters.push( { [path.basename( file, '.yaml' )]: readYaml.sync( file ) } );
        }
    }
    catch ( e ) {
        console.error( e );
    }

    return filters;
}
