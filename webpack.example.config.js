/**
 * Copyright 2018 PhenixP2P Inc. All Rights Reserved.
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
const webpack = require('webpack');
const path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const appDir = path.join(__dirname, './example');
const distDir = path.join(__dirname, './dist');

var configs = [{
    entry: path.join(appDir, 'get-user-media-app.js'),
    devtool: 'source-map',
    target: 'web',
    output: {
        path: path.join(distDir, 'workflow-example'),
        filename: 'get-user-media-app-bundled.js'
    },
    plugins: [
        new CleanWebpackPlugin([path.join(distDir, 'workflow-example')]),
        new webpack.DefinePlugin({'window.BUILD_ENV': JSON.stringify('webpack')}),
        new CaseSensitivePathsPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(appDir, 'GetUserMediaWorkflowDemo.html'),
            inject: true
        }),
        new ExtractTextPlugin("styles.css")
    ],
    module: {
        rules: [{
            test: /\.(eot|woff|woff2|svg|ttf|mp4)([?]?.*)$/,
            use: [
                {
                    loader: 'file-loader?' + JSON.stringify({
                        name: '[hash].[ext]',
                        prefixize: true
                    })
                }
            ]
        },
        {
            test: /\.png$/,
            use: ['url-loader?limit=100000']
        },
        {
            test: /\.(jpg|jpeg)$/,
            use: [
                {
                    loader: 'file-loader?name=[name].[ext]',
                    query: {useRelativePath: true}
                }
            ]
        },
        {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader"
            })
            // Use: ['style-loader', 'css-loader']
        }
        ]
    },
    resolve: {
        alias: {
            'phenix-web-sdk': path.join(distDir, 'phenix-web-sdk.js'),
            'video-player': path.join(appDir, 'player.js'),
            'app-setup': path.join(appDir, 'app-setup.js')
        }
    },
    optimization: {minimize: true}
}];

module.exports = configs;