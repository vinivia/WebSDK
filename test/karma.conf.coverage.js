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

var browsers = [ 'Chrome' ];

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '..',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'requirejs'],


        // list of files / patterns to load in the browser
        files: [
            {pattern: '3p/**/*.js', included: false},
            {pattern: 'src/**/*.js', included: false},
            {pattern: 'test/**/When*.js', included: false},
            {pattern: 'test/mock/*.js', included: false},
            'test/test-runner.js'
        ],


        // list of files to exclude
        exclude: [
            'src/main.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/*.js': ['coverage'],
            'test/**/When*.js': ['env']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],


        coverageReporter: {
            dir: 'coverage',
            reporters: [
                {type: 'json', subdir: '.'},
                {type: 'html', subdir: '.'},
                {type: 'lcov', subdir: '.'},
                {type: 'teamcity'},
                {type: 'text-summary'}
            ]
        },


        // web server port
        port: 9877,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
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
