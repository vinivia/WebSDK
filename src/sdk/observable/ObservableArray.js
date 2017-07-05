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
    '../LodashLight',
    '../assert',
    './Observable'
], function (_, assert, Observable) {
    'use strict';

    function ObservableArray(initialValues, beforeChange) {
        var valuesToSet = initialValues;

        if (valuesToSet === undefined || valuesToSet === null) {
            valuesToSet = [];
        }

        assert.isArray(valuesToSet);

        this.observableArray = new Observable(valuesToSet, beforeChange);
    }

    ObservableArray.prototype.getValue = function getValue() {
        return this.observableArray.getValue();
    };

    ObservableArray.prototype.setValue = function setValue(values) {
        if (values === undefined || values === null) {
            values = [];
        }

        if (values !== undefined) {
            assert.isArray(values);
        }

        return this.observableArray.setValue(values);
    };

    ObservableArray.prototype.subscribe = function subscribe(callback, options) {
        return this.observableArray.subscribe(callback, options);
    };

    ObservableArray.prototype.push = function push(value) {
        var array = this.observableArray.getValue();
        array.push(value);

        this.observableArray.setValue(array);
    };

    ObservableArray.prototype.pop = function pop() {
        var array = this.observableArray.getValue();
        var value = array.pop();

        this.observableArray.setValue(array);

        return value;
    };

    ObservableArray.prototype.remove = function remove(valueOrFunction) {
        var array = this.observableArray.getValue();

        var filterFunction = function (value) {
            return _.isFunction(valueOrFunction) ? valueOrFunction(value) : value === valueOrFunction;
        };

        var valuesToRemove = _.filter(array, filterFunction);

        if (valuesToRemove.length > 0) {
            this.observableArray.setValue(_.remove(array, filterFunction));
        }

        return valuesToRemove;
    };

    ObservableArray.prototype.removeAll = function removeAll() {
        var array = this.observableArray.getValue();

        this.observableArray.setValue([]);

        return array;
    };

    ObservableArray.prototype.extend = function extend(options) {
        this.observableArray.extend(options);

        return this;
    };

    return ObservableArray;
});