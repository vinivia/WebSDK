/**
 * Copyright 2019 Phenix Real Time Solutions, Inc. All Rights Reserved.
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
const path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const assert = require('phenix-web-assert/dist/phenix-web-assert.min');
const assertNames = '^' + Object.keys(assert.__proto__).join('$|^') + '$';
const uglifyManglePropRegex = new RegExp('^_[^_].*' + '|^global$|' + assertNames);
const distDir = path.resolve(__dirname, './dist');

var baseConfig = {
    mode: 'production',
    target: 'web',
    output: {
        path: distDir,
        library: 'phenix-web-sdk',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    plugins: [new CaseSensitivePathsPlugin()],
    resolve: {
        alias: { // Webpack issue - alias libraries used in self and dependent libraries to avoid duplication in bundle
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
            'phenix-web-reconnecting-web-socket': path.resolve(__dirname, 'node_modules', 'phenix-web-reconnecting-web-socket'),
            'phenix-web-player': path.resolve(__dirname, 'node_modules', 'phenix-web-player', 'dist', 'phenix-web-player.min'),
            'phenix-web-detect-browser': path.resolve(__dirname, 'node_modules', 'phenix-web-detect-browser'),
            'phenix-web-application-activity-detector': path.resolve(__dirname, 'node_modules', 'phenix-web-application-activity-detector')
        }
    },
    performance: {hints: false}
};

var normalConfig = {entry: path.join(__dirname, 'src', 'web-sdk.js')};
var lightConfig = {
    entry: path.join(__dirname, 'src', 'web-sdk-light.js'),
    resolve: {
        alias: {
            './protocol/chatProto.json': path.resolve(__dirname, 'src', 'sdk/protocol/shimProto.json'),
            'phenix-rtc': path.resolve(__dirname, 'node_modules', 'phenix-rtc/dist/phenix-rtc-no-edge.min'),
            'phenix-web-player': path.resolve(__dirname, 'src', 'playerShim')
        }
    }
};

var webSdkConfigs = [{
    devtool: 'source-map',
    output: {filename: 'phenix-web-sdk.js'},
    resolve: {alias: {'phenix-rtc': path.resolve(__dirname, 'node_modules', 'phenix-rtc/dist/phenix-rtc.min')}},
    optimization: {minimize: false}
}, {
    output: {filename: 'phenix-web-sdk.min.js'},
    resolve: {alias: {'phenix-rtc': path.resolve(__dirname, 'node_modules', 'phenix-rtc/dist/phenix-rtc.min')}},
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    mangle: {properties: {regex: uglifyManglePropRegex}},
                    output: {beautify: false},
                    compress: {passes: 2}
                }
            })
        ]
    }
}];
var reactNativeSdkConfigs = [{
    devtool: 'source-map',
    output: {filename: 'phenix-web-sdk-react-native.js'},
    resolve: {alias: {'phenix-rtc': path.resolve(__dirname, 'node_modules', 'phenix-rtc/dist/phenix-rtc-react-native.min')}},
    optimization: {minimize: false}
}, {
    output: {filename: 'phenix-web-sdk-react-native.min.js'},
    resolve: {alias: {'phenix-rtc': path.resolve(__dirname, 'node_modules', 'phenix-rtc/dist/phenix-rtc-react-native.min')}},
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    mangle: {properties: {regex: uglifyManglePropRegex}},
                    output: {beautify: false},
                    compress: {passes: 2}
                }
            })
        ]
    }
}];
var nodeConfigs = [merge(baseConfig, {
    target: 'node',
    entry: path.join(__dirname, 'src', 'node-sdk.js'),
    output: {filename: 'phenix-node-sdk.js'},
    resolve: {alias: {'phenix-rtc': path.resolve(__dirname, 'node_modules', 'phenix-rtc/dist/phenix-rtc')}},
    optimization: {minimize: false}
})];

var normalConfigs = webSdkConfigs.concat(reactNativeSdkConfigs).map(function(config) {
    return merge(baseConfig, config, normalConfig);
});
var lightConfigs = webSdkConfigs.map(function(config) {
    config = merge(baseConfig, config, lightConfig);

    config.output.filename = config.output.filename.replace('phenix-web-sdk', 'phenix-web-sdk-light');

    return config;
});

module.exports = normalConfigs.concat(lightConfigs).concat(nodeConfigs);