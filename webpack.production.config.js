const webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    entry: {
        sepcon: './src/index.js'
    },
    output: {
        path: __dirname+'/dist',
        publicPath: './',
        filename: '[name].js',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    target: 'web',
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false,
            },
        }),
        new webpack.BannerPlugin('   < SepCon />.JS    '+new Date().toString()+'\n'+
            'Derived from the separation of concerns (SoC) design principle,\n' +
            'influenced by Flux and MVVM architectures.\n' +
            '\nContributed by Ron Rostovsky', { entryOnly: true }),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.html$/,
            threshold: 10240,
            minRatio: 0.8
        }),

    ],
    module: {
        loaders: [
            { test: /\.js$/, loader: "webpack-strip?strip[]=debug,strip[]=console.log,strip[]=console.info" }
        ]
    }
};