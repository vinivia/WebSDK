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
define([
    './LodashLight'
], function (_) {
    'use strict';

    var Assert = function() {

    };

    Assert.prototype.isObject = function isObject(obj, name) {
        var error = '"' + name + '" must be an object';

        if (!_.isObject(obj)) {
            throw new Error(error);
        }
    };

    Assert.prototype.isArray = function isArray(array, name) {
        var error = '"' + name + '" must be an array';

        if (!_.isArray(array)) {
            throw new Error(error);
        }
    };

    Assert.prototype.isString = function isString(string, name) {
        var error = '"' + name + '" must be a string';

        if (!_.isString(string)) {
            throw new Error(error);
        }
    };

    Assert.prototype.isBoolean = function isBoolean(bool, name) {
        var error = '"' + name + '" must be a string';

        if (!_.isBoolean(bool)) {
            throw new Error(error);
        }
    };

    Assert.prototype.isNumber = function isNumber(number, name) {
        var error = '"' + name + '" must be a number';

        if (!_.isNumber(number)) {
            throw new Error(error);
        }
    };

    Assert.prototype.isFunction = function isFunction(callback, name) {
        var error = '"' + name + '" must be a function';

        if (!_.isFunction(callback)) {
            throw new Error(error);
        }
    };

    Assert.prototype.stringNotEmpty = function stringNotEmpty(string, name) {
        var error = '"' + name + '" must not be empty';

        this.isString(string, name);

        if (string === '') {
            throw new Error(error);
        }
    };

    return new Assert();
});