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
], function () {
    'use strict';

    var _ = function() {

    };

    _.bind = function bind(callback, that) {
        var argsAfterContext = Array.prototype.slice.call(arguments, 2);

        return function boundFunction() {
            if (!_.isFunction(callback)) {
                throw new TypeError('_.bind - callback must be a function');
            }

            var combinedArguments = argsAfterContext.concat(Array.prototype.slice.call(arguments));

            return callback.apply(that, combinedArguments);
        };
    };

    _.now = function now() {
        return new Date().getTime();
    };

    _.utc = function utc(date) {
        if (_.isNumber(date)) {
            return date;
        }

        return Math.floor(date);
    };

    _.isoString = function isoString() {
        var now = new Date();

        if (now.toISOString) {
            return now.toISOString();
        }

        return now.getUTCFullYear() +
            '-' + _.pad(now.getUTCMonth() + 1, 2) +
            '-' + _.pad(now.getUTCDate(), 2) +
            'T' + _.pad(now.getUTCHours(), 2) +
            ':' + _.pad(now.getUTCMinutes(), 2) +
            ':' + _.pad(now.getUTCSeconds(), 2) +
            '.' + (now.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
            'Z';
    };

    _.map = function map(collection, callback) {
        if (!_.isObject(collection)) {
            throw new Error('Collection must be an object or array.');
        }

        var newArray = [];

        if (collection.constructor === Array) {
            _.forEach(collection, function mapCollection(item, index) {
                if (_.isString(callback) && _.isObject(item)) {
                    newArray.push(item[callback]);
                } else if (_.isFunction(callback)) {
                    newArray.push(callback(item, index));
                }
            });
        } else {
            _.forOwn(collection, function mapCollection(value, key) {
                if (_.isFunction(callback)) {
                    newArray.push(callback(value, key));
                }
            });
        }

        return newArray;
    };

    _.values = function (collection) {
        if (!_.isObject(collection) || _.isArray(collection)) {
            throw new Error('Collection must be an object.');
        }

        return _.map(collection, function (value) {
            return value;
        });
    };

    _.keys = function (collection) {
        if (!_.isObject(collection) || _.isArray(collection)) {
            throw new Error('Collection must be an object.');
        }

        return _.map(collection, function (value, key) {
            return key;
        });
    };

    _.forEach = function forEach(collection, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('Callback must be a function');
        }

        assertIsArray(collection);

        for (var i = 0; i < collection.length; i++) {
            callback(collection[i], i);
        }
    };

    _.forOwn = function forOwn(objectWithProperties, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('Callback must be a function');
        }

        if (!_.isObject(objectWithProperties)) {
            throw new Error('objectWithProperties must be an object.');
        }

        var keys = Object.keys(objectWithProperties);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            if (objectWithProperties.hasOwnProperty(key)) {
                callback(objectWithProperties[key], key);
            }
        }
    };

    _.argumentsToArray = function(args) {
        if (!_.isObject(args) || !args.length) {
            throw new Error('Collection must be arguments');
        }

        var collection = [];

        for (var i = 0; i < args.length; i++) {
            collection.push(args[i]);
        }

        return collection;
    };

    _.assign = function assign(target) {
        if (!_.isObject(target)) {
            throw new Error('target must be object');
        }

        var sources = _.argumentsToArray(arguments);

        sources.shift();

        _.forEach(sources, function(source, index) {
            if (!_.isObject(source)) {
                throw new Error('source ' + index + ' must be object');
            }

            _.forOwn(source, function(value, key) {
                target[key] = value;
            });
        });

        return target;
    };

    _.includes = function includes(collection, value) {
        if (!_.isObject(collection)) {
            throw new Error('collection type not supported. Collection must be an array or object.');
        }

        var hasValue = false;

        var checkCollection = function checkCollection(currentValue) {
            if (currentValue === value) {
                hasValue = true;
            }
        };

        if (collection.constructor === Array) {
            _.forEach(collection, checkCollection);
        } else {
            _.forOwn(collection, checkCollection);
        }

        return hasValue;
    };

    _.reduce = function reduce(collection, callback, initialValue) {
        if (!_.isObject(collection)) {
            throw new Error('collection type not supported. Collection must be an array or object.');
        }

        var result = initialValue || null;

        if (collection.constructor === Array) {
            _.forEach(collection, function (item) {
                result = callback(result, item);
            });
        } else {
            _.forOwn(collection, function (value, key) {
                result = callback(result, value, key);
            });
        }

        return result;
    };

    _.sample = function sample(collection) {
        assertIsArray(collection);

        return collection[Math.floor(Math.random() * collection.length)];
    };

    _.uniqueId = function () {
        return (_.now() * Math.random()).toString();
    };

    _.find = function find(collection, callback, initialIndex) {
        assertIsArray(collection);

        var hasItem;

        _.forEach(collection, function findInCollection(value, index) {
            if (callback(value) && index >= (initialIndex || 0)) {
                hasItem = value;

                return hasItem;
            }
        });

        return hasItem;
    };

    _.findIndex = function find(collection, callback, initialIndex) {
        assertIsArray(collection);

        var hasItem;

        _.forEach(collection, function findInCollection(value, index) {
            if (callback(value, index) && index >= (initialIndex || 0)) {
                hasItem = index;

                return hasItem;
            }
        });

        return hasItem;
    };

    _.filter = function filter(collection, callback) {
        assertIsArray(collection);

        var newCollection = [];

        _.forEach(collection, function findInCollection(value) {
            if (callback(value)) {
                newCollection.push(value);
            }
        });

        return newCollection;
    };

    _.remove = function remove(collection, callback) {
        assertIsArray(collection);

        var filterCallback = function filterCallback(value) {
            return !callback(value);
        };

        return _.filter(collection, filterCallback);
    };

    _.take = function take(collection, size) {
        assertIsArray(collection);

        return collection.slice(0, size);
    };

    _.hasDifferences = function hasDifferences(collectionA, collectionB, deep) {
        return _.findDifferences(collectionA, collectionB, deep).length > 0;
    };

    _.findDifferences = function findDifferences(collectionA, collectionB, deep) {
        var differences = [];
        var visitedKeys = {};

        function getDifferences(value, indexOrKey) {
            visitedKeys[indexOrKey] = 1;

            if ((_.isObject(value) || _.isArray(value)) && deep) {
                if (!_.hasIndexOrKey(collectionB, indexOrKey)) {
                    differences.push(indexOrKey);
                } else if (!_.sameTypes(collectionA[indexOrKey], collectionB[indexOrKey])) {
                    differences.push(indexOrKey);
                } else if (_.hasDifferences(collectionA[indexOrKey], collectionB[indexOrKey], deep)) {
                    differences.push(indexOrKey);
                }
            } else if (collectionA[indexOrKey] !== collectionB[indexOrKey]) {
                differences.push(indexOrKey);
            }
        }

        if (_.isArray(collectionA) && _.isArray(collectionB)) {
            if (collectionA.length > collectionB.length) {
                _.forEach(collectionA, getDifferences);
            } else {
                _.forEach(collectionB, getDifferences);
            }
        } else if (_.isObject(collectionA) && _.isObject(collectionB) && !_.isArray(collectionA) && !_.isArray(collectionB)) {
            _.forOwn(collectionA, getDifferences);

            _.forOwn(collectionB, function (value, key) {
                if (!visitedKeys.hasOwnProperty(key)) {
                    differences.push(key);
                }
            });
        } else {
            throw new Error('Object types do not match');
        }

        return differences;
    };

    _.hasIndexOrKey = function hasIndexOrKey(collection, indexOrKey) {
        if (_.isArray(collection)) {
            return collection.length > parseInt(indexOrKey);
        } else if (_.isObject(collection)) {
            return collection.hasOwnProperty(indexOrKey);
        }

        return false;
    };

    _.sameTypes = function sameTypes(first, second) {
        if (_.isNullOrUndefined(first) || _.isNullOrUndefined(second)) {
            return _.isNullOrUndefined(first) && _.isNullOrUndefined(second);
        }

        if (_.isArray(first) || _.isArray(second)) {
            return _.isArray(first) && _.isArray(second);
        }

        return typeof first === typeof second;
    };

    _.freeze = function freeze(obj) {
        if ('freeze' in Object) {
            return Object.freeze(obj);
        }

        return obj;
    };

    _.noop = function () {
        return undefined;
    };

    _.isObject = function isObject(obj) {
        if (obj === null) {
            return false;
        }

        return typeof obj === 'object';
    };

    _.isArray = function isArray(array) {
        if (!_.isObject(array)) {
            return false;
        }

        return array.constructor === Array;
    };

    _.isString = function isString(string) {
        return typeof string === 'string';
    };

    _.isNumber = function isNumber(number) {
        if (isNaN(number)) {
            return false;
        }

        return typeof number === 'number';
    };

    _.isBoolean = function isBoolean(bool) {
        return typeof bool === 'boolean';
    };

    _.isFunction = function isFunction(func) {
        return typeof func === 'function';
    };

    _.isNullOrUndefined = function isNullOrUndefined(value) {
        return value === null || value === undefined;
    };

    _.getEnumName = function getEnumName(enums, nameOrId) {
        var enumObject = null;

        var enumArray = _.map(enums, function (value) {
            return value;
        });

        if (_.isNumber(nameOrId)) {
            enumObject = _.find(enumArray, function (current) {
                return current.id === nameOrId;
            });
        } else if (_.isString(nameOrId)) {
            enumObject = _.find(enumArray, function (current) {
                return current.name.toLowerCase() === nameOrId.toLowerCase();
            });
        }

        if (enumObject) {
            return enumObject.name;
        }

        return null;
    };

    _.toString = function toString(data) {
        if (_.isString(data)) {
            return data;
        }

        if (_.isBoolean(data)) {
            return data ? 'true' : 'false';
        }

        if (_.isNumber(data)) {
            return data.toString();
        }

        var toStringStr = '';

        if (data) {
            if (_.isFunction(data.toString)) {
                toStringStr = data.toString();
            } else if (_.isObject(data.toString)) {
                try {
                    toStringStr = data.toString();
                } catch (e) {
                    toStringStr = '[object invalid toString()]';
                }
            }
        }

        if (toStringStr.indexOf('[object') !== 0) {
            return toStringStr;
        }

        var cache = [];

        return toStringStr + JSON.stringify(data, function (key, value) {
            if (_.isObject(value) && !_.isNullOrUndefined(value)) {
                if (_.includes(cache, value)) {
                    return '<recursive>';
                }

                cache.push(value);
            }

            return key === '' ? value : _.toString(value);
        });
    };

    _.pad = function padNumber(value, numberToPad) {
        assertIsNumber(value);
        assertIsNumber(numberToPad);

        var valueLength = value.toString().length;

        for (var i = 0; i < numberToPad - valueLength; i++) {
            value = '0' + value.toString();
        }

        return value.toString();
    };

    var assertIsArray = function isArray(collection) {
        if (!_.isArray(collection)) {
            throw new Error('Array must be an array.');
        }
    };

    var assertIsNumber = function isArray(number) {
        if (!_.isNumber(number)) {
            throw new Error('Number must be a number.');
        }
    };

    return _;
});