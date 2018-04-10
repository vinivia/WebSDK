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
/* global process module */
const moment = require('moment');
const sdkVersion = moment.utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
const releaseVersion = require('./package.json').version;
const environment = process.env.NODE_ENV;
const webpackConfigs = require('./webpack.config');

console.log('Using version', sdkVersion);

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-sed');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('default', []);
    grunt.registerTask('pack', ['zip']);
    grunt.registerTask('build', ['default', 'clean', 'copy:chrome-app', 'webpack', 'sed', 'pack']);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['build'],
        copy: {
            'chrome-app': {
                files: [
                    {
                        expand: true,
                        cwd: 'src/chrome/',
                        src: ['**'],
                        dest: 'dist/pcast-screen-sharing'
                    }
                ]
            }
        },
        sed: {
            version: {
                pattern: '%SDKVERSION%',
                replacement: sdkVersion,
                recursive: true,
                path: 'dist'
            },
            releaseVersion: {
                pattern: '%RELEASEVERSION%',
                replacement: releaseVersion,
                recursive: true,
                path: 'dist'
            },
            environment: {
                pattern: '%ENVIRONMENT%',
                replacement: environment || 'production',
                recursive: true,
                path: 'dist'
            }
        },
        zip: {
            'dist/pcast-chrome-app.zip': {
                cwd: 'dist/pcast-screen-sharing/',
                src: ['dist/pcast-screen-sharing/**'],
                dest: 'dist/pcast-screen-sharing.zip'
            }
        },
        webpack: webpackConfigs
    });
};