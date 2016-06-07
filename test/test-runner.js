/**
 * Copyright 2016 PhenixP2P Inc. All Rights Reserved.
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
'use strict';

var tests = [];
var TEST_REGEXP = /\/When[^\/].*\.js$/i;

var pathToModule = function(path) {
    return '../' + path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        // Normalize paths to RequireJS module names.
        tests.push(pathToModule(file));
    }
});

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base/src/',

    shim: {
    },

    paths: {
        bluebird: '../3p/bluebird/js/browser/bluebird',
        bowser: '../3p/bowser/src/bowser',
        bytebuffer: '../3p/bytebuffer/dist/ByteBufferAB',
        'chai': '../3p/chai/chai',
        'chai-as-promised': '../3p/chai-as-promised/lib/chai-as-promised',
        jquery: '../3p/jquery/dist/jquery.min',
        lodash: '../3p/lodash/dist/lodash.min',
        long: '../3p/long/dist/long',
        'phenix-rtc': '../3p/phenix-rtc/dist/phenix-rtc',
        protobuf: '../3p/protobuf/dist/ProtoBuf',
        'sinon': '../3p/sinon/lib/sinon',
        'sinon-chai': '../3p/sinon-chai/lib/sinon-chai',
        ByteBuffer: '../3p/bytebuffer/dist/ByteBufferAB',
        Long: '../3p/long/dist/long'
    },

    map: {
        '*': {
            'phenix-web-sdk': 'main',
            Promise: 'bluebird'
        }
    },

    // dynamically load all test files
    deps: tests,

    // start test run, once Require.js is done
    callback: function () {
        require([
            'lodash',
            'chai',
            'chai-as-promised',
            'sinon',
            'sinon-chai'
        ], function (_, chai, chaiAsPromised, sinon, sinonChai) {
            'use strict';

            chai.use(chaiAsPromised);
            chai.use(sinonChai);
            chai.should();

            // Use lodash.bind to support environments that don't support function.bind
            chaiAsPromised.transferPromiseness = function (assertion, promise) {
                assertion.then = _.bind(promise.then, promise);
            };

            window.expect = chai.expect;
            window.sinon = sinon;
            window.requirejs = require;

            window.__karma__.start();
        });
    }
});
