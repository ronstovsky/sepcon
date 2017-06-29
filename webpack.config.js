const webpack = require("webpack");
const env = process.env.WEBPACK_ENV;
let config = {};
if(env === 'dev') {
    config = require('./webpack.develop.config');
}
else {
    config = require('./webpack.production.config');
}
let globalModule = {
    preLoaders: [
        {
            test: /\.js$/, // include .js files
            exclude: /node_modules/, // exclude any and all files in the node_modules folder
            loader: "jshint-loader"
        }
    ],
    loaders: [
        {
            test: /\.css$/,
            loader: "style!css"
        },
        {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader'
        }
    ]
};
if(config.module) {
    if(config.module.loaders) {
        config.module.loaders = config.module.loaders.concat(globalModule.loaders);
    }
    else {
        config.module.loaders = globalModule.loaders;
    }
    if(config.module.preLoaders) {
        config.module.preLoaders = config.module.preLoaders.concat(globalModule.preLoaders);
    }
    else {
        config.module.preLoaders = globalModule.preLoaders;
    }
}
else {
    config.module = globalModule;
}

config.jshint = {
    esversion: 6,
    failOnHint: false,
    loopfunc: true,
};

config.devServer = {
    colors: true,
    hot: true,
    inline: true,
    progress: true,
    host: 'localhost',
    port: 3000,
    historyApiFallback: {
        index: 'index.html'
    }
};

module.exports = config;