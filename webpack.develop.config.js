const webpack = require("webpack");

module.exports = {
    entry: {
        sepcon: ['./src/index.js'],
        example: ['./app/index.js'],
        tests: ['./test/tests.js']
    },
    output: {
        path: '/app',
        publicPath: '/',
        filename: '[name].js',
    },
    devtool: 'source-map',

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
};