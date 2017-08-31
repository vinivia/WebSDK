/**
 * Copyright 2017 PhenixP2P Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global __dirname module */
var webpack = require('webpack');
var path = require('path');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

var configs = [{
    entry: path.join(__dirname, 'src', 'web-sdk.js'),
    devtool: 'source-map',
    target: 'web',
    output: {
        path: './dist',
        filename: 'phenix-web-sdk.js',
        library: 'phenix-web-sdk',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    plugins: [
        new webpack.DefinePlugin({'process.env': {'NODE_ENV': JSON.stringify('production')}}),
        new CaseSensitivePathsPlugin()
    ],
    resolve: {
        alias: { // Webpack issue - alias libraries used in self and dependent libraries to avoid duplication in bundle
            'phenix-rtc': path.resolve(__dirname, 'node_modules', 'phenix-rtc/dist/phenix-rtc.min'),
            'phenix-web-lodash-light': path.resolve(__dirname, 'node_modules', 'phenix-web-lodash-light'),
            'phenix-web-assert': path.resolve(__dirname, 'node_modules', 'phenix-web-assert'),
            'phenix-web-batch-http': path.resolve(__dirname, 'node_modules', 'phenix-web-batch-http'),
            'phenix-web-logging': path.resolve(__dirname, 'node_modules', 'phenix-web-logging'),
            'phenix-web-disposable': path.resolve(__dirname, 'node_modules', 'phenix-web-disposable'),
            'phenix-web-event': path.resolve(__dirname, 'node_modules', 'phenix-web-event'),
            'phenix-web-http': path.resolve(__dirname, 'node_modules', 'phenix-web-http'),
            'phenix-web-proto': path.resolve(__dirname, 'node_modules', 'phenix-web-proto'),
            'phenix-web-network-connection-monitor': path.resolve(__dirname, 'node_modules', 'phenix-web-network-connection-monitor'),
            'phenix-web-observable': path.resolve(__dirname, 'node_modules', 'phenix-web-observable'),
            'phenix-web-reconnecting-web-socket': path.resolve(__dirname, 'node_modules', 'phenix-web-reconnecting-web-socket')
        }
    }
}];

module.exports = configs;