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
const moment = require('moment');
const version = moment.utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
const environment = process.env.NODE_ENV;

console.log('Using version', version);

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-sed');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('default', []);
    grunt.registerTask('pack', ['uglify', 'zip']);
    grunt.registerTask('release-package-json', 'Parse package.json and output for release.', function() {
        const packageJson = grunt.file.readJSON('./package.json');

        delete packageJson.scripts;
        delete packageJson.dependencies;
        delete packageJson.engines;
        delete packageJson.devDependencies;

        grunt.file.write('dist/package.json', JSON.stringify(packageJson, null, 2));
    });
    grunt.registerTask('build', ['default', 'clean', 'copy:chrome-app', 'webpack', 'sed', 'pack', 'release-package-json']);

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
                pattern: '%VERSION%',
                replacement: version,
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
        webpack: {
            'phenix-web-sdk': {
                context: __dirname + '/src',
                entry: './web-sdk',
                externals: [
                    {
                        'phenix-rtc': true,
                        'protobuf': true,
                        'ByteBuffer': true
                    }
                ],
                output: {
                    libraryTarget: 'umd',
                    path: __dirname + '/dist',
                    filename: 'phenix-web-sdk.js'
                },
                resolve: {
                    modulesDirectories: ['3p', 'node_modules']
                }
            },
            'phenix-web-sdk-bundled': {
                context: __dirname + '/src',
                entry: './web-sdk',
                output: {
                    library: 'phenix-web-sdk',
                    libraryTarget: 'umd',
                    umdNamedDefine: true,
                    path: __dirname + '/dist',
                    filename: 'phenix-web-sdk-bundled.js'
                },
                resolve: {
                    alias: {
                        'fs': 'dummyFs.js',
                        'ByteBuffer': 'bytebuffer',
                        'Long': 'long'
                    },
                    modulesDirectories: ['3p', 'node_modules']
                }
            }
        },
        uglify: {
            minify: {
                files: {
                    'dist/phenix-web-sdk.min.js': ['dist/phenix-web-sdk.js'],
                    'dist/phenix-web-sdk-bundled.min.js': ['dist/phenix-web-sdk-bundled.js']
                }
            }
        }
    });
};
