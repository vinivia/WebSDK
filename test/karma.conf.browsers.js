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

/* global process module */

var browsers = [];
var isWin = /^win/.test(process.platform);
var isOSX = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);

if (isWin) {
    browsers.push('IE');
    // Browsers.push('Safari');
}

if (isOSX) {
    browsers.push('Safari');
}

if (isWin || isOSX) {
    // Browsers.push('ChromeCanary');
}

if (isLinux) {
    browsers.push('Chrome');
}

module.exports = function (config) {
    config.set({

        // Base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '..',

        // Frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'requirejs'],

        // List of files / patterns to load in the browser
        files: [
            {
                pattern: '3p/**/*.js',
                included: false
            },
            {
                pattern: 'src/**/*.js',
                included: false
            },
            {
                pattern: 'test/**/When*.js',
                included: false
            },
            {
                pattern: 'test/mock/*.js',
                included: false
            },
            'test/test-runner.js'
        ],

        // List of files to exclude
        exclude: [
            'src/main.js'
        ],

        // Preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {'test/**/When*.js': ['env']},

        // Test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // Web server port
        port: 9875,

        // Enable / disable colors in the output (reporters and logs)
        colors: true,

        // Level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // Enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: browsers,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Variables to process with the environment preprocessor
        envPreprocessor: [
            'PHENIX_APPLICATION_ID',
            'PHENIX_SECRET'
        ]
    });
};