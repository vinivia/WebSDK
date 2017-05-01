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
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("phenix-rtc"), require("ByteBuffer"), require("protobuf"));
	else if(typeof define === 'function' && define.amd)
		define(["phenix-rtc", "ByteBuffer", "protobuf"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("phenix-rtc"), require("ByteBuffer"), require("protobuf")) : factory(root["phenix-rtc"], root["ByteBuffer"], root["protobuf"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_10__, __WEBPACK_EXTERNAL_MODULE_12__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	'use strict';

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(1),
	    __webpack_require__(2),
	    __webpack_require__(18),
	    __webpack_require__(25),
	    __webpack_require__(40),
	    __webpack_require__(44),
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (rtc, logging, PhenixPCast, RoomService, AudioSpeakerDetector, BandwidthMonitor) {
	    window.PhenixPCast = PhenixPCast;

	    return {
	        PCast: PhenixPCast,
	        RoomService: RoomService,
	        AudioSpeakerDetector: AudioSpeakerDetector,
	        BandwidthMonitor: BandwidthMonitor,
	        logging: logging,
	        RTC: rtc
	    };
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(3),
	    __webpack_require__(7),
	    __webpack_require__(17),
	    __webpack_require__(6)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Logger, analytixAppenderFactory, ConsoleAppender, logging) {
	    'use strict';

	    return {
	        createLogger: function() { return new Logger(); }, // base logger with nothing appended
	        ConsoleAppender: ConsoleAppender,
	        level: logging.level // object with log levels
	    };
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(6)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, logging) {
	    'use strict';

	    var defaultCategory= 'websdk';
	    var start = window['__phenixPageLoadTime'] || _.now();

	    function Logger() {
	        this._appenders = [];
	        this._userId = null;
	        this._sessionId = null;
	    }

	    Logger.prototype.trace = function trace(/*formatStr, [parameter], ...*/) {
	        return log.call(this, arguments, {level: logging.level.TRACE});
	    };

	    Logger.prototype.debug = function debug(/*formatStr, [parameter], ...*/) {
	        return log.call(this, arguments, {level: logging.level.DEBUG});
	    };

	    Logger.prototype.info = function info(/*formatStr, [parameter], ...*/) {
	        return log.call(this, arguments, {level: logging.level.INFO});
	    };

	    Logger.prototype.warn = function warn(/*formatStr, [parameter], ...*/) {
	        return log.call(this, arguments, {level: logging.level.WARN});
	    };

	    Logger.prototype.error = function error(/*formatStr, [parameter], ...*/) {
	        return log.call(this, arguments, {level: logging.level.ERROR});
	    };

	    Logger.prototype.fatal = function fatal(/*formatStr, [parameter], ...*/) {
	        return log.call(this, arguments, {level: logging.level.FATAL});
	    };

	    Logger.prototype.addAppender = function addAppender(appender) {
	        assert.isObject(appender, 'appender');
	        assert.isFunction(appender.log, 'appender.log');

	        this._appenders.push(appender);
	    };

	    Logger.prototype.getAppenders = function getAppenders() {
	        return this._appenders;
	    };

	    Logger.prototype.getUserId = function getUserId() {
	        return this._userId;
	    };

	    Logger.prototype.setUserId = function setUserId(userId) {
	        this._userId = userId;
	    };

	    Logger.prototype.getSessionId = function getSessionId() {
	        return this._sessionId;
	    };

	    Logger.prototype.setSessionId = function setSessionId(sessionId) {
	        this._sessionId = sessionId;
	    };

	    function log(messages, context) {
	        var now = _.now();
	        var since = (now - start) / 1000;
	        var level = convertLevel(context.level);
	        var category = context.name || defaultCategory;
	        var that = this;

	        _.forEach(this._appenders, function(appender) {
	            try {
	                appender.log(since, level, category, Array.prototype.slice.call(messages), that._sessionId, that._userId, context);
	            } catch (e) {
	            }
	        });
	    }

	    function convertLevel(jsLoggerLevel) {
	        switch (jsLoggerLevel) {
	            case logging.level.TRACE:
	                return 'Trace';
	            case logging.level.DEBUG:
	                return 'Debug';
	            case logging.level.INFO:
	                return 'Info';
	            case logging.level.WARN:
	                return 'Warn';
	            case logging.level.ERROR:
	                return 'Error';
	            case logging.level.FATAL:
	                return 'Fatal';
	        }

	        throw new Error('Unsupported Logging Level ' + jsLoggerLevel);
	    }

	    return Logger;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var _ = function() {};

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

	    _.map = function map(collection, callback) {
	        if (!_.isObject(collection)) {
	            throw new Error('Collection must be an object or array.');
	        }

	        var newArray = [];

	        if (collection.constructor === Array) {
	            _.forEach(collection, function mapCollection(item) {
	                if (_.isString(callback) && _.isObject(item)) {
	                    newArray.push(item[callback]);
	                } else if (_.isFunction(callback)) {
	                    newArray.push(callback(item));
	                }
	            });
	        } else {
	            _.forOwn(collection, function mapCollection(value) {
	                if (_.isFunction(callback)) {
	                    newArray.push(callback(value));
	                }
	            });
	        }

	        return newArray;
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

	        return collection[Math.floor(Math.random()*collection.length)];
	    };

	    _.uniqueId = function() {
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
	            if (callback(value) && index >= (initialIndex || 0)) {
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

	            _.forOwn(collectionB, function(value, key) {
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
	            return collection.hasOwnProperty(indexOrKey)
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

	    _.noop = function() {
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

	        var enumArray = _.map(enums, function(value) {
	            return value;
	        });

	        if (_.isNumber(nameOrId)) {
	            enumObject = _.find(enumArray, function(current) {
	                return current.id === nameOrId;
	            });
	        } else if (_.isString(nameOrId)) {
	            enumObject = _.find(enumArray, function(current) {
	                return current.name.toLowerCase() === nameOrId.toLowerCase();
	            });
	        }

	        if (enumObject) {
	            return enumObject.name;
	        }

	        return null;
	    };

	    var assertIsArray = function isArray(collection) {
	        if (!_.isArray(collection)) {
	            throw new Error('Array must be an array.');
	        }
	    };

	    return _;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_) {
	    'use strict';

	    var Assert = function() {};

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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_) {
	    'use strict';

	    var logging = {
	        level: {
	            TRACE: 0,
	            DEBUG: 1,
	            INFO: 2,
	            WARN: 3,
	            ERROR: 4,
	            FATAL: 5
	        }
	    };

	    return logging;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(8),
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, AnalytixAppender) {

	    var config = {
	        urls: {
	            local: '',
	            staging: 'https://analytix-stg.phenixp2p.com',
	            production: 'https://analytix.phenixp2p.com'
	        }
	    };

	    function AnalytixAppenderFactory() {
	        this._analytixAppenders = {};
	    }

	    AnalytixAppenderFactory.prototype.getAppender = function getAppender(pcastBaseUri) {
	        var env = parseEnvFromPcastBaseUri(pcastBaseUri || '');

	        var analytixServerUrl = config.urls[env];

	        if (!this._analytixAppenders[env]) {
	            this._analytixAppenders[env] = createNewAppender.call(this, analytixServerUrl);
	        }

	        return this._analytixAppenders[env];
	    };

	    function parseEnvFromPcastBaseUri(uri) {
	        uri = uri.toLowerCase();

	        if (uri.indexOf('local') > -1) {
	            return 'local';
	        } else if (uri.indexOf('stg') > -1) {
	            return 'staging';
	        } else {
	            return 'production';
	        }
	    }

	    function createNewAppender(uri) {
	        var appender = new AnalytixAppender();

	        if (uri) {
	            appender.setUri(uri);
	        } else {
	            appender.setEnabled(false);
	        }

	        return appender;
	    }

	    return new AnalytixAppenderFactory();
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(9),
	    __webpack_require__(10),
	    __webpack_require__(11),
	    __webpack_require__(1),
	    __webpack_require__(6)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, http, ByteBuffer, MQProtocol, rtc, logging) {

	    function AnalytixAppender() {
	        this._environmentName = 'development' || '?';
	        this._environmentVersion = '2017-05-19T22:44:26Z' || '?';
	        this._loggingUrl = '/analytix/logs';
	        this._source = (rtc.browser || 'Browser') + '/' + (rtc.browserVersion || '?');
	        this._protocol = new MQProtocol();
	        this._maxAttempts = 3;
	        this._maxBufferedRecords = 1000;
	        this._maxBatchSize = 100;
	        this._records = [];
	        this._pending = false;
	        this._userId = '';
	        this._baseUri = '';
	        this._minLevel = logging.level.TRACE;
	        this._isEnabled = true;
	    }

	    AnalytixAppender.prototype.setThreshold = function setThreshold(level) {
	        assert.isNumber(level);

	        this._minLevel = level;
	    };

	    AnalytixAppender.prototype.getThreshold = function getThreshold() {
	        return this._minLevel;
	    };

	    AnalytixAppender.prototype.setUri = function setUri(uri) {
	        assert.stringNotEmpty(uri, 'uri');

	        this._baseUri = uri;
	    };

	    AnalytixAppender.prototype.isEnabled = function isEnabled() {
	        return this._isEnabled;
	    };

	    AnalytixAppender.prototype.setEnabled = function setEnabled(enabled) {
	        assert.isBoolean(enabled);

	        this._isEnabled = enabled;
	    };

	    AnalytixAppender.prototype.log = function log(since, level, category, messages, sessionId, userId, context) {
	        if (context.level < this._minLevel) {
	            return;
	        }

	        assert.isArray(messages);

	        addMessagesToRecords.call(this, since, level, category, messages, sessionId, userId);

	        deleteRecordsIfAtCapacity.call(this, since, sessionId, userId);

	        sendBatchMessagesIfNonePending.call(this);
	    };

	    function addMessagesToRecords(since, level, category, messages, sessionId, userId) {
	        var message = messages.join(' ');
	        var record = {
	            level: level,
	            timestamp: _.now().toString(),
	            category: category,
	            message: message,
	            source: this._source,
	            sessionId: sessionId,
	            userId: userId,
	            environment: this._environmentName,
	            version: this._environmentVersion,
	            runtime: since
	        };

	        this._records.push(record);
	    }

	    function deleteRecordsIfAtCapacity(since, sessionId, userId) {
	        if (this._records.length > this._maxBufferedRecords) {
	            var deleteRecords = this._records.length - (this._maxBufferedRecords / 2);

	            this._records = this._records.slice(deleteRecords);
	            this._records.unshift({
	                level: 'Warn',
	                timestamp: _.now().toString(),
	                category: 'websdk/analytixLogger',
	                message: 'Deleted ' + deleteRecords + ' records',
	                source: 'Browser',
	                sessionId: sessionId,
	                userId: userId,
	                environment: this._environmentName,
	                version: this._environmentVersion,
	                runtime: since
	            });
	        }
	    }

	    function sendBatchMessagesIfNonePending() {
	        if (this._pending || !this._baseUri || !this._isEnabled) {
	            return;
	        }

	        var storeLogRecords = {
	            records: _.take(this._records, this._maxBatchSize)
	        };

	        this._records = this._records.slice(this._maxBatchSize);
	        this._pending = true;

	        try {
	            sendEncodedHttpRequest.call(this, this._baseUri + this._loggingUrl, storeLogRecords);
	        } catch (e) {
	            this._pending = false;

	            throw e;
	        }
	    }

	    function sendEncodedHttpRequest(url, dataToEncode) {
	        var that = this;

	        var data = this._protocol.encode('analytix.StoreLogRecords', dataToEncode).toBinary();

	        function handlePost(error, result) {
	            that._pending = false;

	            if (error) {
	                return {storedRecords: 0, status: 'error'};
	            }

	            return that._protocol.decode('analytix.StoreLogRecordsResponse', ByteBuffer.fromBinary(result));
	        }

	        http.postWithRetry(url, 'protobuf', data, handlePost, this._maxAttempts);
	    }

	    return AnalytixAppender;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_) {
	    'use strict';

	    function Http() {
	        this._version = '2017-05-19T22:44:26Z';
	    }

	    Http.prototype.getWithRetry = function getWithRetry(url, callback, maxAttempts, attempt) {
	        if (!_.isNumber(attempt)) {
	            attempt = 1;
	        }

	        var that = this;
	        var requestMethod = 'GET';
	        var requestUrl = appendQueryParameters(url, that._version, _.now());
	        var xhr = getAndOpenVendorSpecificXmlHttpMethod(requestMethod, requestUrl, callback);

	        if (!xhr) {
	            return callback(getUnsupportedError());
	        }

	        function onRetry() {
	            getWithRetry.call(that, url, callback, maxAttempts, attempt + 1);
	        }

	        function isMaxRetry() {
	            return attempt > maxAttempts;
	        }

	        xhr.addEventListener('readystatechange', _.bind(handleReadyStateChange, this, xhr, callback, onRetry, isMaxRetry));

	        xhr.timeout = 15000;

	        xhr.send();
	    };

	    Http.prototype.postWithRetry = function postWithRetry(url, dataType, data, callback, maxAttempts, attempt) {
	        if (!_.isNumber(attempt)) {
	            attempt = 1;
	        }

	        var that = this;
	        var requestMethod = 'POST';
	        var requestUrl = appendQueryParameters(url, that._version, _.now());
	        var xhr = getAndOpenVendorSpecificXmlHttpMethod(requestMethod, requestUrl, callback);

	        if (!xhr) {
	            return callback(getUnsupportedError());
	        }

	        appendDataTypeHeaders(xhr, dataType);

	        function onRetry() {
	            postWithRetry.call(that, url, dataType, data, callback, maxAttempts, attempt + 1);
	        }

	        function isMaxRetry() {
	            return attempt >= maxAttempts;
	        }

	        xhr.addEventListener('readystatechange', _.bind(handleReadyStateChange, this, xhr, callback, onRetry, isMaxRetry));

	        xhr.timeout = 15000;

	        xhr.send(data);
	    };

	    function appendQueryParameters(url, version, timestamp) {
	        return url + '?version=' + encodeURIComponent(version) + '&_=' + timestamp;
	    }

	    function getAndOpenVendorSpecificXmlHttpMethod(requestMethod, requestUrl, callback) {
	        var xhr = new XMLHttpRequest();

	        if ('withCredentials' in xhr) {
	            // Most browsers.
	            xhr.open(requestMethod, requestUrl, true);
	        } else if (typeof XDomainRequest != 'undefined') {
	            // IE8 & IE9
	            xhr = new XDomainRequest();
	            xhr.open(requestMethod, requestUrl);
	        } else {
	            return;
	        }

	        return xhr;
	    }

	    function getUnsupportedError() {
	        // CORS not supported.
	        var err = new Error('unsupported');

	        err.code = 'unsupported';

	        return err;
	    }

	    function appendDataTypeHeaders(xhr, dataType) {
	        if (dataType === 'protobuf') {
	            xhr.setRequestHeader('Content-type', 'application/protobuf');
	            xhr.setRequestHeader('Accept', 'application/protobuf');
	        } else {
	            xhr.setRequestHeader('Content-type', 'application/json'); // default to json
	            xhr.setRequestHeader('Accept', 'application/json');
	        }
	    }

	    function handleReadyStateChange(xhr, callback, onRetry, isMaxRetry) {
	        if (xhr.readyState === 4 /* DONE */) {
	            if (xhr.status === 200) {
	                callback(undefined, xhr.responseText);
	            } else if (xhr.status >= 500 && xhr.status < 600 && !isMaxRetry()) {
	                onRetry();
	            } else {
	                var err = new Error(xhr.status === 0 ? 'timeout' : xhr.statusText);

	                err.code = xhr.status;

	                callback(err);
	            }
	        }
	    }

	    return new Http();
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_10__;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(12),
	    __webpack_require__(13),
	    __webpack_require__(14),
	    __webpack_require__(15),
	    __webpack_require__(16),
	    ], __WEBPACK_AMD_DEFINE_RESULT__ = function (ProtoBuf, mqProto, pcastProto, chatProto, analytixProto) {
	    'use strict';

	    function MQProtocol(logger) {
	        this._logger = logger;
	        var builder = ProtoBuf.loadJson(mqProto);

	        builder = ProtoBuf.loadJson(pcastProto, builder);
	        builder = ProtoBuf.loadJson(chatProto, builder);
	        builder = ProtoBuf.loadJson(analytixProto, builder);

	        this._builders = builder.build();
	        this._apiVersion = 3;
	    }

	    MQProtocol.prototype.getApiVersion = function () {
	        return this._apiVersion;
	    };

	    MQProtocol.prototype.encode = function (type, data) {
	        if (typeof type !== 'string') {
	            throw new Error("'type' must be a string");
	        }
	        if (typeof data !== 'object') {
	            throw new Error("'data' must be an object");
	        }

	        var builder = getBuilder.call(this, type);

	        return builder.encode(data);
	    };

	    MQProtocol.prototype.decode = function (type, value) {
	        if (typeof type !== 'string') {
	            throw new Error("'type' must be a string");
	        }

	        var builder = getBuilder.call(this, type);

	        return stringifyEnums(builder.decode(value));
	    };

	    function getBuilder(type) {
	        var fragments = type.split('.');
	        var builder = this._builders;

	        for (var i = 0; i < fragments.length - 1; i++) {
	            builder = builder[fragments[i]];

	            if (!builder) {
	                throw new Error('Unsupported type "' + type + '"');
	            }
	        }

	        builder = builder[fragments[fragments.length - 1]];

	        if (typeof builder !== 'function') {
	            throw new Error('Unsupported type "' + type + '"');
	        }

	        return builder;
	    }

	    function stringifyEnums(message) {
	        if (message && message.$type && message.$type.children) {
	            for (var key in message.$type.children) {
	                var child = message.$type.children[key];
	                var value = message[child.name];
	                var type = child && child.element ? child.element.resolvedType : null;

	                if (type && type.className === 'Message' && type.children) {
	                    message[child.name] = stringifyEnums(value);
	                } else if (type && type.className === 'Enum' && type.children) {
	                    var metaValue = null;

	                    for (var i = 0; i < type.children.length; i++) {
	                        if (type.children[i].id === value) {
	                            metaValue = type.children[i];
	                            break;
	                        }
	                    }

	                    if (metaValue && metaValue.name) {
	                        message[child.name] = metaValue.name;
	                    }
	                }
	            }
	        }

	        return message;
	    }

	    return MQProtocol;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var mqProto = {
	        "package": "mq",
	        "messages": [
	            {
	                "name": "Request",
	                "fields": [
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "requestId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "type",
	                        "id": 3
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "encoding",
	                        "id": 4
	                    },
	                    {
	                        "rule": "required",
	                        "type": "bytes",
	                        "name": "payload",
	                        "id": 5
	                    }
	                ]
	            },
	            {
	                "name": "Response",
	                "fields": [
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "requestId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "type",
	                        "id": 3
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "encoding",
	                        "id": 4
	                    },
	                    {
	                        "rule": "required",
	                        "type": "bytes",
	                        "name": "payload",
	                        "id": 5
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "double",
	                        "name": "wallTime",
	                        "id": 6
	                    }
	                ]
	            },
	            {
	                "name": "Error",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "reason",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "PingPong",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "originTimestamp",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "uint64",
	                        "name": "count",
	                        "id": 2
	                    }
	                ]
	            }
	        ]
	    };

	    return mqProto;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var pcastProto = {
	        "package": "pcast",
	        "messages": [
	            {
	                "name": "Authenticate",
	                "fields": [
	                    {
	                        "rule": "optional",
	                        "type": "uint32",
	                        "name": "apiVersion",
	                        "id": 9,
	                        "options": {
	                            "default": 0
	                        }
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "clientVersion",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "device",
	                        "id": 12
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "deviceId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "manufacturer",
	                        "id": 13
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "platform",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "platformVersion",
	                        "id": 4
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "authenticationToken",
	                        "id": 5
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "connectionId",
	                        "id": 6
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "connectionRouteKey",
	                        "id": 10
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "remoteAddress",
	                        "id": 11
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 7
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "applicationId",
	                        "id": 8
	                    }
	                ]
	            },
	            {
	                "name": "AuthenticateResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "redirect",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "roles",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "Bye",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "reason",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "ByeResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "SessionDescription",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "Type",
	                        "name": "type",
	                        "id": 1,
	                        "options": {
	                            "default": "Offer"
	                        }
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sdp",
	                        "id": 2
	                    }
	                ],
	                "enums": [
	                    {
	                        "name": "Type",
	                        "values": [
	                            {
	                                "name": "Offer",
	                                "id": 0
	                            },
	                            {
	                                "name": "Answer",
	                                "id": 1
	                            }
	                        ]
	                    }
	                ]
	            },
	            {
	                "name": "CreateStream",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "originStreamId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 3
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "connectUri",
	                        "id": 8
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "connectOptions",
	                        "id": 9
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "tags",
	                        "id": 4
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "SetRemoteDescription",
	                        "name": "setRemoteDescription",
	                        "id": 5
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "CreateOfferDescription",
	                        "name": "createOfferDescription",
	                        "id": 6
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "CreateAnswerDescription",
	                        "name": "createAnswerDescription",
	                        "id": 7
	                    }
	                ]
	            },
	            {
	                "name": "CreateStreamResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "instanceRouteKey",
	                        "id": 5
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "streamUris",
	                        "id": 8
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "SetRemoteDescriptionResponse",
	                        "name": "setRemoteDescriptionResponse",
	                        "id": 3
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "CreateOfferDescriptionResponse",
	                        "name": "createOfferDescriptionResponse",
	                        "id": 4
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "CreateAnswerDescriptionResponse",
	                        "name": "createAnswerDescriptionResponse",
	                        "id": 6
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 7
	                    }
	                ]
	            },
	            {
	                "name": "SetLocalDescription",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "SessionDescription",
	                        "name": "sessionDescription",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "uint32",
	                        "name": "apiVersion",
	                        "id": 3,
	                        "options": {
	                            "default": 0
	                        }
	                    }
	                ]
	            },
	            {
	                "name": "SetLocalDescriptionResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "SetRemoteDescription",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "SessionDescription",
	                        "name": "sessionDescription",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "uint32",
	                        "name": "apiVersion",
	                        "id": 3,
	                        "options": {
	                            "default": 0
	                        }
	                    }
	                ]
	            },
	            {
	                "name": "SetRemoteDescriptionResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "SessionDescription",
	                        "name": "sessionDescription",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "CreateOfferDescription",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "uint32",
	                        "name": "apiVersion",
	                        "id": 3,
	                        "options": {
	                            "default": 0
	                        }
	                    }
	                ]
	            },
	            {
	                "name": "CreateOfferDescriptionResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "SessionDescription",
	                        "name": "sessionDescription",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "CreateAnswerDescription",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "uint32",
	                        "name": "apiVersion",
	                        "id": 3,
	                        "options": {
	                            "default": 0
	                        }
	                    }
	                ]
	            },
	            {
	                "name": "CreateAnswerDescriptionResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "SessionDescription",
	                        "name": "sessionDescription",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "IceCandidate",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "candidate",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint32",
	                        "name": "sdpMLineIndex",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sdpMid",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "AddIceCandidates",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "IceCandidate",
	                        "name": "candidates",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 3
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "uint32",
	                        "name": "apiVersion",
	                        "id": 4,
	                        "options": {
	                            "default": 0
	                        }
	                    }
	                ]
	            },
	            {
	                "name": "AddIceCandidatesResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "UpdateStreamState",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "signalingState",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "iceGatheringState",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "iceConnectionState",
	                        "id": 4
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "uint32",
	                        "name": "apiVersion",
	                        "id": 5,
	                        "options": {
	                            "default": 0
	                        }
	                    }
	                ]
	            },
	            {
	                "name": "UpdateStreamStateResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "DestroyStream",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "reason",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "DestroyStreamResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "ArchiveStream",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "ArchiveStreamResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "uri",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "ConnectionDisconnected",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "connectionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint32",
	                        "name": "reasonCode",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "description",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "ConnectionDisconnectedResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "StreamStarted",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "tags",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "SourceStreamStarted",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "capabilities",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "tags",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "StreamEnded",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "reason",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "tags",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "SourceStreamEnded",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "reason",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "capabilities",
	                        "id": 4
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "tags",
	                        "id": 5
	                    }
	                ]
	            },
	            {
	                "name": "StreamEndedResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "StreamIdle",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "tags",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "StreamArchived",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "uri",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "SessionEnded",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "reason",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "float",
	                        "name": "duration",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "ForwardToClient",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "connectionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "type",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "bytes",
	                        "name": "payload",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "ForwardToClientResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "SetupStream",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamToken",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "CreateStream",
	                        "name": "createStream",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "SetupStreamResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "CreateStreamResponse",
	                        "name": "createStreamResponse",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "SetupPlaylistStream",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamToken",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "tags",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "PlaylistStreamManifest",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "manifest",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "SetupPlaylistStreamResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "PlaylistStreamManifest",
	                        "name": "manifests",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "StreamDataQuality",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "timestamp",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "DataQualityStatus",
	                        "name": "status",
	                        "id": 4
	                    },
	                    {
	                        "rule": "required",
	                        "type": "DataQualityReason",
	                        "name": "reason",
	                        "id": 5
	                    }
	                ],
	                "enums": [
	                    {
	                        "name": "DataQualityStatus",
	                        "values": [
	                            {
	                                "name": "NoData",
	                                "id": 0
	                            },
	                            {
	                                "name": "AudioOnly",
	                                "id": 1
	                            },
	                            {
	                                "name": "All",
	                                "id": 2
	                            }
	                        ]
	                    },
	                    {
	                        "name": "DataQualityReason",
	                        "values": [
	                            {
	                                "name": "None",
	                                "id": 0
	                            },
	                            {
	                                "name": "UploadLimited",
	                                "id": 1
	                            },
	                            {
	                                "name": "DownloadLimited",
	                                "id": 2
	                            },
	                            {
	                                "name": "PublisherLimited",
	                                "id": 3
	                            },
	                            {
	                                "name": "NetworkLimited",
	                                "id": 4
	                            }
	                        ]
	                    }
	                ]
	            },
	            {
	                "name": "StreamDataQualityResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "CallbackEvent",
	                "fields": [
	                    {
	                        "rule": "optional",
	                        "type": "uint32",
	                        "name": "apiVersion",
	                        "id": 1,
	                        "options": {
	                            "default": 0
	                        }
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "entity",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "what",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "data",
	                        "id": 4
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 5
	                    }
	                ]
	            },
	            {
	                "name": "Uri",
	                "fields": [
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "protocol",
	                        "id": 1,
	                        "options": {
	                            "default": "http"
	                        }
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "host",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "uint32",
	                        "name": "port",
	                        "id": 3,
	                        "options": {
	                            "default": 80
	                        }
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "method",
	                        "id": 4,
	                        "options": {
	                            "default": "POST"
	                        }
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "path",
	                        "id": 5,
	                        "options": {
	                            "default": "/"
	                        }
	                    }
	                ]
	            },
	            {
	                "name": "SetApplicationCallback",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "applicationId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "secret",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "Uri",
	                        "name": "callback",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "SetApplicationCallbackResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "IssueAuthenticationToken",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "applicationId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "secret",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "capabilities",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "IssueAuthenticationTokenResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "authenticationToken",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "IssueStreamToken",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "applicationId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "secret",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 3
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "originStreamId",
	                        "id": 4
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "capabilities",
	                        "id": 5
	                    }
	                ]
	            },
	            {
	                "name": "IssueStreamTokenResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "streamToken",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "TerminateStream",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "applicationId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "secret",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 3
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "reason",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "TerminateStreamResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "Stream",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "streamId",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "ListStreams",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "applicationId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "secret",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "start",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint32",
	                        "name": "length",
	                        "id": 4
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 5
	                    }
	                ]
	            },
	            {
	                "name": "ListStreamsResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "start",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "uint32",
	                        "name": "length",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "Stream",
	                        "name": "streams",
	                        "id": 4
	                    }
	                ]
	            }
	        ]
	    };

	    return pcastProto;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var chatProto = {
	        "package": "chat",
	        "messages": [
	            {
	                "name": "Room",
	                "fields": [
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "roomId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "alias",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "name",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "description",
	                        "id": 4
	                    },
	                    {
	                        "rule": "required",
	                        "type": "RoomType",
	                        "name": "type",
	                        "id": 5
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 6
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "bridgeId",
	                        "id": 7
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "pin",
	                        "id": 8
	                    }
	                ]
	            },
	            {
	                "name": "Stream",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "StreamType",
	                        "name": "type",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "uri",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "TrackState",
	                        "name": "audioState",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "TrackState",
	                        "name": "videoState",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "Member",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "screenName",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "MemberRole",
	                        "name": "role",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "Stream",
	                        "name": "streams",
	                        "id": 4
	                    },
	                    {
	                        "rule": "required",
	                        "type": "MemberState",
	                        "name": "state",
	                        "id": 5
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "lastUpdate",
	                        "id": 6
	                    }
	                ]
	            },
	            {
	                "name": "MemberUpdate",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "screenName",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "MemberRole",
	                        "name": "role",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "bool",
	                        "name": "updateStreams",
	                        "id": 7,
	                        "options": {
	                            "default": false
	                        }
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "Stream",
	                        "name": "streams",
	                        "id": 4
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "MemberState",
	                        "name": "state",
	                        "id": 5
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "lastUpdate",
	                        "id": 6
	                    }
	                ]
	            },
	            {
	                "name": "ChatUser",
	                "fields": [
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "screenName",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "MemberRole",
	                        "name": "role",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "lastUpdate",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "ChatMessage",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "messageId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "timestamp",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "ChatUser",
	                        "name": "from",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "message",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "CreateRoom",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "Room",
	                        "name": "room",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "CreateRoomResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "Room",
	                        "name": "room",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "JoinRoom",
	                "fields": [
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "roomId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "alias",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "Member",
	                        "name": "member",
	                        "id": 4
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 5
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "timestamp",
	                        "id": 6
	                    }
	                ]
	            },
	            {
	                "name": "JoinRoomResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "Room",
	                        "name": "room",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "Member",
	                        "name": "members",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "UpdateRoom",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "Room",
	                        "name": "room",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "timestamp",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "UpdateRoomResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "UpdateMember",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "MemberUpdate",
	                        "name": "member",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "timestamp",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "UpdateMemberResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "uint64",
	                        "name": "lastUpdate",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "LeaveRoom",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "roomId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "timestamp",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "LeaveRoomResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "DestroyRoom",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "roomId",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "DestroyRoomResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "GetRoomInfo",
	                "fields": [
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "roomId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "alias",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 3
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "applicationId",
	                        "id": 4
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "secret",
	                        "id": 5
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 6
	                    }
	                ]
	            },
	            {
	                "name": "GetRoomInfoResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "Room",
	                        "name": "room",
	                        "id": 2
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "Member",
	                        "name": "members",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "RoomEvent",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "roomId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "RoomEventType",
	                        "name": "eventType",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "Member",
	                        "name": "members",
	                        "id": 4
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "Room",
	                        "name": "room",
	                        "id": 5
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "string",
	                        "name": "options",
	                        "id": 6
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "timestamp",
	                        "id": 7
	                    }
	                ]
	            },
	            {
	                "name": "SendMessageToRoom",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "roomId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "ChatMessage",
	                        "name": "chatMessage",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "SendMessageToRoomResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "FetchRoomConversation",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "roomId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "afterMessageId",
	                        "id": 3
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "beforeMessageId",
	                        "id": 4
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint32",
	                        "name": "limit",
	                        "id": 5
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "RoomConversationOption",
	                        "name": "options",
	                        "id": 6
	                    }
	                ]
	            },
	            {
	                "name": "FetchRoomConversationResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "ChatMessage",
	                        "name": "chatMessages",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "RoomConversationEvent",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "roomId",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "RoomConversationEventType",
	                        "name": "eventType",
	                        "id": 3
	                    },
	                    {
	                        "rule": "repeated",
	                        "type": "ChatMessage",
	                        "name": "chatMessages",
	                        "id": 4
	                    }
	                ]
	            }
	        ],
	        "enums": [
	            {
	                "name": "RoomType",
	                "values": [
	                    {
	                        "name": "DirectChat",
	                        "id": 0
	                    },
	                    {
	                        "name": "MultiPartyChat",
	                        "id": 1
	                    },
	                    {
	                        "name": "ModeratedChat",
	                        "id": 2
	                    },
	                    {
	                        "name": "TownHall",
	                        "id": 3
	                    },
	                    {
	                        "name": "Channel",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "MemberRole",
	                "values": [
	                    {
	                        "name": "Participant",
	                        "id": 0
	                    },
	                    {
	                        "name": "Moderator",
	                        "id": 1
	                    },
	                    {
	                        "name": "Presenter",
	                        "id": 2
	                    },
	                    {
	                        "name": "Audience",
	                        "id": 3
	                    }
	                ]
	            },
	            {
	                "name": "MemberState",
	                "values": [
	                    {
	                        "name": "Active",
	                        "id": 0
	                    },
	                    {
	                        "name": "Passive",
	                        "id": 1
	                    },
	                    {
	                        "name": "HandRaised",
	                        "id": 2
	                    },
	                    {
	                        "name": "Inactive",
	                        "id": 3
	                    },
	                    {
	                        "name": "Offline",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "RoomEventType",
	                "values": [
	                    {
	                        "name": "MemberJoined",
	                        "id": 0
	                    },
	                    {
	                        "name": "MemberLeft",
	                        "id": 1
	                    },
	                    {
	                        "name": "MemberUpdated",
	                        "id": 2
	                    },
	                    {
	                        "name": "RoomUpdated",
	                        "id": 3
	                    },
	                    {
	                        "name": "RoomEnded",
	                        "id": 4
	                    }
	                ]
	            },
	            {
	                "name": "TrackState",
	                "values": [
	                    {
	                        "name": "TrackEnabled",
	                        "id": 0
	                    },
	                    {
	                        "name": "TrackDisabled",
	                        "id": 1
	                    },
	                    {
	                        "name": "TrackEnded",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "StreamType",
	                "values": [
	                    {
	                        "name": "User",
	                        "id": 0
	                    },
	                    {
	                        "name": "Presentation",
	                        "id": 1
	                    },
	                    {
	                        "name": "Audio",
	                        "id": 2
	                    }
	                ]
	            },
	            {
	                "name": "RoomConversationOption",
	                "values": [
	                    {
	                        "name": "Subscribe",
	                        "id": 0
	                    }
	                ]
	            },
	            {
	                "name": "RoomConversationEventType",
	                "values": [
	                    {
	                        "name": "Message",
	                        "id": 0
	                    }
	                ]
	            }
	        ]
	    };

	    return chatProto;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var analytixProto = {
	        "package": "analytix",
	        "messages": [
	            {
	                "name": "LogData",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "LogLevel",
	                        "name": "level",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "timestamp",
	                        "id": 2
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "category",
	                        "id": 3
	                    },
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "message",
	                        "id": 4
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "source",
	                        "id": 5
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "sessionId",
	                        "id": 6
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "userId",
	                        "id": 7
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "environment",
	                        "id": 8
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "string",
	                        "name": "version",
	                        "id": 9
	                    },
	                    {
	                        "rule": "optional",
	                        "type": "float",
	                        "name": "runtime",
	                        "id": 10
	                    }
	                ]
	            },
	            {
	                "name": "StoreLogRecords",
	                "fields": [
	                    {
	                        "rule": "repeated",
	                        "type": "LogData",
	                        "name": "records",
	                        "id": 1
	                    }
	                ]
	            },
	            {
	                "name": "StoreLogRecordsResponse",
	                "fields": [
	                    {
	                        "rule": "required",
	                        "type": "string",
	                        "name": "status",
	                        "id": 1
	                    },
	                    {
	                        "rule": "required",
	                        "type": "uint64",
	                        "name": "storedRecords",
	                        "id": 2
	                    }
	                ]
	            }
	        ],
	        "enums": [
	            {
	                "name": "LogLevel",
	                "values": [
	                    {
	                        "name": "Trace",
	                        "id": 0
	                    },
	                    {
	                        "name": "Debug",
	                        "id": 1
	                    },
	                    {
	                        "name": "Info",
	                        "id": 2
	                    },
	                    {
	                        "name": "Warn",
	                        "id": 3
	                    },
	                    {
	                        "name": "Error",
	                        "id": 4
	                    },
	                    {
	                        "name": "Fatal",
	                        "id": 5
	                    }
	                ]
	            }
	        ]
	    };

	    return analytixProto;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(6)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, logging) {
	    'use strict';

	    function ConsoleAppender() {
	        this._minLevel = logging.level.TRACE;
	    }

	    ConsoleAppender.prototype.setThreshold = function setThreshold(level) {
	        assert.isNumber(level);

	        this._minLevel = level;
	    };

	    ConsoleAppender.prototype.getThreshold = function getThreshold() {
	        return this._minLevel;
	    };

	    ConsoleAppender.prototype.log = function (since, level, category, messages, sessionId, userId, context) {
	        if (context.level < this._minLevel) {
	            return;
	        }

	        messages[0] = since + ' [' + category + '] ' + level + ' ' + messages[0];

	        if (context.level > logging.level.INFO) {
	            logError(messages)
	        } else {
	            log(messages);
	        }
	    };

	    var log = function (args) {
	        console.log.apply(console, stringify(args));
	    } || function () { };

	    var logError = function (args) {
	        console.error.apply(console, stringify(args));
	    } || log;

	    var stringify = function stringify(args) {
	        if (args.length === 0) {
	            return;
	        }

	        var newArgs = [];

	        for (var i = 0; i < args.length - 1; i++) {
	            newArgs.push(toString(args[i]));
	        }

	        if (args.length > 0) {
	            var last = args[args.length - 1];

	            if (last instanceof Error) {
	                newArgs.push(last);
	                newArgs.push(last.stack);
	            } else {
	                newArgs.push(toString(last));
	            }
	        }

	        return format(newArgs);
	    };

	    var format = function format(args) {
	        var fmt = args[0];
	        var idx = 0;

	        while (fmt.indexOf && args.length > 1 && idx >= 0) {
	            idx = fmt.indexOf('%', idx);

	            if (idx > 0) {
	                var type = fmt.substring(idx + 1, idx + 2);

	                switch (type) {
	                    case '%':
	                        // Escaped '%%' turns into '%'
	                        fmt = fmt.substring(0, idx) + fmt.substring(idx + 1);
	                        idx++;
	                        break;
	                    case 's':
	                    case 'd':
	                        // Replace '%d' or '%s' with the argument
	                        args[0] = fmt = fmt.substring(0, idx) + args[1] + fmt.substring(idx + 2);
	                        args.splice(1, 1);
	                        break;
	                    default:
	                        return args;
	                        break;
	                }
	            }
	        }

	        return args;
	    };

	    var toString = function toString(data) {
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

	                return key === '' ? value : toString(value);
	            });
	    };

	    return ConsoleAppender;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(19),
	    __webpack_require__(20),
	    __webpack_require__(21),
	    __webpack_require__(23),
	    __webpack_require__(24),
	    __webpack_require__(1)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, pcastLoggerFactory, PCastProtocol, PCastEndPoint, PeerConnectionMonitor, DimensionsChangedMonitor, phenixRTC) {
	    'use strict';

	    var NetworkStates = _.freeze({
	        'NETWORK_EMPTY': 0,
	        'NETWORK_IDLE': 1,
	        'NETWORK_LOADING': 2,
	        'NETWORK_NO_SOURCE': 3
	    });
	    var peerConnectionConfig = _.freeze({
	        'iceServers': [
	            {
	                urls: 'stun:stun.l.google.com:19302'
	            }, {
	                urls: 'stun:stun1.l.google.com:19302'
	            }, {
	                urls: 'stun:stun2.l.google.com:19302'
	            }, {
	                urls: 'stun:stun3.l.google.com:19302'
	            }, {
	                urls: 'stun:stun4.l.google.com:19302'
	            }
	        ]
	    });
	    var sdkVersion = '2017-05-19T22:44:26Z';
	    var defaultChromePCastScreenSharingExtensionId = 'icngjadgidcmifnehjcielbmiapkhjpn';
	    var defaultFirefoxPCastScreenSharingAddOn = _.freeze({
	        url: 'https://addons.mozilla.org/firefox/downloads/file/474686/pcast_screen_sharing-1.0.3-an+fx.xpi',
	        iconUrl: 'https://phenixp2p.com/public/images/phenix-logo-unicolor-64x64.png',
	        hash: 'sha256:4972e9718ea7f7c896abc12d1a9e664d5f3efe498539b082ab7694f9d7af4f3b'
	    });
	    var firefoxInstallationCheckInterval = 100;
	    var firefoxMaxInstallationChecks = 450;

	    function PhenixPCast(options) {
	        options = options || {};
	        this._baseUri = options.uri || PCastEndPoint.DefaultPCastUri;
	        this._deviceId = options.deviceId || '';
	        this._version = sdkVersion;
	        this._logger = options.logger || pcastLoggerFactory.createPCastLogger(this._baseUri);
	        this._endPoint = new PCastEndPoint(this._version, this._baseUri, this._logger);
	        this._screenSharingExtensionId = options.screenSharingExtensionId || defaultChromePCastScreenSharingExtensionId;
	        this._screenSharingAddOn = options.screenSharingAddOn || defaultFirefoxPCastScreenSharingAddOn;
	        this._screenSharingEnabled = false;
	        this._shaka = options.shaka || window.shaka;
	        this._videojs = options.videojs || window.videojs;
	        this._status = 'offline';

	        if (phenixRTC.browser === 'Chrome' && this._screenSharingExtensionId) {
	            addLinkHeaderElement.call(this);
	        }

	        phenixRTC.addEventListener(window, 'unload', function (pcast) {
	            return function () {
	                pcast.stop();
	            }
	        }(this));
	    }

	    PhenixPCast.prototype.getBaseUri = function () {
	        return this._endPoint.getBaseUri();
	    };

	    PhenixPCast.prototype.getStatus = function () {
	        return this._status;
	    };

	    PhenixPCast.prototype.start = function (authToken, authenticationCallback, onlineCallback, offlineCallback) {
	        if (typeof authToken !== 'string') {
	            throw new Error('"authToken" must be a string');
	        }
	        if (typeof authenticationCallback !== 'function') {
	            throw new Error('"authenticationCallback" must be a function');
	        }
	        if (typeof onlineCallback !== 'function') {
	            throw new Error('"onlineCallback" must be a function');
	        }
	        if (typeof offlineCallback !== 'function') {
	            throw new Error('"offlineCallback" must be a function');
	        }

	        if (this._started) {
	            throw new Error('"Already started"');
	        }

	        this._stopped = false;
	        this._started = true;
	        this._authToken = authToken;
	        this._authenticationCallback = authenticationCallback;
	        this._onlineCallback = onlineCallback;
	        this._offlineCallback = offlineCallback;
	        this._status = 'connecting';

	        this._peerConnections = {};
	        this._mediaStreams = {};
	        this._publishers = {};
	        this._gumStreams = [];

	        var that = this;

	        checkForScreenSharingCapability.call(that, function (screenSharingEnabled) {
	            that._screenSharingEnabled = screenSharingEnabled;

	            that._endPoint.resolveUri(function (err, uri) {
	                if (err) {
	                    that._logger.error('Failed to connect to [%s]', that._baseUri, err);

	                    transitionToStatus.call(that, 'offline');

	                    switch (err.code) {
	                        case 0:
	                            that._authenticationCallback.call(that, that, 'network-unavailable', '');
	                            break;
	                        case 503:
	                            that._authenticationCallback.call(that, that, 'capacity', '');
	                            break;
	                        default:
	                            that._authenticationCallback.call(that, that, 'failed', '');
	                            break;
	                    }

	                    that._stopped = true;
	                    that._started = false;

	                    return;
	                }

	                that._logger.info('Discovered end point [%s]', uri);

	                that._protocol = new PCastProtocol(uri, that._deviceId, that._version, that._logger);

	                that._protocol.on('connected', _.bind(connected, that));
	                that._protocol.on('disconnected', _.bind(disconnected, that));
	                that._protocol.on('streamEnded', _.bind(streamEnded, that));
	                that._protocol.on('dataQuality', _.bind(dataQuality, that));
	            });
	        });
	    };

	    PhenixPCast.prototype.stop = function () {
	        if (!this._started) {
	            return;
	        }

	        this._stopped = true;
	        this._started = false;

	        delete this._authenticationCallback;

	        try {
	            var reason = '';

	            for (var streamId in this._mediaStreams) {
	                if (this._mediaStreams.hasOwnProperty(streamId)) {
	                    endStream.call(this, streamId, reason);
	                }
	            }

	            for (var streamId in this._publishers) {
	                if (this._publishers.hasOwnProperty(streamId)) {
	                    var publisher = this._publishers[streamId];

	                    endStream.call(this, streamId, reason);

	                    if (!_.includes(publisher.getOptions(), 'detached')) {
	                        publisher.stop(reason);
	                    }
	                }
	            }

	            for (var streamId in this._peerConnections) {
	                if (this._peerConnections.hasOwnProperty(streamId)) {
	                    endStream.call(this, streamId, reason);
	                }
	            }

	            for (var i = 0; i < this._gumStreams.length; i++) {
	                var tracks = this._gumStreams[i].getTracks();

	                for (var j = 0; j < tracks.length; j++) {
	                    tracks[j].stop();
	                }
	            }
	        } finally {
	            if (this._protocol) {
	                this._protocol.disconnect();
	            }
	        }
	    };

	    PhenixPCast.prototype.getUserMedia = function (options, callback) {
	        if (typeof options !== 'object') {
	            throw new Error('"options" must be an object');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        return getUserMedia.call(this, options, callback);
	    };

	    PhenixPCast.prototype.publish = function (streamToken, streamToPublish, callback, tags, options) {
	        if (typeof streamToken !== 'string') {
	            throw new Error('"streamToken" must be a string');
	        }
	        if (typeof streamToPublish !== 'object' && typeof streamToPublish !== 'string') {
	            throw new Error('"streamToPublish" must be an object or URI');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }
	        tags = tags || [];
	        if (!Array.isArray(tags)) {
	            throw new Error('"tags" must be an array');
	        }
	        options = options || {};
	        if (typeof options !== 'object') {
	            throw new Error('"options" must be an object');
	        }

	        var that = this;
	        var streamType = 'upload';
	        var setupStreamOptions = {
	            negotiate: true,
	            connectOptions: options.connectOptions
	        };

	        if (typeof streamToPublish === 'string') {
	            setupStreamOptions.negotiate = false;
	            setupStreamOptions.connectUri = streamToPublish;
	        } else {
	            setupStreamOptions.connectUri = options.connectUri
	        }

	        this._protocol.setupStream(streamType, streamToken, setupStreamOptions, function (error, response) {
	            if (error) {
	                that._logger.error('Failed to create uploader [%s]', error);

	                return callback.call(that, that, 'failed');
	            } else if (response.status !== 'ok') {
	                that._logger.warn('Failed to create uploader, status [%s]', response.status);

	                switch (response.status) {
	                    case 'capacity':
	                        return callback.call(that, that, response.status);
	                    default:
	                        return callback.call(that, that, 'failed');
	                }
	            } else {
	                var streamId = response.createStreamResponse.streamId;

	                if (setupStreamOptions.negotiate === true) {
	                    var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;

	                    return createPublisherPeerConnection.call(that, streamToPublish, streamId, offerSdp, function (phenixPublisher, error) {
	                        if (error) {
	                            callback.call(that, that, 'failed', null);
	                        } else {
	                            callback.call(that, that, 'ok', phenixPublisher);
	                        }
	                    }, options, response.createStreamResponse.options);
	                }

	                return createPublisher.call(that, streamId, function (phenixPublisher, error) {
	                    if (error) {
	                        callback.call(that, that, 'failed', null);
	                    } else {
	                        callback.call(that, that, 'ok', phenixPublisher);
	                    }
	                }, response.createStreamResponse.options);
	            }
	        });
	    };

	    PhenixPCast.prototype.subscribe = function (streamToken, callback, options) {
	        if (typeof streamToken !== 'string') {
	            throw new Error('"streamToken" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }
	        options = options || {};
	        if (typeof options !== 'object') {
	            throw new Error('"options" must be an object');
	        }

	        var that = this;
	        var streamType = 'download';
	        var setupStreamOptions = {
	            negotiate: options.negotiate !== false,
	            connectUri: options.connectUri,
	            connectOptions: options.connectOptions
	        };

	        this._protocol.setupStream(streamType, streamToken, setupStreamOptions, function (error, response) {
	            if (error) {
	                that._logger.error('Failed to create downloader [%s]', error);

	                return callback.call(that, that, 'failed');
	            } else if (response.status !== 'ok') {
	                that._logger.warn('Failed to create downloader, status [%s]', response.status);

	                switch (response.status) {
	                    case 'capacity':
	                    case 'stream-ended':
	                    case 'origin-stream-ended':
	                    case 'streaming-not-available':
	                        return callback.call(that, that, response.status);
	                    default:
	                        return callback.call(that, that, 'failed');
	                }
	            } else {
	                var streamId = response.createStreamResponse.streamId;
	                var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;
	                var create = createViewerPeerConnection;

	                if (offerSdp.match(/a=x-playlist:/)) {
	                    create = createLiveViewer;
	                }

	                return create.call(that, streamId, offerSdp, function (phenixMediaStream, error) {
	                    if (error) {
	                        callback.call(that, that, 'failed', null);
	                    } else {
	                        callback.call(that, that, 'ok', phenixMediaStream);
	                    }
	                }, options);
	            }
	        });
	    };

	    PhenixPCast.prototype.getProtocol = function () {
	        return this._protocol;
	    };

	    PhenixPCast.prototype.getLogger = function () {
	        return this._logger;
	    };

	    PhenixPCast.prototype.getStatus = function () {
	        return this._status;
	    };

	    PhenixPCast.prototype.toString = function () {
	        return 'PhenixPCast[' + this._sessionId + ',' + (this._protocol ? this._protocol.toString() : 'uninitialized') + ']';
	    };

	    function checkForScreenSharingCapability(callback) {
	        var that = this;

	        if (phenixRTC.browser === 'Chrome' && that._screenSharingExtensionId) {
	            try {
	                chrome.runtime.sendMessage(that._screenSharingExtensionId, {type: 'version'}, function (response) {
	                    if (response && response.status === 'ok') {
	                        that._logger.info('Screen sharing enabled using version [%s]', response.version);
	                        callback(true);
	                    } else {
	                        that._logger.info('Screen sharing NOT available');
	                        callback(false);
	                    }
	                });
	            } catch (e) {
	                if (e.message) {
	                    that._logger.warn(e.message, e);
	                }

	                callback(false);
	            }
	        } else if (phenixRTC.browser === 'Firefox' && typeof window.PCastScreenSharing === 'object') {
	            callback(true);
	        } else {
	            callback(false);
	        }
	    }

	    function getChromeWebStoreLink() {
	        return 'https://chrome.google.com/webstore/detail/' + this._screenSharingExtensionId;
	    }

	    function addLinkHeaderElement() {
	        var chromeWebStoreUrl = getChromeWebStoreLink.call(this);

	        var links = document.getElementsByTagName('link');

	        for (var i = 0; i < links.length; i++) {
	            if (links[i].href === chromeWebStoreUrl) {
	                // Link already present
	                return;
	            }
	        }

	        this._logger.debug('Adding Chrome Web Store link [%s]', chromeWebStoreUrl);

	        var link = document.createElement('link');

	        link.rel = 'chrome-webstore-item';
	        link.href = chromeWebStoreUrl;

	        document.getElementsByTagName('head')[0].appendChild(link);
	    }

	    function tryInstallChromeScreenSharingExtension(callback) {
	        var that = this;
	        var chromeWebStoreUrl = getChromeWebStoreLink.call(this);

	        try {
	            chrome.webstore.install(chromeWebStoreUrl, function successCallback() {
	                return callback('ok');
	            }, function failureCallback(reason) {
	                if (reason) {
	                    if (reason.match(/cancelled/ig)) {
	                        that._logger.info('User cancelled screen sharing');

	                        return callback('cancelled', new Error(reason));
	                    }

	                    that._logger.warn(reason);
	                }

	                return callback('failed', new Error(reason || 'failed'));
	            });
	        } catch (e) {
	            if (e.message) {
	                that._logger.warn(e.message);
	            }

	            callback('failed', e);
	        }
	    }

	    function tryInstallFirefoxScreenSharingExtension(callback) {
	        try {
	            var params = {
	                "PCast Screen Sharing": {
	                    URL: this._screenSharingAddOn.url,
	                    IconURL: this._screenSharingAddOn.iconUrl,
	                    Hash: this._screenSharingAddOn.hash,
	                    toString: function () {
	                        return this.URL;
	                    }
	                }
	            };
	            var attemptsLeft = firefoxMaxInstallationChecks;
	            var intervalId;
	            var success = function success() {
	                if (intervalId) {
	                    clearInterval(intervalId);
	                }
	                callback('ok');
	            };
	            var failure = function failure() {
	                if (intervalId) {
	                    clearInterval(intervalId);
	                }
	                callback('failed', new Error('failed'));
	            };

	            intervalId = setInterval(function () {
	                if (typeof window.PCastScreenSharing === 'object') {
	                    return success();
	                }
	                if (attemptsLeft-- < 0) {
	                    return failure();
	                }
	            }, firefoxInstallationCheckInterval);

	            InstallTrigger.install(params, function xpiInstallCallback(url, status) {
	                // Callback only works for verified sites
	                if (status === 0) {
	                    success();
	                } else {
	                    failure();
	                }
	            });
	        } catch (e) {
	            if (e.message) {
	                this._logger.warn(e.message);
	            }

	            callback('failed', e);
	        }
	    }

	    function getScreenSharingConstraints(options, callback) {
	        var that = this;

	        switch (phenixRTC.browser) {
	            case 'Chrome':
	                try {
	                    chrome.runtime.sendMessage(that._screenSharingExtensionId, {type: 'get-desktop-media'}, function (response) {
	                        if (response.status !== 'ok') {
	                            return callback(response.status, undefined, new Error(response.status));
	                        }

	                        var constraints = {
	                            video: {}
	                        };

	                        if (typeof options === 'object' && typeof options.screen === 'object') {
	                            constraints.video = options.screen;
	                        }

	                        if (typeof constraints.video.mandatory !== 'object') {
	                            constraints.video.mandatory = {};
	                        }

	                        constraints.video.mandatory.chromeMediaSource = 'desktop';
	                        constraints.video.mandatory.chromeMediaSourceId = response.streamId;

	                        callback('ok', constraints, undefined);
	                    });
	                } catch (e) {
	                    if (e.message) {
	                        that._logger.warn(e.message);
	                    }

	                    callback('failed', undefined, e);
	                }
	                break;
	            case 'Firefox':
	                var constraints = {
	                    video: {}
	                };

	                if (typeof options === 'object' && typeof options.screen === 'object') {
	                    constraints.video = options.screen;
	                }

	                constraints.video.mediaSource = 'window';

	                callback('ok', constraints, undefined);
	                break;
	            default:
	                callback('not-supported', undefined, new Error('not-supported'));
	                break;
	        }
	    }

	    function getUserMediaConstraints(options, callback) {
	        var that = this;

	        if (options.screen) {
	            if (!that._screenSharingEnabled) {
	                var installCallback = function installCallback(status) {
	                    if (status === 'cancelled') {
	                        return callback(status, 'cancelled');
	                    }
	                    if (status !== 'ok') {
	                        return callback(status, undefined, new Error('screen-sharing-installation-failed'));
	                    }

	                    checkForScreenSharingCapability.call(that, function (screenSharingEnabled) {
	                        that._screenSharingEnabled = screenSharingEnabled;

	                        if (!that._screenSharingEnabled) {
	                            return callback(status, undefined, new Error('screen-sharing-installation-failed'));
	                        }

	                        getScreenSharingConstraints.call(that, options, callback);
	                    });
	                };

	                switch (phenixRTC.browser) {
	                    case 'Chrome':
	                        tryInstallChromeScreenSharingExtension.call(that, installCallback);
	                        break;
	                    case 'Firefox':
	                        tryInstallFirefoxScreenSharingExtension.call(that, installCallback);
	                        break;
	                    default:
	                        callback('not-supported', undefined, new Error('not-supported'));
	                        break;
	                }
	            } else {
	                getScreenSharingConstraints.call(that, options, callback);
	            }
	        } else {
	            var constraints = {
	                audio: options.audio || false,
	                video: options.video || false
	            };

	            callback('ok', constraints, undefined);
	        }
	    }

	    function getUserMedia(options, callback) {
	        var that = this;

	        var onUserMediaSuccess = function onUserMediaSuccess(status, stream) {
	            that._gumStreams.push(stream);
	            callback(that, status, stream);
	        };

	        var onUserMediaFailure = function onUserMediaFailure(status, stream, error) {
	            callback(that, status, stream, error);
	        };

	        var hasScreen = options.screen;
	        var hasVideoOrAudio = options.video || options.audio;

	        if (!(hasScreen && hasVideoOrAudio)) {
	            return getUserMediaStream.call(that, options, onUserMediaSuccess, onUserMediaFailure);
	        }

	        return getUserMediaStream.call(that, {
	            screen: options.screen
	        }, function success(status, screenStream) {
	            return getUserMediaStream.call(that, {
	                audio: options.audio,
	                video: options.video
	            }, function screenSuccess(status, stream) {
	                addTracksToWebRTCStream(stream, screenStream.getTracks());

	                onUserMediaSuccess(status, stream);
	            }, function failure(status, stream, error) {
	                stopWebRTCStream(screenStream);

	                onUserMediaFailure(status, stream, error);
	            });
	        }, onUserMediaFailure);
	    }

	    function getUserMediaStream(options, successCallback, failureCallback) {
	        var onUserMediaCancelled = function onUserMediaCancelled() {
	            failureCallback('cancelled', null);
	        };

	        var onUserMediaFailure = function onUserMediaFailure(e) {
	            failureCallback(getUserMediaErrorStatus(e), undefined, e);
	        };

	        var onUserMediaSuccess = function onUserMediaSuccess(stream) {
	            successCallback('ok', stream);
	        };

	        return getUserMediaConstraints.call(this, options, function (status, constraints, error) {
	            if (status === 'cancelled') {
	                return onUserMediaCancelled();
	            }

	            if (status !== 'ok') {
	                return onUserMediaFailure(error);
	            }

	            try {
	                phenixRTC.getUserMedia(constraints, onUserMediaSuccess, onUserMediaFailure);
	            } catch (e) {
	                onUserMediaFailure(e);
	            }
	        });
	    }


	    var getUserMediaErrorStatus = function getUserMediaErrorStatus(e) {
	        var status;

	        if (e.code === 'unavailable') {
	            status = 'conflict';
	        } else if (e.message === 'permission-denied') {
	            status = 'permission-denied';
	        } else if (e.name === 'PermissionDeniedError') { // Chrome
	            status = 'permission-denied';
	        } else if (e.name === 'InternalError' && e.message === 'Starting video failed') { // FF (old getUserMedia API)
	            status = 'conflict';
	        } else if (e.name === 'SourceUnavailableError') { // FF
	            status = 'conflict';
	        } else if (e.name === 'SecurityError' && e.message === 'The operation is insecure.') { // FF
	            status = 'permission-denied';
	        } else {
	            status = 'failed';
	        }

	        return status;
	    };

	    function connected() {
	        var that = this;

	        this._connected = true;

	        if (!that._stopped) {
	            that._protocol.authenticate(that._authToken, function (error, response) {
	                if (that._authenticationCallback) {
	                    if (error) {
	                        that._logger.error('Failed to authenticate [%s]', error);
	                        transitionToStatus.call(that, 'offline');
	                        that._authenticationCallback.call(that, that, 'unauthorized', '');
	                        that.stop('unauthorized');
	                    } else if (response.status !== 'ok') {
	                        that._logger.warn('Failed to authenticate, status [%s]', response.status);
	                        transitionToStatus.call(that, 'offline');
	                        that._authenticationCallback.call(that, that, 'unauthorized', '');
	                        that.stop('unauthorized');
	                    } else {
	                        transitionToStatus.call(that, 'online');

	                        if (that._logger.isPCastLogger) {
	                            that._logger.setSessionId(response.sessionId);
	                        }

	                        that._authenticationCallback.call(that, that, response.status, response.sessionId);
	                    }
	                }
	            });
	        }
	    }

	    function disconnected() {
	        this._connected = false;
	        transitionToStatus.call(this, 'offline');
	    }

	    function getStreamEndedReason(value) {
	        switch (value) {
	            case '':
	            case 'none':
	            case 'ended':
	                return 'ended';
	            case 'server-error':
	            case 'not-ready':
	            case 'error':
	                return 'failed';
	            case 'censored':
	                return 'censored';
	            case 'maintenance':
	                return 'maintenance';
	            case 'capacity':
	                return 'capacity';
	            case 'app-background':
	                return 'app-background';
	            default:
	                return 'custom';
	        }
	    }

	    function streamEnded(event) {
	        var streamId = event.streamId;
	        var reason = event.reason;

	        return endStream.call(this, streamId, reason);
	    }

	    function dataQuality(event) {
	        var streamId = event.streamId;
	        var status = event.status;
	        var reason = event.reason;

	        var internalMediaStream = this._mediaStreams[streamId];

	        if (internalMediaStream) {
	            internalMediaStream.dataQualityChangedCallback(status, reason);
	        }

	        var publisher = this._publishers[streamId];

	        if (publisher && typeof publisher.dataQualityChangedCallback === 'function') {
	            publisher.dataQualityChangedCallback(publisher, status, reason);
	        }
	    }

	    function endStream(streamId, reason) {
	        this._logger.info('[%s] Stream ended with reason [%s]', streamId, reason);

	        var internalMediaStream = this._mediaStreams[streamId];

	        if (internalMediaStream) {
	            internalMediaStream.streamEndedCallback(getStreamEndedReason(reason), reason);
	        }

	        delete this._mediaStreams[streamId];

	        var publisher = this._publishers[streamId];

	        if (publisher && typeof publisher.publisherEndedCallback === 'function') {
	            publisher.publisherEndedCallback(publisher, getStreamEndedReason(reason), reason);
	        }

	        delete this._publishers[streamId];

	        var peerConnection = this._peerConnections[streamId];

	        if (peerConnection) {
	            closePeerConnection.call(this, streamId, peerConnection, 'ended');
	        }

	        delete this._peerConnections[streamId];
	    }

	    function setupStreamAddedListener(streamId, state, peerConnection, callback, options) {
	        var that = this;
	        var onAddStream = function onAddStream(event) {
	            if (state.failed) {
	                return;
	            }

	            var masterStream = event.stream;

	            if (!masterStream) {
	                state.failed = true;
	                that._logger.warn('[%s] No remote stream', streamId);

	                return callback.call(that, undefined, 'failed');
	            }

	            that._logger.info('[%s] Got remote stream', streamId);

	            var createMediaStream = function createMediaStream(stream) {
	                var internalMediaStream = {
	                    children: [],
	                    renderer: null,
	                    isStopped: false,
	                    isStreamEnded: false,

	                    mediaStream: {
	                        createRenderer: function createRenderer() {
	                            var element = null;
	                            var dimensionsChangedMonitor = new DimensionsChangedMonitor(that._logger);

	                            return {
	                                start: function start(elementToAttachTo) {
	                                    element = phenixRTC.attachMediaStream(elementToAttachTo, stream);

	                                    if (options.receiveAudio === false) {
	                                        element.muted = true;
	                                    }

	                                    internalMediaStream.renderer = this;

	                                    dimensionsChangedMonitor.start(this, element);

	                                    return element;
	                                },

	                                stop: function stop() {
	                                    dimensionsChangedMonitor.stop();

	                                    if (element) {
	                                        if (typeof element.pause === 'function') {
	                                            element.pause();
	                                        }

	                                        if (element.src) {
	                                            element.src = '';
	                                        }

	                                        if (element.srcObject) {
	                                            element.srcObject = null;
	                                        }

	                                        element = null;
	                                    }

	                                    internalMediaStream.renderer = null;
	                                },

	                                getStats: function getStats() {
	                                    if (!element) {
	                                        return {
	                                            width: 0,
	                                            height: 0,
	                                            currentTime: 0.0,
	                                            networkState: NetworkStates.NETWORK_NO_SOURCE
	                                        }
	                                    }

	                                    return {
	                                        width: element.videoWidth || element.width,
	                                        height: element.videoHeight || element.height,
	                                        currentTime: element.currentTime,
	                                        networkState: element.networkState
	                                    }
	                                },

	                                setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
	                                    if (typeof callback !== 'function') {
	                                        throw new Error('"callback" must be a function');
	                                    }

	                                    this.dataQualityChangedCallback = callback;
	                                },

	                                setVideoDisplayDimensionsChangedCallback: function setVideoDisplayDimensionsChangedCallback(callback, options) {
	                                    dimensionsChangedMonitor.setVideoDisplayDimensionsChangedCallback(callback, options);
	                                }
	                            };
	                        },

	                        setStreamEndedCallback: function setStreamEndedCallback(callback) {
	                            if (typeof callback !== 'function') {
	                                throw new Error('"callback" must be a function');
	                            }

	                            this.streamEndedCallback = callback;
	                        },

	                        setStreamErrorCallback: function setStreamErrorCallback(callback) {
	                            if (typeof callback !== 'function') {
	                                throw new Error('"callback" must be a function');
	                            }
	                            this.streamErrorCallback = callback;
	                        },

	                        stop: function stop(reason) {
	                            if (internalMediaStream.isStopped) {
	                                return;
	                            }

	                            stopWebRTCStream(stream);

	                            if (noTracksAreActiveInMaster()) {
	                                destroyMasterMediaStream(reason);
	                            }

	                            internalMediaStream.isStopped = true;
	                        },

	                        monitor: function monitor(options, callback) {
	                            if (typeof options !== 'object') {
	                                throw new Error('"options" must be an object');
	                            }

	                            if (typeof callback !== 'function') {
	                                throw new Error('"callback" must be a function');
	                            }

	                            var monitor = new PeerConnectionMonitor(streamId, peerConnection, that._logger);

	                            options.direction = 'inbound';

	                            monitor.start(options, function activeCallback() {
	                                return internalMediaStream.mediaStream.isActive();
	                            }, function monitorCallback(reason) {
	                                that._logger.warn('[%s] Media stream triggered monitor condition for [%s]', streamId, reason);

	                                return callback(internalMediaStream.mediaStream, 'client-side-failure', reason);
	                            });
	                        },

	                        getStream: function getStream() {
	                            return stream;
	                        },

	                        isActive: function isActive() {
	                            var isMasterStreamStopped = state.stopped;
	                            var isMasterStreamDestroyed = typeof that._mediaStreams[streamId] !== 'object';
	                            var isCurrentStreamStopped = internalMediaStream.isStopped;

	                            return !isMasterStreamStopped && !isMasterStreamDestroyed && !isCurrentStreamStopped;
	                        },

	                        getStreamId: function getStreamId() {
	                            return streamId;
	                        },

	                        select: function select(trackSelectCallback) {
	                            if (typeof trackSelectCallback !== 'function') {
	                                throw new Error('"callback" must be a function');
	                            }

	                            if (typeof window.MediaStream !== 'function') {
	                                throw new Error('MediaStream not supported in current browser');
	                            }

	                            var tracks = masterStream.getTracks();
	                            var streamToAttach = new window.MediaStream();

	                            for (var i = 0; i < tracks.length; i++) {
	                                if (trackSelectCallback(tracks[i], i)) {
	                                    streamToAttach.addTrack(tracks[i]);
	                                }
	                            }

	                            if (streamToAttach.getTracks().length === 0) {
	                                return that._logger.warn('No tracks selected');
	                            }

	                            var newMediaStream = createMediaStream(streamToAttach);
	                            internalMediaStream.children.push(newMediaStream);

	                            return newMediaStream.mediaStream;
	                        }
	                    },

	                    streamErrorCallback: function (status, reason) {
	                        // recursively calls all children error callbacks
	                        for (var i = 0; i < internalMediaStream.children.length; i++) {
	                            internalMediaStream.children[i].streamErrorCallback(status, reason);
	                        }

	                        var mediaStream = internalMediaStream.mediaStream;

	                        if (typeof mediaStream.streamErrorCallback === 'function') {
	                            mediaStream.streamErrorCallback(mediaStream, status, reason);
	                        }
	                    },

	                    streamEndedCallback: function (status, reason) {
	                        // recursively calls all children ended callbacks
	                        for (var i = 0; i < internalMediaStream.children.length; i++) {
	                            internalMediaStream.children[i].streamEndedCallback(status, reason);
	                        }

	                        if (internalMediaStream.isStreamEnded) {
	                            return;
	                        }

	                        var mediaStream = internalMediaStream.mediaStream;

	                        internalMediaStream.isStreamEnded = true;

	                        if (typeof mediaStream.streamEndedCallback === 'function') {
	                            mediaStream.streamEndedCallback(mediaStream, status, reason);
	                        }

	                        mediaStream.stop();

	                        if (internalMediaStream.renderer) {
	                            internalMediaStream.renderer.stop();
	                        }
	                    },

	                    dataQualityChangedCallback: function (status, reason) {
	                        for (var i = 0; i < internalMediaStream.children.length; i++) {
	                            internalMediaStream.children[i].dataQualityChangedCallback(status, reason);
	                        }

	                        var renderer = internalMediaStream.renderer;

	                        if (!renderer) {
	                            return;
	                        }

	                        if (typeof renderer.dataQualityChangedCallback === 'function') {
	                            renderer.dataQualityChangedCallback(renderer, status, reason);
	                        }
	                    }
	                };

	                return internalMediaStream;
	            };

	            function noTracksAreActiveInMaster() {
	                var tracks = masterStream.getTracks();

	                for (var i = 0; i < tracks.length; i++) {
	                    var track = tracks[i];

	                    if (!isTrackStopped(track)) {
	                        return false;
	                    }
	                }

	                return true;
	            }

	            function destroyMasterMediaStream(reason) {
	                if (state.stopped) {
	                    return;
	                }

	                that._logger.info('[%s] stop media stream', streamId);

	                closePeerConnection.call(that, streamId, peerConnection, 'stop');

	                that._protocol.destroyStream(streamId, reason || '', function (error, response) {
	                    if (error) {
	                        that._logger.error('[%s] failed to destroy stream [%s]', streamId, error);
	                        return;
	                    } else if (response.status !== 'ok') {
	                        that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);
	                        return;
	                    }

	                    that._logger.info('[%s] destroyed stream', streamId);
	                });

	                state.stopped = true;
	            }

	            var internalMediaStream = createMediaStream(masterStream);

	            that._mediaStreams[streamId] = internalMediaStream;

	            callback.call(that, internalMediaStream.mediaStream);
	        };

	        phenixRTC.addEventListener(peerConnection, 'addstream', onAddStream);
	    }

	    function setupIceCandidateListener(streamId, peerConnection, callback) {
	        var that = this;
	        var onIceCandidate = function onIceCandidate(event) {
	            var candidate = event.candidate;

	            if (candidate) {
	                that._logger.debug('[%s] ICE candidate: [%s] [%s] [%s]', streamId, candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate);
	            } else {
	                that._logger.info('[%s] ICE candidate discovery complete', streamId);
	            }

	            if (callback) {
	                callback(candidate);
	            }
	        };

	        phenixRTC.addEventListener(peerConnection, 'icecandidate', onIceCandidate);
	    }

	    function setupStateListener(streamId, peerConnection) {
	        var that = this;
	        var onNegotiationNeeded = function onNegotiationNeeded(event) {
	            that._logger.info('[%s] Negotiation needed');
	        };
	        var onIceConnectionStateChanged = function onIceConnectionStateChanged(event) {
	            that._logger.info('[%s] ICE connection state changed [%s]', streamId, peerConnection.iceConnectionState);
	        };
	        var onIceGatheringStateChanged = function onIceGatheringStateChanged(event) {
	            that._logger.info('[%s] ICE gathering state changed [%s]', streamId, peerConnection.iceGatheringState);
	        };
	        var onSignalingStateChanged = function onSignalingStateChanged(event) {
	            that._logger.info('[%s] Signaling state changed [%s]', streamId, peerConnection.signalingState);
	        };
	        var onConnectionStateChanged = function onConnectionStateChanged(event) {
	            that._logger.info('[%s] Connection state changed [%s]', streamId, peerConnection.connectionState);
	        };

	        phenixRTC.addEventListener(peerConnection, 'negotiationneeded', onNegotiationNeeded);
	        phenixRTC.addEventListener(peerConnection, 'iceconnectionstatechange', onIceConnectionStateChanged);
	        phenixRTC.addEventListener(peerConnection, 'icegatheringstatechange ', onIceGatheringStateChanged);
	        phenixRTC.addEventListener(peerConnection, 'signalingstatechange', onSignalingStateChanged);
	        phenixRTC.addEventListener(peerConnection, 'connectionstatechange', onConnectionStateChanged);
	    }

	    function createPublisher(streamId, callback, streamOptions) {
	        var that = this;
	        var state = {
	            stopped: false
	        };

	        var publisher = {
	            getStreamId: function getStreamId() {
	                return streamId;
	            },

	            isActive: function isActive() {
	                return !state.stopped;
	            },

	            hasEnded: function hasEnded() {
	                return state.stopped;
	            },

	            stop: function stop(reason) {
	                if (state.stopped) {
	                    return;
	                }

	                that._protocol.destroyStream(streamId, reason || '', function (error, response) {
	                    if (error) {
	                        that._logger.error('[%s] failed to destroy stream [%s]', streamId, error);
	                        return;
	                    } else if (response.status !== 'ok') {
	                        that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);
	                        return;
	                    }

	                    that._logger.info('[%s] destroyed stream', streamId);
	                });

	                state.stopped = true;
	            },

	            setPublisherEndedCallback: function setPublisherEndedCallback(callback) {
	                if (typeof callback !== 'function') {
	                    throw new Error('"callback" must be a function');
	                }

	                this.publisherEndedCallback = callback;
	            },

	            setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
	                if (typeof callback !== 'function') {
	                    throw new Error('"callback" must be a function');
	                }

	                this.dataQualityChangedCallback = callback;
	            },

	            getOptions: function getOptions() {
	                return streamOptions;
	            }
	        };

	        that._publishers[streamId] = publisher;

	        callback(publisher);
	    }

	    function createPublisherPeerConnection(mediaStream, streamId, offerSdp, callback, options, streamOptions) {
	        var that = this;
	        var state = {
	            failed: false,
	            stopped: false
	        };
	        var hasCrypto = offerSdp.match(/a=crypto:/i);
	        var hasDataChannel = offerSdp.match(/m=application /i);
	        var peerConnection = new phenixRTC.RTCPeerConnection(peerConnectionConfig, {
	            'optional': [
	                {
	                    DtlsSrtpKeyAgreement: !hasCrypto
	                }, {
	                    RtpDataChannels: hasDataChannel
	                }
	            ]
	        });
	        var remoteMediaStream = null;
	        var onIceCandidateCallback = null;

	        that._peerConnections[streamId] = peerConnection;

	        peerConnection.addStream(mediaStream);

	        var onFailure = function onFailure() {
	            if (state.failed) {
	                return;
	            }

	            state.failed = true;
	            state.stopped = true;

	            delete that._peerConnections[streamId];

	            closePeerConnection.call(that, streamId, peerConnection, 'failure');

	            callback.call(that, undefined, 'failed');
	        };

	        function onSetRemoteDescriptionSuccess() {
	            that._logger.info('Set remote description (offer)');

	            function onCreateAnswerSuccess(answerSdp) {
	                that._logger.info('Created answer [%s]', answerSdp.sdp);

	                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (error, response) {
	                    if (error) {
	                        that._logger.error('Failed to set answer description [%s]', error);
	                        return onFailure();
	                    } else if (response.status !== 'ok') {
	                        that._logger.warn('Failed to set answer description, status [%s]', response.status);
	                        return onFailure();
	                    }

	                    function onSetLocalDescriptionSuccess() {
	                        var bandwidthAttribute = /(b=AS:([0-9]*)[\n\r]*)/gi;
	                        var video = /(mid:video)([\n\r]*)/gi;

	                        that._logger.info('Set local description (answer)');

	                        var limit = 0;
	                        var bandwithAttribute = bandwidthAttribute.exec(offerSdp);

	                        if (bandwithAttribute && bandwithAttribute.length >= 3) {
	                            limit = bandwithAttribute[2] * 1000;
	                        }

	                        var publisher = {
	                            getStreamId: function getStreamId() {
	                                return streamId;
	                            },

	                            isActive: function isActive() {
	                                return !state.stopped;
	                            },

	                            hasEnded: function hasEnded() {
	                                switch (peerConnection.iceConnectionState) {
	                                    case 'new':
	                                    case 'checking':
	                                    case 'connected':
	                                    case 'completed':
	                                        return false;
	                                    case 'disconnected':
	                                    case 'failed':
	                                    case 'closed':
	                                        return true;
	                                    default:
	                                        return true;
	                                }
	                            },

	                            stop: function stop(reason) {
	                                if (state.stopped) {
	                                    return;
	                                }

	                                closePeerConnection.call(that, streamId, peerConnection, 'closed');

	                                that._protocol.destroyStream(streamId, reason || '', function (error, response) {
	                                    if (error) {
	                                        that._logger.error('[%s] failed to destroy stream [%s]', streamId, error);
	                                        return;
	                                    } else if (response.status !== 'ok') {
	                                        that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);
	                                        return;
	                                    }

	                                    that._logger.info('[%s] destroyed stream', streamId);
	                                });

	                                state.stopped = true;
	                            },

	                            setPublisherEndedCallback: function setPublisherEndedCallback(callback) {
	                                if (typeof callback !== 'function') {
	                                    throw new Error('"callback" must be a function');
	                                }

	                                this.publisherEndedCallback = callback;
	                            },

	                            setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
	                                if (typeof callback !== 'function') {
	                                    throw new Error('"callback" must be a function');
	                                }

	                                this.dataQualityChangedCallback = callback;
	                            },

	                            setDetectSpeakingCallback: function setDetectSpeakingCallback() {

	                            },

	                            limitBandwidth: function limitBandwidth(bandwidthLimit) {
	                                if (typeof bandwidthLimit !== 'number') {
	                                    throw new Error('"bandwidthLimit" must be a number');
	                                }

	                                var newLimit = limit ? Math.min(bandwidthLimit, limit) : bandwidthLimit;
	                                var remoteDescription = peerConnection.remoteDescription;

	                                that._logger.info('Changing bandwidth limit to [%s]', newLimit);

	                                var updatedSdp = remoteDescription.sdp.replace(bandwidthAttribute, '');

	                                // Add new limit in kbps
	                                updatedSdp = updatedSdp.replace(video, function (match, videoLine, lineEnding, offset, sdp) {
	                                    return [videoLine, lineEnding, 'b=AS:', Math.ceil(newLimit / 1000), lineEnding].join('');
	                                });

	                                var updatedRemoteDescription = new phenixRTC.RTCSessionDescription({
	                                    type: remoteDescription.type,
	                                    sdp: updatedSdp
	                                });

	                                peerConnection.setRemoteDescription(updatedRemoteDescription);

	                                return {
	                                    dispose: function () {
	                                        peerConnection.setRemoteDescription(remoteDescription);
	                                    }
	                                }
	                            },

	                            monitor: function monitor(options, callback) {
	                                if (typeof options !== 'object') {
	                                    throw new Error('"options" must be an object');
	                                }
	                                if (typeof callback !== 'function') {
	                                    throw new Error('"callback" must be a function');
	                                }

	                                var monitor = new PeerConnectionMonitor(streamId, peerConnection, that._logger);

	                                options.direction = 'outbound';

	                                monitor.start(options, function activeCallback() {
	                                    return that._publishers[streamId] === publisher && !state.stopped;
	                                }, function monitorCallback(reason) {
	                                    that._logger.warn('[%s] Publisher triggered monitor condition for [%s]', streamId, reason);

	                                    return callback(publisher, 'client-side-failure', reason);
	                                });
	                            },

	                            setRemoteMediaStreamCallback: function setRemoteMediaStreamCallback(callback) {
	                                if (typeof callback !== 'function') {
	                                    throw new Error('"callback" must be a function');
	                                }

	                                this.remoteMediaStreamCallback = callback;

	                                if (remoteMediaStream) {
	                                    callback(publisher, remoteMediaStream);
	                                }
	                            },

	                            getOptions: function getOptions() {
	                                return streamOptions;
	                            }
	                        };

	                        that._publishers[streamId] = publisher;

	                        callback.call(that, publisher);
	                    }

	                    if (_.includes(response.options, 'ice-candidates')) {
	                        onIceCandidateCallback = function (candidate) {
	                            var candidates = [];
	                            var options = [];

	                            if (candidate) {
	                                candidates.push(candidate);
	                            } else {
	                                options.push('completed');
	                            }

	                            that._protocol.addIceCandidates(streamId, candidates, options, function (error, response) {
	                                if (error) {
	                                    that._logger.error('Failed to add ICE candidate [%s]', error);
	                                    return;
	                                } else if (response.status !== 'ok') {
	                                    that._logger.warn('Failed to add ICE candidate, status [%s]', response.status);
	                                    return;
	                                }

	                                if (_.includes(response.options, 'cancel')) {
	                                    onIceCandidateCallback = null;
	                                }
	                            });
	                        };
	                    }

	                    var sessionDescription = new phenixRTC.RTCSessionDescription({
	                        type: 'answer',
	                        sdp: response.sessionDescription.sdp
	                    });

	                    peerConnection.setLocalDescription(sessionDescription, onSetLocalDescriptionSuccess, onFailure);
	                });
	            }

	            var mediaConstraints = {mandatory: {}};

	            if (phenixRTC.browser === 'Chrome') {
	                mediaConstraints.mandatory.OfferToReceiveVideo = options.receiveVideo === true;
	                mediaConstraints.mandatory.OfferToReceiveAudio = options.receiveAudio === true;
	            } else {
	                mediaConstraints.mandatory.offerToReceiveVideo = options.receiveVideo === true;
	                mediaConstraints.mandatory.offerToReceiveAudio = options.receiveAudio === true;
	            }

	            peerConnection.createAnswer(onCreateAnswerSuccess, onFailure, mediaConstraints);
	        }

	        setupStreamAddedListener.call(that, streamId, state, peerConnection, function (mediaStream) {
	            var publisher = that._publishers[streamId];

	            remoteMediaStream = mediaStream;

	            if (publisher && publisher.remoteMediaStreamCallback) {
	                publisher.remoteMediaStreamCallback(publisher, mediaStream);
	            }
	        }, options);
	        setupIceCandidateListener.call(that, streamId, peerConnection, function onIceCandidate(candidate) {
	            if (onIceCandidateCallback) {
	                onIceCandidateCallback(candidate);
	            }
	        });
	        setupStateListener.call(that, streamId, peerConnection);

	        var offerSessionDescription = new phenixRTC.RTCSessionDescription({type: 'offer', sdp: offerSdp});

	        peerConnection.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);
	    }

	    function createViewerPeerConnection(streamId, offerSdp, callback, options) {
	        var that = this;
	        var state = {
	            failed: false,
	            stopped: false
	        };
	        var hasCrypto = offerSdp.match(/a=crypto:/i);
	        var hasDataChannel = offerSdp.match(/m=application /i);
	        var peerConnection = new phenixRTC.RTCPeerConnection(peerConnectionConfig, {
	            'optional': [
	                {
	                    DtlsSrtpKeyAgreement: !hasCrypto
	                }, {
	                    RtpDataChannels: hasDataChannel
	                }
	            ]
	        });
	        var onIceCandidateCallback = null;

	        that._peerConnections[streamId] = peerConnection;

	        var onFailure = function onFailure() {
	            if (state.failed) {
	                return;
	            }

	            state.failed = true;
	            state.stopped = true;

	            delete that._peerConnections[streamId];

	            closePeerConnection.call(that, streamId, peerConnection, 'failure');

	            callback.call(that, undefined, 'failed');
	        };

	        function onSetRemoteDescriptionSuccess() {
	            that._logger.debug('Set remote description (offer)');

	            function onCreateAnswerSuccess(answerSdp) {
	                that._logger.info('Created answer [%s]', answerSdp.sdp);

	                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (error, response) {
	                    if (error) {
	                        that._logger.error('Failed to set answer description [%s]', error);

	                        return onFailure();
	                    } else if (response.status !== 'ok') {
	                        that._logger.warn('Failed to set answer description, status [%s]', response.status);

	                        return onFailure();
	                    }

	                    function onSetLocalDescriptionSuccess() {
	                        that._logger.debug('Set local description (answer)');
	                    }

	                    if (_.includes(response.options, 'ice-candidates')) {
	                        onIceCandidateCallback = function (candidate) {
	                            var candidates = [];
	                            var options = [];

	                            if (candidate) {
	                                candidates.push(candidate);
	                            } else {
	                                options.push('completed');
	                            }

	                            that._protocol.addIceCandidates(streamId, candidate, options, function (error, response) {
	                                if (error) {
	                                    that._logger.error('Failed to add ICE candidate [%s]', error);
	                                    return;
	                                } else if (response.status !== 'ok') {
	                                    that._logger.warn('Failed to add ICE candidate, status [%s]', response.status);
	                                    return;
	                                }

	                                if (_.includes(response.options, 'cancel')) {
	                                    onIceCandidateCallback = null;
	                                }
	                            });
	                        };
	                    }

	                    var sessionDescription = new phenixRTC.RTCSessionDescription({
	                        type: 'answer',
	                        sdp: response.sessionDescription.sdp
	                    });

	                    peerConnection.setLocalDescription(sessionDescription, onSetLocalDescriptionSuccess, onFailure);
	                });
	            }

	            var mediaConstraints = {mandatory: {}};

	            if (phenixRTC.browser === 'Chrome') {
	                mediaConstraints.mandatory.OfferToReceiveVideo = options.receiveVideo !== false;
	                mediaConstraints.mandatory.OfferToReceiveAudio = options.receiveAudio !== false;
	            } else {
	                mediaConstraints.mandatory.offerToReceiveVideo = options.receiveVideo !== false;
	                mediaConstraints.mandatory.offerToReceiveAudio = options.receiveAudio !== false;
	            }

	            peerConnection.createAnswer(onCreateAnswerSuccess, onFailure, mediaConstraints);
	        }

	        setupStreamAddedListener.call(that, streamId, state, peerConnection, callback, options);
	        setupIceCandidateListener.call(that, streamId, peerConnection, function onIceCandidate(candidate) {
	            if (onIceCandidateCallback) {
	                onIceCandidateCallback(candidate);
	            }
	        });
	        setupStateListener.call(that, streamId, peerConnection);

	        var offerSessionDescription = new phenixRTC.RTCSessionDescription({type: 'offer', sdp: offerSdp});

	        peerConnection.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);
	    }

	    function createLiveViewer(streamId, offerSdp, callback, options) {
	        var that = this;

	        var dashMatch = offerSdp.match('a=x-playlist:([^\n]*[.]mpd)');
	        var hlsMatch = offerSdp.match('a=x-playlist:([^\n]*[.]m3u8)');

	        if (dashMatch && dashMatch.length === 2 && that._shaka && that._shaka.Player.isBrowserSupported()) {
	            return createShakaLiveViewer.call(that, streamId, dashMatch[1], callback, options);
	        } else if (hlsMatch && hlsMatch.length === 2 && document.createElement('video').canPlayType('application/vnd.apple.mpegURL') === 'maybe') {
	            return createHlsLiveViewer.call(that, streamId, hlsMatch[1], callback, options);
	        } else {
	            that._logger.warn('[%s] Offer does not contain a supported manifest', streamId, offerSdp);

	            return callback.call(that, undefined, 'failed');
	        }
	    }

	    function createShakaLiveViewer(streamId, uri, callback, options) {
	        var that = this;

	        if (!that._shaka) {
	            that._logger.warn('[%s] Shaka player not available', streamId);

	            return callback.call(that, undefined, 'live-player-missing');
	        }

	        if (!that._shaka.Player.isBrowserSupported()) {
	            that._logger.warn('[%s] Shaka does not support this browser', streamId);

	            return callback.call(that, undefined, 'browser-unsupported');
	        }

	        var shaka = that._shaka;
	        var manifestUri = encodeURI(uri).replace(/[#]/g, '%23');

	        var onPlayerError = function onPlayerError(event) {
	            var mediaStream = internalMediaStream;

	            if (!mediaStream.streamErrorCallback) {
	                that._logger.error('[%s] DASH live stream error event [%s]', streamId, event.detail);
	            } else {
	                that._logger.debug('[%s] DASH live stream error event [%s]', streamId, event.detail);

	                mediaStream.streamErrorCallback(mediaStream, 'shaka', event.detail);
	            }
	        };

	        var internalMediaStream = {
	            renderer: null,
	            isStreamEnded: false,
	            isStopped: false,

	            mediaStream: {
	                createRenderer: function createRenderer() {
	                    var player = null;
	                    var dimensionsChangedMonitor = new DimensionsChangedMonitor(that._logger);

	                    return {
	                        start: function start(elementToAttachTo) {
	                            player = new shaka.Player(elementToAttachTo);

	                            player.configure({
	                                manifest: {
	                                    retryParameters: {
	                                        timeout: 10000
	                                    }
	                                },
	                                streaming: {
	                                    rebufferingGoal: 2,
	                                    bufferingGoal: 10,
	                                    bufferBehind: 30,
	                                    retryParameters: {
	                                        timeout: 10000
	                                    }
	                                }
	                            });

	                            if (options.receiveAudio === false) {
	                                elementToAttachTo.muted = true;
	                            }

	                            internalMediaStream.renderer = this;

	                            player.addEventListener('error', onPlayerError);

	                            var load = player.load(manifestUri).then(function () {
	                                that._logger.info('[%s] DASH live stream has been loaded', streamId);

	                                if (typeof elementToAttachTo.play === 'function') {
	                                    elementToAttachTo.play();
	                                }
	                            }).catch(function (e) {
	                                that._logger.error('[%s] Error while loading DASH live stream [%s]', streamId, e.code, e);

	                                internalMediaStream.streamErrorCallback('shaka', e);
	                            });

	                            dimensionsChangedMonitor.start(this, elementToAttachTo);

	                            return elementToAttachTo;
	                        },

	                        stop: function stop() {
	                            dimensionsChangedMonitor.stop();

	                            if (player) {
	                                var finalizeStreamEnded = function finalizeStreamEnded() {
	                                    var reason = '';

	                                    internalMediaStream.streamEndedCallback(getStreamEndedReason(reason), reason);

	                                    player = null;
	                                };

	                                var destroy = player.destroy()
	                                    .then(function () {
	                                        that._logger.info('[%s] DASH live stream has been destroyed', streamId);
	                                    }).then(function () {
	                                        finalizeStreamEnded();
	                                    }).catch(function (e) {
	                                        that._logger.error('[%s] Error while destroying DASH live stream [%s]', streamId, e.code, e);

	                                        finalizeStreamEnded();

	                                        internalMediaStream.streamErrorCallback('shaka', e);
	                                    });
	                            }

	                            internalMediaStream.renderer = null;
	                        },

	                        getStats: function getStats() {
	                            if (!player) {
	                                return {
	                                    width: 0,
	                                    height: 0,
	                                    currentTime: 0.0,
	                                    networkState: NetworkStates.NETWORK_NO_SOURCE
	                                };
	                            }

	                            var stat = player.getStats();

	                            stat.currentTime = stat.playTime + stat.bufferingTime;

	                            if (stat.estimatedBandwidth > 0) {
	                                stat.networkState = NetworkStates.NETWORK_LOADING;
	                            } else if (stat.playTime > 0) {
	                                stat.networkState = NetworkStates.NETWORK_IDLE;
	                            } else if (stat.video) {
	                                stat.networkState = NetworkStates.NETWORK_EMPTY;
	                            } else {
	                                stat.networkState = NetworkStates.NETWORK_NO_SOURCE;
	                            }

	                            return stat;
	                        },

	                        setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
	                            if (typeof callback !== 'function') {
	                                throw new Error('"callback" must be a function');
	                            }

	                            this.dataQualityChangedCallback = callback;
	                        },

	                        getPlayer: function getPlayer() {
	                            return player;
	                        },

	                        isActive: function isActive() {
	                            return !internalMediaStream.isStopped;
	                        },

	                        getStreamId: function getStreamId() {
	                            return streamId;
	                        },

	                        setVideoDisplayDimensionsChangedCallback: function setVideoDisplayDimensionsChangedCallback(callback, options) {
	                            dimensionsChangedMonitor.setVideoDisplayDimensionsChangedCallback(callback, options);
	                        }
	                    };
	                },

	                select: function select(trackSelectCallback) {
	                    that._logger.warn('[%s] selection of tracks not supported for shaka live streams', streamId);

	                    return this;
	                },

	                setStreamEndedCallback: function setStreamEndedCallback(callback) {
	                    if (typeof callback !== 'function') {
	                        throw new Error('"callback" must be a function');
	                    }

	                    this.streamEndedCallback = callback;
	                },

	                setStreamErrorCallback: function setStreamErrorCallback(callback) {
	                    if (typeof callback !== 'function') {
	                        throw new Error('"callback" must be a function');
	                    }

	                    this.streamErrorCallback = callback;
	                },

	                stop: function stop(reason) {
	                    if (internalMediaStream.isStopped) {
	                        return;
	                    }

	                    that._logger.info('[%s] stop media stream', streamId);

	                    that._protocol.destroyStream(streamId, reason || '', function (error, response) {
	                        if (error) {
	                            that._logger.error('[%s] failed to destroy stream, [%s]', streamId, error);
	                            return;
	                        } else if (response.status !== 'ok') {
	                            that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);
	                            return;
	                        }

	                        that._logger.info('[%s] destroyed stream', streamId);
	                    });

	                    internalMediaStream.isStopped = true;
	                },

	                monitor: function monitor(options, callback) {
	                    if (typeof options !== 'object') {
	                        throw new Error('"options" must be an object');
	                    }
	                    if (typeof callback !== 'function') {
	                        throw new Error('"callback" must be a function');
	                    }
	                }
	            },

	            streamErrorCallback: function (status, reason) {
	                var mediaStream = internalMediaStream.mediaStream;

	                if (typeof mediaStream.streamErrorCallback === 'function') {
	                    mediaStream.streamErrorCallback(mediaStream, status, reason);
	                }
	            },

	            streamEndedCallback: function (status, reason) {
	                if (internalMediaStream.isStreamEnded) {
	                    return;
	                }

	                var mediaStream = internalMediaStream.mediaStream;

	                internalMediaStream.isStreamEnded = true;

	                if (typeof mediaStream.streamEndedCallback === 'function') {
	                    mediaStream.streamEndedCallback(mediaStream, status, reason);
	                }

	                mediaStream.stop();

	                if (internalMediaStream.renderer) {
	                    internalMediaStream.renderer.stop();
	                }
	            },

	            dataQualityChangedCallback: function (status, reason) {
	                var renderer = internalMediaStream.renderer;

	                if (!renderer) {
	                    return;
	                }

	                if (typeof renderer.dataQualityChangedCallback === 'function') {
	                    renderer.dataQualityChangedCallback(renderer, status, reason);
	                }
	            }
	        };

	        that._mediaStreams[streamId] = internalMediaStream;

	        callback.call(that, internalMediaStream.mediaStream);
	    }

	    function createHlsLiveViewer(streamId, uri, callback, options) {
	        var that = this;

	        var manifestUri = encodeURI(uri).replace(/[#]/g, '%23');

	        var onPlayerError = function onPlayerError(event) {
	            var mediaStream = internalMediaStream.mediaStream;

	            if (!mediaStream.streamErrorCallback) {
	                that._logger.error('[%s] HLS live stream error event [%s]', streamId, event.detail);
	            } else {
	                that._logger.debug('[%s] HLS live stream error event [%s]', streamId, event.detail);
	                mediaStream.streamErrorCallback(mediaStream, 'hls', event.detail);
	            }
	        };

	        var internalMediaStream = {
	            renderer: null,
	            isStreamEnded: false,
	            isStopped: false,

	            mediaStream: {
	                createRenderer: function createRenderer() {
	                    var element = null;
	                    var dimensionsChangedMonitor = new DimensionsChangedMonitor(that._logger);

	                    return {
	                        start: function start(elementToAttachTo) {
	                            try {
	                                elementToAttachTo.src = manifestUri;

	                                if (options.receiveAudio === false) {
	                                    elementToAttachTo.muted = true;
	                                }

	                                internalMediaStream.renderer = this;

	                                elementToAttachTo.addEventListener('error', onPlayerError);
	                                elementToAttachTo.play();

	                                element = elementToAttachTo;

	                                dimensionsChangedMonitor.start(this, element);

	                                return elementToAttachTo;
	                            } catch (e) {
	                                that._logger.error('[%s] Error while loading HLS live stream [%s]', streamId, e.code, e);

	                                internalMediaStream.streamErrorCallback('hls', e);
	                            }
	                        },

	                        stop: function stop() {
	                            dimensionsChangedMonitor.stop();

	                            if (element) {
	                                var finalizeStreamEnded = function finalizeStreamEnded() {
	                                    element = null;

	                                    var reason = '';

	                                    internalMediaStream.streamEndedCallback(getStreamEndedReason(reason), reason);

	                                };

	                                try {
	                                    element.pause();

	                                    that._logger.info('[%s] HLS live stream has been destroyed', streamId);

	                                    finalizeStreamEnded();
	                                } catch (e) {
	                                    that._logger.error('[%s] Error while destroying HLS live stream [%s]', streamId, e.code, e);

	                                    finalizeStreamEnded();

	                                    internalMediaStream.streamErrorCallback('hls', e);
	                                }
	                            }

	                            internalMediaStream.renderer = null;
	                        },

	                        getStats: function getStats() {
	                            if (!element) {
	                                return {
	                                    width: 0,
	                                    height: 0,
	                                    currentTime: 0.0,
	                                    networkState: NetworkStates.NETWORK_NO_SOURCE
	                                };
	                            }

	                            return {
	                                width: element.videoWidth || element.width,
	                                height: element.videoHeight || element.height,
	                                currentTime: element.currentTime,
	                                networkState: element.networkState
	                            }
	                        },

	                        setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
	                            if (typeof callback !== 'function') {
	                                throw new Error('"callback" must be a function');
	                            }

	                            this.dataQualityChangedCallback = callback;
	                        },

	                        setVideoDisplayDimensionsChangedCallback: function setVideoDisplayDimensionsChangedCallback(callback, options) {
	                            dimensionsChangedMonitor.setVideoDisplayDimensionsChangedCallback(callback, options);
	                        }
	                    };
	                },

	                select: function select(trackSelectCallback) {
	                    that._logger.warn('[%s] selection of tracks not supported for HLS live streams', streamId);

	                    return this;
	                },

	                setStreamEndedCallback: function setStreamEndedCallback(callback) {
	                    if (typeof callback !== 'function') {
	                        throw new Error('"callback" must be a function');
	                    }

	                    this.streamEndedCallback = callback;
	                },

	                setStreamErrorCallback: function setStreamErrorCallback(callback) {
	                    if (typeof callback !== 'function') {
	                        throw new Error('"callback" must be a function');
	                    }

	                    this.streamErrorCallback = callback;
	                },

	                stop: function stop(reason) {
	                    if (internalMediaStream.isStopped) {
	                        return;
	                    }

	                    that._logger.info('[%s] stop media stream', streamId);

	                    that._protocol.destroyStream(streamId, reason || '', function (error, response) {
	                        if (error) {
	                            that._logger.error('[%s] failed to destroy stream [%s]', streamId, error);
	                            return;
	                        } else if (response.status !== 'ok') {
	                            that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);
	                            return;
	                        }

	                        that._logger.info('[%s] destroyed stream', streamId);
	                    });

	                    internalMediaStream.isStopped = true;
	                },

	                monitor: function monitor(options, callback) {
	                    if (typeof options !== 'object') {
	                        throw new Error('"options" must be an object');
	                    }
	                    if (typeof callback !== 'function') {
	                        throw new Error('"callback" must be a function');
	                    }
	                },

	                isActive: function isActive() {
	                    return !internalMediaStream.isStopped;
	                },

	                getStreamId: function getStreamId() {
	                    return streamId;
	                }
	            },

	            streamErrorCallback: function (status, reason) {
	                var mediaStream = internalMediaStream.mediaStream;

	                if (typeof mediaStream.streamErrorCallback === 'function') {
	                    mediaStream.streamErrorCallback(mediaStream, status, reason);
	                }
	            },

	            streamEndedCallback: function (status, reason) {
	                if (internalMediaStream.isStreamEnded) {
	                    return;
	                }

	                var mediaStream = internalMediaStream.mediaStream;

	                internalMediaStream.isStreamEnded = true;

	                if (typeof mediaStream.streamEndedCallback === 'function') {
	                    mediaStream.streamEndedCallback(mediaStream, status, reason);
	                }

	                mediaStream.stop();

	                if (internalMediaStream.renderer) {
	                    internalMediaStream.renderer.stop();
	                }
	            },

	            dataQualityChangedCallback: function (status, reason) {
	                var renderer = internalMediaStream.renderer;

	                if (!renderer) {
	                    return;
	                }

	                if (typeof renderer.dataQualityChangedCallback === 'function') {
	                    renderer.dataQualityChangedCallback(renderer, status, reason);
	                }
	            }
	        };

	        that._mediaStreams[streamId] = internalMediaStream;

	        callback.call(that, internalMediaStream.mediaStream);
	    }

	    function transitionToStatus(newStatus) {
	        if (this._status !== newStatus) {
	            this._status = newStatus;

	            switch (newStatus) {
	                case 'connecting':
	                    break;
	                case 'offline':
	                    this._offlineCallback.call(this);
	                    break;
	                case 'online':
	                    this._onlineCallback.call(this);
	                    break;
	            }
	        }
	    }

	    function addTracksToWebRTCStream(stream, tracks) {
	        if (typeof stream !== 'object') {
	            return;
	        }
	        if (typeof tracks !== 'object') {
	            return;
	        }
	        if (tracks.constructor !== Array) {
	            return;
	        }

	        for (var i = 0; i < tracks.length; i++) {
	            stream.addTrack(tracks[i]);
	        }
	    }

	    function stopWebRTCStream(stream) {
	        if (stream && typeof stream.getTracks === 'function') {
	            var tracks = stream.getTracks();

	            for (var i = 0; i < tracks.length; i++) {
	                var track = tracks[i];

	                track.stop();
	            }
	        }
	    }

	    function isTrackStopped(track) {
	        if (typeof track !== 'object') {
	            throw new Error('Invalid track.');
	        }
	        return track.readyState === 'ended';
	    }

	    function closePeerConnection(streamId, peerConnection, reason) {
	        if (peerConnection.signalingState !== 'closed' && !peerConnection.__closing) {
	            this._logger.debug('[%s] close peer connection [%s]', streamId, reason);
	            peerConnection.close();
	            peerConnection.__closing = true;
	        }
	    }

	    return PhenixPCast;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(3),
	    __webpack_require__(7),
	    __webpack_require__(17),
	    __webpack_require__(6)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, Logger, analytixAppenderFactory, ConsoleAppender, logging) {
	    'use strict';

	    function PCastLoggerFactory() { }

	    PCastLoggerFactory.prototype.createPCastLogger = function createPCastLogger(baseUri) {
	        if (baseUri) {
	            assert.stringNotEmpty(baseUri, 'baseUri');
	        }

	        var logger = new Logger();
	        var analytixAppender = analytixAppenderFactory.getAppender(baseUri);

	        analytixAppender.setThreshold(logging.level.INFO);

	        logger.addAppender(new ConsoleAppender());
	        logger.addAppender(analytixAppender);

	        logger.isPCastLogger = true;

	        return logger;
	    };

	    return new PCastLoggerFactory();
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(11),
	    __webpack_require__(10),
	    __webpack_require__(1)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, MQProtocol, ByteBuffer, phenixRTC) {
	    'use strict';

	    function PCastProtocol(uri, deviceId, version, logger) {
	        if (typeof uri !== 'string') {
	            throw new Error('Must pass a valid "uri"');
	        }
	        if (typeof deviceId !== 'string') {
	            throw new Error('Must pass a valid "deviceId"');
	        }
	        if (typeof version !== 'string') {
	            throw new Error('Must pass a valid "version"');
	        }
	        if (typeof logger !== 'object') {
	            throw new Error('Must pass a valid "logger"');
	        }
	        this._uri = uri;
	        this._deviceId = deviceId;
	        this._version = version;
	        this._logger = logger;
	        this._mqProtocol = new MQProtocol(this._logger);

	        this._logger.info('Connecting to [%s]', uri);
	        this._webSocket = new WebSocket(uri);
	        this._webSocket.onopen = _.bind(onOpen, this);
	        this._webSocket.onclose = _.bind(onClose, this);
	        this._webSocket.onmessage = _.bind(onMessage, this);
	        this._webSocket.onerror = _.bind(onError, this);

	        this._nextRequestId = 0;
	        this._events = {};
	        this._requests = {};
	    }

	    PCastProtocol.prototype.on = function (eventName, handler) {
	        if (typeof eventName !== 'string') {
	            throw new Error('"eventName" must be a string');
	        }
	        if (typeof handler !== 'function') {
	            throw new Error('"handler" must be a function');
	        }

	        var handlers = getEventHandlers.call(this, eventName);

	        handlers.push(handler);

	        return _.bind(removeEventHandler, this, eventName, handler);
	    };

	    PCastProtocol.prototype.authenticate = function (authToken, callback) {
	        if (typeof authToken !== 'string') {
	            throw new Error('"authToken" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var authenticate = {
	            apiVersion: this._mqProtocol.getApiVersion(),
	            clientVersion: this._version,
	            deviceId: this._deviceId,
	            platform: phenixRTC.browser,
	            platformVersion: phenixRTC.browserVersion.toString(),
	            authenticationToken: authToken
	        };

	        if (this._sessionId) {
	            auth.sessionId = this._sessionId;
	        }

	        return sendRequest.call(this, 'pcast.Authenticate', authenticate, callback);
	    };

	    PCastProtocol.prototype.getSessionId = function () {
	        return this._sessionId;
	    };

	    PCastProtocol.prototype.disconnect = function () {
	        delete this._sessionId;

	        return this._webSocket.close(1000, 'byebye');
	    };

	    PCastProtocol.prototype.bye = function (reason, callback) {
	        if (typeof reason !== 'string') {
	            throw new Error('"reason" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var bye = {
	            sessionId: this._sessionId,
	            reason: reason
	        };

	        return sendRequest.call(this, 'pcast.Bye', bye, callback);
	    };

	    PCastProtocol.prototype.setupStream = function (streamType, streamToken, options, callback) {
	        if (typeof streamType !== 'string') {
	            throw new Error('"streamType" must be a string');
	        }
	        if (typeof streamToken !== 'string') {
	            throw new Error('"streamToken" must be a string');
	        }
	        if (typeof options !== 'object') {
	            throw new Error('"options" must be an object');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var browser = phenixRTC.browser || 'UnknownBrowser';
	        var browserWithVersion = browser + '-' + (phenixRTC.browserVersion || 0);
	        var setupStream = {
	            streamToken: streamToken,
	            createStream: {
	                sessionId: this._sessionId,
	                options: ['data-quality-notifications'],
	                connectUri: options.connectUri,
	                connectOptions: options.connectOptions || []
	            }
	        };

	        if (options.negotiate) {
	            setupStream.createStream.createOfferDescription = {
	                streamId: '',
	                options: [streamType, browser, browserWithVersion],
	                apiVersion: this._mqProtocol.getApiVersion()
	            }
	        }

	        return sendRequest.call(this, 'pcast.SetupStream', setupStream, callback);
	    };

	    PCastProtocol.prototype.setAnswerDescription = function (streamId, sdp, callback) {
	        if (typeof streamId !== 'string') {
	            throw new Error('"streamId" must be a string');
	        }
	        if (typeof sdp !== 'string') {
	            throw new Error('"sdp" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var setRemoteDescription = {
	            streamId: streamId,
	            sessionDescription: {
	                type: 'Answer',
	                sdp: sdp
	            },
	            apiVersion: this._mqProtocol.getApiVersion()
	        };

	        return sendRequest.call(this, 'pcast.SetRemoteDescription', setRemoteDescription, callback);
	    };

	    PCastProtocol.prototype.addIceCandidates = function (streamId, candidates, options, callback) {
	        if (typeof streamId !== 'string') {
	            throw new Error('"streamId" must be a string');
	        }
	        if (!(candidates instanceof Array)) {
	            throw new Error('"candidates" must be an array');
	        }
	        if (!(options instanceof Array)) {
	            throw new Error('"options" must be an array');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var sanitizedCandidates = [];
	        for (var i = 0; i < candidates.length; i++) {
	            var candidate = candidates[i];

	            if (typeof candidate.candidate !== 'string') {
	                throw new Error('"candidates[' + i + '].candidate" must be a string');
	            }
	            if (typeof candidate.sdpMLineIndex !== 'number') {
	                throw new Error('"candidates[' + i + '].sdpMLineIndex" must be a number');
	            }
	            if (typeof candidate.sdpMid !== 'string') {
	                throw new Error('"candidates[' + i + '].sdpMid" must be a string');
	            }

	            sanitizedCandidates.push({
	                candidate: candidate.candidate,
	                sdpMLineIndex: candidate.sdpMLineIndex,
	                sdpMid: candidate.sdpMid
	            });
	        }

	        var addIceCandidates = {
	            streamId: streamId,
	            candidates: sanitizedCandidates,
	            options: options,
	            apiVersion: this._mqProtocol.getApiVersion()
	        };

	        return sendRequest.call(this, 'pcast.AddIceCandidates', addIceCandidates, callback);
	    };

	    PCastProtocol.prototype.updateStreamState = function (streamId, signalingState, iceGatheringState, iceConnectionState, callback) {
	        if (typeof streamId !== 'string') {
	            throw new Error('"streamId" must be a string');
	        }
	        if (typeof signalingState !== 'string') {
	            throw new Error('"signalingState" must be a string');
	        }
	        if (typeof iceGatheringState !== 'string') {
	            throw new Error('"iceGatheringState" must be a string');
	        }
	        if (typeof iceConnectionState !== 'string') {
	            throw new Error('"iceConnectionState" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var updateStreamState = {
	            streamId: streamId,
	            signalingState: signalingState,
	            iceGatheringState: iceGatheringState,
	            iceConnectionState: iceConnectionState,
	            apiVersion: this._mqProtocol.getApiVersion()
	        };

	        return sendRequest.call(this, 'pcast.UpdateStreamState', updateStreamState, callback);
	    };

	    PCastProtocol.prototype.destroyStream = function (streamId, reason, callback) {
	        if (typeof streamId !== 'string') {
	            throw new Error('"streamId" must be a string');
	        }
	        if (typeof reason !== 'string') {
	            throw new Error('"reason" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var destroyStream = {
	            streamId: streamId,
	            reason: reason
	        };

	        return sendRequest.call(this, 'pcast.DestroyStream', destroyStream, callback);
	    };

	    PCastProtocol.prototype.getRoomInfo = function (roomId, alias, callback) {
	        if (roomId) {
	            assert.isString(roomId, 'roomId');
	        } else {
	            assert.isString(alias, 'alias');
	        }
	        assert.isFunction(callback, 'callback');

	        var getRoomInfo = {
	            roomId: roomId,
	            alias: alias,
	            sessionId: this._sessionId
	        };

	        return sendRequest.call(this, 'chat.GetRoomInfo', getRoomInfo, callback);
	    };

	    PCastProtocol.prototype.createRoom = function (roomName, type, description, callback) {
	        assert.isString(roomName, 'roomName');
	        assert.isString(type, 'type');
	        assert.isString(description, 'description');
	        assert.isFunction(callback, 'callback');

	        var createRoom = {
	            sessionId: this._sessionId,
	            room: {
	                name: roomName,
	                description: description,
	                type: type
	            }
	        };

	        return sendRequest.call(this, 'chat.CreateRoom', createRoom, callback);
	    };

	    PCastProtocol.prototype.enterRoom = function (roomId, alias, member, timestamp, callback) {
	        if (roomId) {
	            assert.isString(roomId, 'roomId');
	        } else {
	            assert.isString(alias, 'alias');
	        }
	        assert.isObject(member, 'member');
	        assert.isNumber(timestamp, 'timestamp');
	        assert.isFunction(callback, 'callback');

	        var joinRoom = {
	            roomId: roomId,
	            alias: alias,
	            sessionId: this._sessionId,
	            member: member,
	            timestamp: timestamp
	        };

	        return sendRequest.call(this, 'chat.JoinRoom', joinRoom, callback);
	    };

	    PCastProtocol.prototype.leaveRoom = function (roomId, timestamp, callback) {
	        assert.isString(roomId, 'roomId');
	        assert.isNumber(timestamp, 'timestamp');
	        assert.isFunction(callback, 'callback');

	        var leaveRoom = {
	            roomId: roomId,
	            sessionId: this._sessionId,
	            timestamp: timestamp
	        };

	        return sendRequest.call(this, 'chat.LeaveRoom', leaveRoom, callback);
	    };

	    PCastProtocol.prototype.updateMember = function (member, timestamp, callback) {
	        assert.isObject(member, 'member');
	        assert.isNumber(timestamp, 'timestamp');
	        assert.isFunction(callback, 'callback');

	        member.updateStreams = member.hasOwnProperty('streams');

	        var updateMember = {
	            sessionId: this._sessionId,
	            member: member,
	            timestamp: timestamp
	        };

	        return sendRequest.call(this, 'chat.UpdateMember', updateMember, callback);
	    };

	    PCastProtocol.prototype.updateRoom = function (room, timestamp, callback) {
	        assert.isObject(room, 'room');
	        assert.isNumber(timestamp, 'timestamp');
	        assert.isFunction(callback, 'callback');

	        var updateRoom = {
	            sessionId: this._sessionId,
	            room: room,
	            timestamp: timestamp
	        };

	        return sendRequest.call(this, 'chat.UpdateRoom', updateRoom, callback);
	    };

	    PCastProtocol.prototype.sendMessageToRoom = function (roomId, chatMessage, callback) {
	        assert.stringNotEmpty(roomId, 'roomId');
	        assert.isObject(chatMessage, 'chatMessage');

	        var sendMessage = {
	            roomId: roomId,
	            chatMessage: chatMessage
	        };

	        return sendRequest.call(this, 'chat.SendMessageToRoom', sendMessage, callback);
	    };

	    PCastProtocol.prototype.subscribeToRoomConversation = function (sessionId, roomId, batchSize, callback) {
	        assert.stringNotEmpty(sessionId, 'sessionId');
	        assert.stringNotEmpty(roomId, 'roomId');
	        assert.isNumber(batchSize, 'batchSize');

	        var fetchRoomConversation = {
	            sessionId: sessionId,
	            roomId: roomId,
	            limit: batchSize,
	            options: ['Subscribe']
	        };

	        return sendRequest.call(this, 'chat.FetchRoomConversation', fetchRoomConversation, callback);
	    };

	    PCastProtocol.prototype.getMessages = function (sessionId, roomId, batchSize, afterMessageId, beforeMessageId, callback) {
	        assert.stringNotEmpty(sessionId, 'sessionId');
	        assert.stringNotEmpty(roomId, 'roomId');

	        if (!beforeMessageId || !afterMessageId) {
	            assert.isNumber(batchSize, 'batchSize');
	        }

	        var fetchRoomConversation = {
	            sessionId: sessionId,
	            roomId: roomId,
	            limit: batchSize || 0,
	            options: []
	        };

	        if (beforeMessageId) {
	            assert.stringNotEmpty(beforeMessageId, 'beforeMessageId');

	            fetchRoomConversation.beforeMessageId = beforeMessageId;
	        }

	        if (afterMessageId) {
	            assert.stringNotEmpty(afterMessageId, 'afterMessageId');

	            fetchRoomConversation.afterMessageId = afterMessageId;
	        }

	        return sendRequest.call(this, 'chat.FetchRoomConversation', fetchRoomConversation, callback);
	    };

	    PCastProtocol.prototype.toString = function () {
	        return 'PCastProtocol[' + this._uri + ',' + this._webSocket.readyState + ']';
	    };

	    function sendRequest(type, message, callback) {
	        var requestId = (this._nextRequestId++).toString();
	        var request = {
	            requestId: requestId,
	            type: type,
	            payload: this._mqProtocol.encode(type, message)
	        };

	        this._requests[requestId] = callback;

	        return this._webSocket.send(this._mqProtocol.encode('mq.Request', request).toString('base64'));
	    }

	    function getEventHandlers(eventName) {
	        var handlers = this._events[eventName];

	        if (!handlers) {
	            this._events[eventName] = handlers = [];
	        }

	        return handlers;
	    }

	    function removeEventHandler(eventName, handler) {
	        var handlers = this._events[eventName];

	        _.remove(handlers, function removeHandler(currentHandler) {
	            return currentHandler === handler;
	        });

	        this._events[eventName] = handlers;
	    }

	    function triggerEvent(eventName, args) {
	        var handlers = this._events[eventName];

	        if (handlers) {
	            for (var i = 0; i < handlers.length; i++) {
	                handlers[i].apply(this, args);
	            }
	        }
	    }

	    function onOpen(evt) {
	        this._logger.info('Connected');
	        triggerEvent.call(this, 'connected');
	    }

	    function onClose(evt) {
	        this._logger.info('Disconnected [%s]: [%s]', evt.code, evt.reason);
	        triggerEvent.call(this, 'disconnected', [evt.code, evt.reason]);
	    }

	    function onMessage(evt) {
	        this._logger.debug('>> [%s]', evt.data);

	        var response = this._mqProtocol.decode('mq.Response', ByteBuffer.wrap(evt.data, 'base64'));
	        this._logger.info('>> [%s]', response.type);

	        var message = this._mqProtocol.decode(response.type, response.payload);

	        if (response.type === 'pcast.AuthenticateResponse') {
	            this._sessionId = message.sessionId;
	        } else if (response.type === 'pcast.StreamEnded') {
	            triggerEvent.call(this, 'streamEnded', [message]);
	        } else if (response.type === 'pcast.StreamDataQuality') {
	            triggerEvent.call(this, 'dataQuality', [message]);
	        } else if (response.type === 'chat.RoomEvent') {
	            triggerEvent.call(this, 'roomEvent', [message]);
	        } else if (response.type === 'chat.RoomConversationEvent') {
	            triggerEvent.call(this, 'roomChatEvent', [message]);
	        }

	        var callback = this._requests[response.requestId];

	        if (callback) {
	            delete this._requests[response.requestId];

	            if (response.type === 'mq.Error') {
	                var error = message;

	                callback(error, null);
	            } else {
	                callback(null, message);
	            }
	        }
	    }

	    function onError(evt) {
	        this._logger.error('An error occurred', evt.data);
	    }

	    return PCastProtocol;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(9),
	    __webpack_require__(22)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (http, ClosestEndPointResolver) {
	    'use strict';

	    var maxAttempts = 4;

	    function PCastEndPoint(version, baseUri, logger) {
	        if (typeof version !== 'string') {
	            throw new Error('Must pass a valid "version"');
	        }
	        if (typeof baseUri !== 'string') {
	            throw new Error('Must pass a valid "baseUri"');
	        }
	        if (typeof logger !== 'object') {
	            throw new Error('Must pass a valid "logger"');
	        }

	        this._version = version;
	        this._baseUri = baseUri;
	        this._logger = logger;
	    }

	    PCastEndPoint.DefaultPCastUri = 'https://pcast.phenixp2p.com';

	    PCastEndPoint.prototype.getBaseUri = function () {
	        return this._baseUri;
	    };

	    PCastEndPoint.prototype.resolveUri = function (callback /* (error, uri) */) {
	        return resolveUri.call(this, this._baseUri, callback);
	    };

	    PCastEndPoint.prototype.toString = function () {
	        return 'PCastEndPoint[' + this._baseUri + ']';
	    };

	    function resolveUri(baseUri, callback /* (error, uri) */) {
	        if (baseUri.lastIndexOf('wss:', 0) === 0) {
	            // WSS - Specific web socket end point
	            callback(undefined, baseUri + '/ws');
	        } else if (baseUri.lastIndexOf('https:', 0) === 0) {
	            // HTTP - Resolve closest end point
	            var that = this;

	            getEndpoints.call(that, baseUri, function(err, endPoints) {
	                if (err) {
	                    return callback(err);
	                }

	                var closestEndPointResolver = new ClosestEndPointResolver(callback, that._version, that._baseUri, that._logger);

	                closestEndPointResolver.resolveAll(endPoints);
	            });
	        } else {
	            // Not supported
	            callback(new Error('Uri not supported'));
	        }
	    }

	    function getEndpoints(baseUri, callback) {
	        http.getWithRetry(baseUri + '/pcast/endPoints', function (err, responseText) {
	            if (err) {
	                return callback(new Error('Failed to resolve an end point', err));
	            }

	            var endPoints = responseText.split(',');

	            if (endPoints.length < 1) {
	                callback(new Error('Failed to discover end points'));
	            }

	            callback(undefined, endPoints);
	        }, maxAttempts);
	    }

	    return PCastEndPoint;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(9)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, http) {
	    'use strict';

	    var measurementsPerEndPoint = 4;

	    function ClosestEndPointResolver(onClosestEndpointFound, version, baseUri, logger) {
	        this._done = false;
	        this._minTime = Number.MAX_VALUE;
	        this._minResponseText = '';
	        this._onClosestEndpointFound = onClosestEndpointFound;
	        this._logger = logger;
	        this._version = version;
	    }

	    ClosestEndPointResolver.prototype.isResolved = function isResolved() {
	        return this._done;
	    };

	    ClosestEndPointResolver.prototype.measurementCallback = function measurementCallback(endPoint, time, responseText) {
	        if (time < this._minTime) {
	            this._logger.info('Current closest end point is [%s] with latency of [%s] ms', responseText, time);
	            this._minTime = time;
	            this._minResponseText = responseText;
	        }

	        return this.isResolved();
	    };

	    ClosestEndPointResolver.prototype.completeCallback = function completeCallback(endPoint) {
	        if (this._minResponseText && this._minTime < Number.MAX_VALUE && !this.isResolved()) {
	            this._done = true;
	            return this._onClosestEndpointFound(undefined, this._minResponseText);
	        }
	    };

	    ClosestEndPointResolver.prototype.resolveAll = function resolveAll(endPoints) {
	        for (var i = 0; i < endPoints.length; i++) {
	            this.resolve(endPoints[i], measurementsPerEndPoint);
	        }
	    };

	    ClosestEndPointResolver.prototype.resolve = function resolve(endPoint, measurements) {
	        var that = this;
	        var measurement = 1;

	        var nextMeasurement = function nextMeasurement(endPoint) {
	            var maxAttempts = 1;
	            var start = _.now();

	            that._logger.info('[%s] Checking end point [%s]', measurement, endPoint);

	            http.getWithRetry.call(that, endPoint, function (err, responseText) {
	                var end = _.now();
	                var time = end - start;

	                that._logger.info('[%s] End point [%s] latency is [%s] ms', measurement, endPoint, time);

	                measurement++;

	                if (!err) {
	                    if (that.measurementCallback(endPoint, time, responseText)) {
	                        // done
	                        return;
	                    }
	                }

	                if (measurement <= measurements && !that.isResolved()) {
	                    if (err) {
	                        that._logger.info('Retrying after failure to resolve end point [%s]', endPoint, err);
	                    }

	                    return nextMeasurement(endPoint);
	                } else {
	                    return that.completeCallback(endPoint);
	                }
	            }, maxAttempts);
	        };

	        nextMeasurement(endPoint);
	    };

	    return ClosestEndPointResolver;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(1)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, phenixRTC) {
	    'use strict';

	    var defaultMonitoringInterval = 4000;
	    var defaultConditionMonitoringInterval = 1500;
	    var defaultFrameRateThreshold = 2;
	    var defaultAudioBitRateThreshold = 5000;
	    var defaultVideoBitRateThreshold = 6000;
	    var defaultConditionCountForNotificationThreshold = 3;

	    function PeerConnectionMonitor(name, peerConnection, logger) {
	        if (typeof name !== 'string') {
	            throw new Error('Must pass a valid "name"');
	        }
	        if (typeof peerConnection !== 'object') {
	            throw new Error('Must pass a valid "peerConnection"');
	        }
	        if (typeof logger !== 'object') {
	            throw new Error('Must pass a valid "logger"');
	        }
	        this._name = name;
	        this._peerConnection = peerConnection;
	        this._logger = logger;
	    }

	    PeerConnectionMonitor.prototype.start = function (options, activeCallback, monitorCallback) {
	        return monitorPeerConnection.call(this, this._name, this._peerConnection, options, activeCallback, monitorCallback);
	    };

	    PeerConnectionMonitor.prototype.toString = function () {
	        return 'PeerConnectionMonitor[]';
	    };


	    function monitorPeerConnection(name, peerConnection, options, activeCallback, monitorCallback) {
	        if (typeof name !== 'string') {
	            throw new Error('Must pass a valid "name"');
	        }
	        if (typeof peerConnection !== 'object') {
	            throw new Error('Must pass a valid "peerConnection"');
	        }
	        if (typeof options !== 'object') {
	            throw new Error('Must pass a valid "options"');
	        }
	        if (typeof activeCallback !== 'function') {
	            throw new Error('Must pass a valid "activeCallback"');
	        }
	        if (typeof monitorCallback !== 'function') {
	            throw new Error('Must pass a valid "monitorCallback"');
	        }
	        if (options.direction !== 'inbound' && options.direction !== 'outbound') {
	            throw new Error('Invalid monitoring direction');
	        }

	        var that = this;
	        var conditionCount = 0;
	        var frameRate = undefined;
	        var videoBitRate = undefined;
	        var audioBitRate = undefined;
	        var lastVideoBytes = {time: _.now(), value: 0};
	        var lastAudioBytes = {time: _.now(), value: 0};
	        var frameRateFailureThreshold = options.frameRateThreshold || defaultFrameRateThreshold;
	        var videoBitRateFailureThreshold = options.videoBitRateThreshold || defaultVideoBitRateThreshold;
	        var audioBitRateFailureThreshold = options.audioBitRateThreshold || defaultAudioBitRateThreshold;
	        var conditionCountForNotificationThreshold = options.conditionCountForNotificationThreshold || defaultConditionCountForNotificationThreshold;
	        var monitoringInterval = options.monitoringInterval || defaultMonitoringInterval;
	        var conditionMonitoringInterval = options.monitoringInterval || defaultConditionMonitoringInterval;
	        var monitorFrameRate = options.hasOwnProperty('monitorFrameRate') ? options.monitorFrameRate : true;
	        var monitorBitRate = options.hasOwnProperty('monitorBitRate') ? options.monitorBitRate : true;
	        var monitorState = options.hasOwnProperty('monitorState') ? options.monitorState : true;

	        function nextCheck() {
	            var selector = null;

	            getStats(peerConnection, selector, function successCallback(report) {
	                var hasFrameRate = false;
	                var hasVideoBitRate = false;
	                var hasAudioBitRate = false;
	                var readable = false;
	                var writable = false;

	                function eachStats(stats, reportId) {
	                    switch (phenixRTC.browser) {
	                        case 'Firefox':
	                            writable = readable |= stats.selected && stats.state === 'succeeded';

	                            if (options.direction === 'outbound' && stats.type === 'outboundrtp') {
	                                var currentBytes = {
	                                    time: _.now(),
	                                    value: stats.bytesSent || 0
	                                };

	                                switch (stats.mediaType) {
	                                    case 'video':
	                                        that._logger.debug('[%s] Outbound [%s] [%s] with bitrate [%s], droppedFrames [%s] and frame rate [%s]',
	                                            name, stats.mediaType, stats.ssrc, stats.bitrateMean, stats.droppedFrames, stats.framerateMean);
	                                        hasFrameRate = true;
	                                        frameRate = stats.framerateMean || 0;
	                                        hasVideoBitRate = true;
	                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes);
	                                        lastVideoBytes = currentBytes;
	                                        break;
	                                    case 'audio':
	                                        that._logger.debug('[%s] Outbound [%s] [%s]',
	                                            name, stats.mediaType, stats.ssrc);
	                                        hasAudioBitRate = true;
	                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes);
	                                        lastAudioBytes = currentBytes;
	                                        break;
	                                }
	                            }
	                            if (options.direction === 'inbound' && stats.type === 'inboundrtp') {
	                                var currentBytes = {
	                                    time: _.now(),
	                                    value: stats.bytesReceived || 0
	                                };

	                                switch (stats.mediaType) {
	                                    case 'video':
	                                        that._logger.debug('[%s] Inbound [%s] [%s] with framerate [%s] and jitter [%s]',
	                                            name, stats.mediaType, stats.ssrc, stats.framerateMean, stats.jitter);

	                                        // Inbound frame rate is not calculated correctly
	                                        // hasFrameRate = true;
	                                        // frameRate = stats.framerateMean || 0;
	                                        hasVideoBitRate = true;
	                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes);
	                                        lastVideoBytes = currentBytes;
	                                        break;
	                                    case 'audio':
	                                        that._logger.debug('[%s] Inbound [%s] [%s] with jitter [%s]',
	                                            name, stats.mediaType, stats.ssrc, stats.jitter);
	                                        hasAudioBitRate = true;
	                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes);
	                                        lastAudioBytes = currentBytes;
	                                        break;
	                                }
	                            }
	                            break;
	                        default:
	                            if (stats.googWritable === 'true') {
	                                writable = true;
	                            }
	                            if (stats.googReadable === 'true') {
	                                readable = true;
	                            }
	                            if (stats.type !== 'ssrc') {
	                                return;
	                            }
	                            if (options.direction === 'outbound') {
	                                var currentBytes = {
	                                    time: _.now(),
	                                    value: stats.bytesSent || 0
	                                };

	                                switch (stats.mediaType) {
	                                    case 'video':
	                                        that._logger.debug('[%s] Outbound [%s] [%s] with average encoding time [%s] ms (CPU limited=[%s]) and RTT [%s]',
	                                            name, stats.mediaType, stats.ssrc, stats.googAvgEncodeMs, stats.googCpuLimitedResolution, stats.googRtt);
	                                        hasFrameRate = true;
	                                        frameRate = stats.googFrameRateSent || 0;
	                                        hasVideoBitRate = true;
	                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes);
	                                        lastVideoBytes = currentBytes;
	                                        break;
	                                    case 'audio':
	                                        that._logger.debug('[%s] Outbound [%s] [%s] with audio input level [%s] and RTT [%s] and jitter [%s]',
	                                            name, stats.mediaType, stats.ssrc, stats.audioInputLevel, stats.googRtt, stats.googJitterReceived);
	                                        hasAudioBitRate = true;
	                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes);
	                                        lastAudioBytes = currentBytes;
	                                        break;
	                                }
	                            } else if (options.direction === 'inbound') {
	                                var currentBytes = {
	                                    time: _.now(),
	                                    value: stats.bytesReceived || 0
	                                };

	                                switch (stats.mediaType) {
	                                    case 'video':
	                                        that._logger.debug('[%s] Inbound [%s] [%s] with current delay [%s] ms and target delay [%s] ms',
	                                            name, stats.mediaType, stats.ssrc, stats.googCurrentDelayMs, stats.googTargetDelayMs);
	                                        hasFrameRate = true;
	                                        frameRate = stats.googFrameRateReceived || 0;
	                                        hasVideoBitRate = true;
	                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes);
	                                        lastVideoBytes = currentBytes;
	                                        break;
	                                    case 'audio':
	                                        that._logger.debug('[%s] Inbound [%s] [%s] with output level [%s] and jitter [%s] and jitter buffer [%s] ms',
	                                            name, stats.mediaType, stats.ssrc, stats.audioOutputLevel, stats.googJitterReceived, stats.googJitterBufferMs);
	                                        hasAudioBitRate = true;
	                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes);
	                                        lastAudioBytes = currentBytes;
	                                        break;
	                                }
	                            }
	                            break;
	                    }
	                }

	                if (report.forEach) {
	                    report.forEach(eachStats);
	                } else {
	                    for (var reportId in report) {
	                        var stats = report[reportId];

	                        eachStats(stats, reportId);
	                    }
	                }

	                if (hasVideoBitRate && videoBitRate === 0 || hasAudioBitRate && audioBitRate === 0 || hasFrameRate && frameRate === 0) {
	                    var medias = getMedias.call(that, peerConnection);

	                    hasVideoBitRate = hasVideoBitRate && medias.video && medias.video.enabled !== false;
	                    hasAudioBitRate = hasAudioBitRate && medias.audio && medias.audio.enabled !== false;
	                    hasFrameRate = hasFrameRate && medias.video && medias.video.enabled !== false;

	                    readable = readable || !(medias.video && medias.video.enabled !== false || medias.audio && medias.audio.enabled !== false);
	                    writable = writable || !(medias.video && medias.video.enabled !== false || medias.audio && medias.audio.enabled !== false);
	                }

	                if (hasAudioBitRate || hasVideoBitRate || hasFrameRate) {
	                    that._logger.debug('[%s] Current bit rate is [%s] bps for audio and [%s] bps for video with [%s] FPS',
	                        name, Math.ceil(audioBitRate || 0), Math.ceil(videoBitRate || 0), frameRate || '?');
	                }

	                if (!activeCallback()) {
	                    that._logger.info('[%s] Finished monitoring of peer connection', name);
	                    return;
	                }

	                if (monitorState
	                    && (peerConnection.connectionState === 'closed'
	                    || peerConnection.connectionState === 'failed'
	                    || peerConnection.iceConnectionState === 'failed')) {
	                    var medias = getMedias.call(that, peerConnection);
	                    var active = 0;
	                    var inactive = 0;

	                    for (var id in medias) {
	                        var media = medias[id];

	                        if (media && media.enabled !== false) {
	                            active++;
	                        } else {
	                            inactive++;
	                        }
	                    }

	                    if (active === 0 && inactive > 0) {
	                        that._logger.info('[%s] Finished monitoring of peer connection with [%s] inactive tracks', name, inactive);
	                        return;
	                    }

	                    conditionCount++;
	                } else if (monitorFrameRate && hasFrameRate && frameRate <= frameRateFailureThreshold) {
	                    conditionCount++;
	                } else if (monitorBitRate && hasAudioBitRate && audioBitRate <= audioBitRateFailureThreshold) {
	                    conditionCount++;
	                } else if (monitorBitRate && hasVideoBitRate && videoBitRate <= videoBitRateFailureThreshold) {
	                    conditionCount++;
	                } else if (!readable || !writable) {
	                    conditionCount++;
	                } else {
	                    conditionCount = 0;
	                }

	                if (conditionCount >= conditionCountForNotificationThreshold) {
	                    if (!monitorCallback('condition', frameRate, videoBitRate, audioBitRate)) {
	                        that._logger.error('[%s] Failure detected with frame rate [%s] FPS and bit rate [%s/%s] bps: [%s]', name, frameRate, audioBitRate, videoBitRate, report);
	                    } else {
	                        // Failure is acknowledged and muted
	                        conditionCount = Number.MIN_VALUE;
	                        setTimeout(nextCheck, monitoringInterval);
	                    }
	                } else {
	                    setTimeout(nextCheck, conditionCount > 0 ? conditionMonitoringInterval : monitoringInterval);
	                }
	            }, function errorCallback(error) {
	                monitorCallback('error', error);
	            });
	        }

	        setTimeout(nextCheck, monitoringInterval);
	    }

	    function normalizeStatsReport(response) {
	        if (phenixRTC.browser === 'Firefox') {
	            return response;
	        }

	        var normalizedReport = {};

	        response.result().forEach(function (report) {
	            var normalizedStatistics = {
	                id: report.id,
	                type: report.type
	            };

	            report.names().forEach(function (name) {
	                normalizedStatistics[name] = report.stat(name);
	            });

	            normalizedReport[normalizedStatistics.id] = normalizedStatistics;
	        });

	        return normalizedReport;
	    }

	    function getStats(peerConnection, selector, successCallback, monitorCallback) {
	        switch (phenixRTC.browser) {
	            case  'Firefox':
	                return peerConnection.getStats(selector)
	                    .then(function (response) {
	                        var report = normalizeStatsReport(response);

	                        successCallback(report);
	                    }).catch(function (e) {
	                        monitorCallback('error', e);
	                    });
	            default:
	                return peerConnection.getStats(function (response) {
	                    var report = normalizeStatsReport(response);

	                    successCallback(report);
	                }, selector, function (e) {
	                    monitorCallback('error', e);
	                });
	        }
	    }

	    function getMedias(peerConnection) {
	        var medias = {};
	        var localSections = peerConnection.localDescription.sdp.split('m=');
	        var remoteSections = peerConnection.remoteDescription.sdp.split('m=');

	        if (localSections.length !== remoteSections.length) {
	            return {};
	        }

	        for (var i = 1; i < localSections.length; i++) {
	            var section = localSections[i];

	            if (section.startsWith('audio')) {
	                medias.audio = {
	                    enabled: section.indexOf('a=inactive') === -1 && remoteSections[i].indexOf('a=inactive') === -1
	                }
	            } else if (section.startsWith('video')) {
	                medias.video = {
	                    enabled: section.indexOf('a=inactive') === -1 && remoteSections[i].indexOf('a=inactive') === -1
	                }
	            }
	        }

	        return medias;
	    }

	    function calculateBitRate(currentBytes, lastBytes) {
	        return (8 * (currentBytes.value - lastBytes.value))
	            / ((currentBytes.time - lastBytes.time) / 1000.0);
	    }

	    return PeerConnectionMonitor;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var defaultPollFrequency = 500;
	    var minimumPollFrequency = 15;

	    function DimensionsChangedMonitor(logger) {
	        if (!logger) {
	            throw new Error("'logger' must be specified.");
	        }
	        this._logger = logger;
	        this._dimensionsChangedIntervalId = null;
	        this._videoDisplayDimensionsChangedCallback = null;
	        this._toBeStarted = false;
	        this._videoElement = null;
	        this._dimensionsChangedData = {
	            pollFrequency: defaultPollFrequency,
	            previousWidth: 0,
	            previousHeight: 0
	        };
	        this._renderer = null;
	    }

	    DimensionsChangedMonitor.prototype.start = function start(renderer, element) {
	        startMonitor.call(this, renderer, element);
	    };

	    DimensionsChangedMonitor.prototype.stop = function stop() {
	        stopMonitor.call(this);
	    };

	    DimensionsChangedMonitor.prototype.setVideoDisplayDimensionsChangedCallback = function setVideoDisplayDimensionsChangedCallback(callback, options) {
	        updateVideoDisplayDimensionsChangedCallback.call(this, callback, options);
	    };

	    DimensionsChangedMonitor.prototype.toString = function () {
	        return 'DimensionsChangedMonitor[pollFrequency=' + this._dimensionsChangedData.pollFrequency +
	            ', previousHeight=' + this._dimensionsChangedData.previousHeight +
	            ', previousWidth=' + this._dimensionsChangedData.previousHeight +
	            ', state=' + (this._dimensionsChangedIntervalId ? 'running' : 'stopped') + ']';
	    };

	    function startMonitor(renderer, element) {
	        if (!element || element.videoWidth === undefined) {
	            this._logger.warn("Attempting to start dimensions changed monitor without providing proper 'video' element.");
	        }

	        this._renderer = renderer;
	        this._videoElement = element;
	        this._toBeStarted = true;
	        startInterval.call(this);
	    }

	    function stopMonitor() {
	        this._toBeStarted = false;
	        if (this._dimensionsChangedIntervalId) {
	            clearInterval(this._dimensionsChangedIntervalId);
	            this._dimensionsChangedIntervalId = null;
	        }
	    }

	    function updateVideoDisplayDimensionsChangedCallback(callback, options) {
	        if (callback === null) {
	            this._videoDisplayDimensionsChangedCallback = null;
	            stopMonitor.call(this);
	            return;
	        }

	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        this._videoDisplayDimensionsChangedCallback = callback;
	        if (options && options.pollFrequency) {
	            this._dimensionsChangedData.pollFrequency = options.pollFrequency >= minimumPollFrequency ? options.pollFrequency : minimumPollFrequency;
	        }
	        startInterval.call(this);
	    }

	    function startInterval() {
	        //return if either:
	        // - start hasn't been called yet
	        // - the interval is already running
	        // - there is no callback yet
	        if (!this._toBeStarted || this._dimensionsChangedIntervalId || !this._videoDisplayDimensionsChangedCallback) {
	            return;
	        }

	        var that = this;
	        this._dimensionsChangedData.previousWidth = this._videoElement.videoWidth;
	        this._dimensionsChangedData.previousHeight = this._videoElement.videoHeight;

	        this._dimensionsChangedIntervalId = setInterval(function checkVideoDimensions() {
	            if (that._videoElement.videoWidth !== that._dimensionsChangedData.previousWidth || that._videoElement.videoHeight !== that._dimensionsChangedData.previousHeight) {
	                that._dimensionsChangedData.previousWidth = that._videoElement.videoWidth;
	                that._dimensionsChangedData.previousHeight = that._videoElement.videoHeight;
	                that._videoDisplayDimensionsChangedCallback(that._renderer, {
	                    width: that._videoElement.videoWidth,
	                    height: that._videoElement.videoHeight
	                });
	            }
	        }, that._dimensionsChangedData.pollFrequency);
	    }

	    return DimensionsChangedMonitor;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(27),
	    __webpack_require__(28),
	    __webpack_require__(36),
	    __webpack_require__(29),
	    __webpack_require__(26),
	    __webpack_require__(30),
	    __webpack_require__(38),
	    __webpack_require__(35),
	    __webpack_require__(34)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, Observable, ObservableArray, AuthenticationService, Room, ImmutableRoom, Member, RoomChatService, room, member) {
	    'use strict';

	    function RoomService(pcast) {
	        assert.isObject(pcast, 'pcast');
	        assert.isFunction(pcast.getLogger, 'pcast.getLogger');
	        assert.isFunction(pcast.getProtocol, 'pcast.getProtocol');

	        this._pcast = pcast;
	        this._logger = pcast.getLogger();
	        this._protocol =  pcast.getProtocol();

	        this._self = new Observable(null);
	        this._activeRoom = new Observable(null);
	        this._cachedRoom = new Observable(null);
	        this._roomChatService = null;

	        assert.isObject(this._logger, 'this._logger');
	        assert.isObject(this._protocol, 'this._protocol');

	        this._authService = new AuthenticationService(this._pcast);
	    }

	    RoomService.prototype.start = function start(role, screenName) {
	        assert.stringNotEmpty(role, 'role');
	        assert.stringNotEmpty(screenName, 'screenName');

	        this._authService.start();

	        var myState = member.states.passive.name;
	        var mySessionId = this._authService.getPCastSessionId();
	        var myScreenName = screenName;
	        var myStreams = [];
	        var myLastUpdate = _.now();
	        var roomService = this;

	        var self = new Member(roomService, myState, mySessionId, myScreenName, role, myStreams, myLastUpdate);

	        this._self = new Observable(self);
	        this._disposables = [];

	        var disposeOfRoomEventHandler = this._protocol.on('roomEvent', _.bind(onRoomEvent, this));

	        this._disposables.push(disposeOfRoomEventHandler);

	        setupSubscriptions.call(this);

	        return self;
	    };

	    RoomService.prototype.getRoomInfo = function getRoomInfo(roomId, alias, callback) {
	        if (roomId) {
	            assert.stringNotEmpty('roomId', roomId);
	        } else {
	            assert.stringNotEmpty('alias', alias);
	        }
	        assert.isFunction(callback);

	        getRoomInfoRequest.call(this, roomId, alias, callback);
	    };

	    RoomService.prototype.createRoom = function createRoom(name, type, description, callback) {
	        assert.stringNotEmpty(name, 'name');
	        assert.stringNotEmpty(type, 'type');
	        assert.isString(description, 'description');
	        assert.isFunction(callback);

	        createRoomRequest.call(this, name, type, description, callback);
	    };

	    RoomService.prototype.enterRoom = function enterRoom(roomId, alias, callback) {
	        if (roomId) {
	            assert.stringNotEmpty('roomId', roomId);
	        } else {
	            assert.stringNotEmpty('alias', alias);
	        }
	        assert.isFunction(callback);

	        enterRoomRequest.call(this, roomId, alias, callback);
	    };

	    RoomService.prototype.leaveRoom = function leaveRoom(callback) {
	        var that = this;

	        return leaveRoomRequest.call(that, callback);
	    };

	    RoomService.prototype.getRoomChatService = function getRoomChatService() {
	        if (!this._roomChatService && this._activeRoom.getValue()) {
	            this._roomChatService = new RoomChatService(this);
	        }

	        return this._roomChatService;
	    };

	    RoomService.prototype.getSelf = function getSelf() {
	        return this._self.getValue();
	    };

	    RoomService.prototype.getObservableActiveRoom = function getObservableActiveRoom() {
	        return this._activeRoom;
	    };

	    RoomService.prototype.updateSelf = function updateSelf(callback) {
	        assert.isFunction(callback);

	        updateMemberRequest.call(this, this.getSelf(), callback);
	    };

	    RoomService.prototype.updateMember = function updateMember(member, callback) {
	        assert.isFunction(callback);
	        assert.isObject(member);

	        updateMemberRequest.call(this, member, callback);
	    };

	    RoomService.prototype.updateRoom = function updateRoom(callback) {
	        assert.isFunction(callback);

	        updateRoomRequest.call(this, callback);
	    };

	    RoomService.prototype.revertRoomChanges = function revertRoomChanges() {
	        var activeRoom = this._activeRoom.getValue();
	        var cachedRoom = this._cachedRoom.getValue();

	        if (!activeRoom || !cachedRoom) {
	            return this._logger.warn('Unable to revert changes to room. Not currently in a room.');
	        }

	        activeRoom._update(cachedRoom.toJson());
	    };

	    RoomService.prototype.revertMemberChanges = function revertMemberChanges(member) {
	        assert.isObject(member);

	        var cachedMember = findMemberInObservableRoom(member.getSessionId(), this._cachedRoom);
	        var activeMember = findMemberInObservableRoom(member.getSessionId(), this._activeRoom);

	        if (!cachedMember || !activeMember) {
	            return this._logger.warn('Unable to revert changes to member. Member is currently not in room.');
	        }

	        activeMember._update(cachedMember.toJson());
	    };

	    RoomService.prototype.toString = function toString() {
	        return 'RoomService';
	    };

	    RoomService.prototype.stop = function stop() {
	        this._authService.stop();

	        disposeOfArray(this._disposables);
	    };

	    function resetSelf(sessionId) {
	        var self = this._self.getValue().toJson();
	        var roomService = this;

	        this._self.setValue(new Member(roomService, self.state, sessionId, self.screenName, self.role, self.streams, self.lastUpdate));
	    }

	    function resetRoom() {
	        var that = this;

	        var activeRoom = that._activeRoom.getValue();

	        if (!_.isObject(activeRoom)) {
	            return;
	        }

	        var roomId = activeRoom.getRoomId();
	        var alias = activeRoom.getObservableAlias().getValue();

	        that.leaveRoom(function() {
	            that.enterRoom(roomId, alias, function() {
	                that._logger.info('Room Reset Completed');
	            });
	        });
	    }

	    // handle events
	    function onRoomEvent(event) {
	        assert.isObject(event, 'event');
	        assert.isString(event.roomId, 'event.roomId');
	        assert.isString(event.eventType, 'event.eventType');
	        assert.isArray(event.members, 'event.members');

	        _.forEach(event.members, function(member) {
	            assert.isObject(member, 'member');
	        });

	        var that = this;

	        switch (event.eventType) {
	            case room.events.memberJoined.name:
	                that._logger.debug('[%s] Member joined [%s]', event.roomId, event.members);
	                return onMembersJoinsRoom.call(that, event.roomId, event.members);
	            case room.events.memberLeft.name:
	                that._logger.debug('[%s] Member left [%s]', event.roomId, event.members);
	                return onMembersLeavesRoom.call(that, event.roomId, event.members);
	            case room.events.memberUpdated.name:
	                that._logger.debug('[%s] Member updated [%s]', event.roomId, event.members);
	                return onMembersUpdated.call(that, event.roomId, event.members);
	            case room.events.roomUpdated.name:
	                that._logger.debug('[%s] Room updated [%s]', event.roomId, event.room);
	                return onRoomUpdated.call(that, event.roomId, event.room);
	            case room.events.roomEnded.name:
	                that._logger.info('[%s] Room ended', event.roomId);
	                break;
	            default:
	                that._logger.warn('Unsupported room event [%s]', event.eventType);
	        }
	    }

	    function onMembersJoinsRoom(roomId, members) {
	        var room = this._activeRoom.getValue();
	        var cachedRoom = this._cachedRoom.getValue();

	        if (!room || room.getRoomId() !== roomId) {
	            return;
	        }

	        room._removeMembers(members);
	        room._addMembers(members);

	        cachedRoom._removeMembers(members);
	        cachedRoom._addMembers(members);

	        this._logger.info('[%s] Room has now [%d] members', roomId, room.getObservableMembers().getValue().length);
	    }

	    function onMembersLeavesRoom(roomId, members) {
	        var room = this._activeRoom.getValue();
	        var cachedRoom = this._cachedRoom.getValue();

	        if (!room || room.getRoomId() !== roomId) {
	            return;
	        }

	        room._removeMembers(members);
	        cachedRoom._removeMembers(members);

	        this._logger.info('[%s] Room has now [%d] members', roomId, room.getObservableMembers().getValue().length);
	    }

	    function onMembersUpdated(roomId, members) {
	        var room = this._activeRoom.getValue();
	        var cachedRoom = this._cachedRoom.getValue();

	        if (!room || room.getRoomId() !== roomId) {
	            return;
	        }

	        room._updateMembers(members);
	        cachedRoom._updateMembers(members);

	        this._logger.info('[%s] Room has [%d] updated members', roomId, members.length);
	    }

	    function onRoomUpdated(roomId, room) {
	        var activeRoom = this._activeRoom.getValue();
	        var cachedRoom = this._cachedRoom.getValue();

	        if (!activeRoom || activeRoom.getRoomId() !== roomId) {
	            return;
	        }

	        cachedRoom._update(room);
	        activeRoom._update(room);
	    }

	    function handlePCastSessionIdChanged(sessionId) {
	        resetSelf.call(this, sessionId);
	    }

	    function findMemberInObservableRoom(sessionId, observableRoom) {
	        var room = observableRoom.getValue();
	        var members = room.getObservableMembers().getValue();
	        return findMemberInMembers(sessionId, members);
	    }

	    function findMemberInMembers(sessionId, members) {
	        return _.find(members, function(member) {
	            return sessionId === member.getSessionId();
	        });
	    }

	    function handlePCastStatusChange(status) {
	        this._logger.info('PCast status changed to [%s]', status);

	        if (status.toLowerCase() !== 'offline' && this._lastPcastStatus === 'offline') {
	            // ToDo (dcy) disabled until we determine what to do when the client goes back online
	            // resetRoom.call(this);
	        } else if (status.toLowerCase() === 'offline' && this._lastPcastStatus !== 'offline' && !_.isNullOrUndefined(this._lastPcastStatus)) {
	            // ToDo (dcy) disabled until we determine what to do when the client goes offline
	        }

	        this._lastPcastStatus = status;
	    }

	    function setupSubscriptions() {
	        var selfSubscription = this._self.subscribe(_.bind(resetRoom, this));

	        var pcastStatusSubscription = this._authService.getObservableStatus().subscribe(_.bind(handlePCastStatusChange, this));
	        var pcastSessionIdSubscription = this._authService.getObservableSessionId().subscribe(_.bind(handlePCastSessionIdChanged, this));

	        this._disposables.push(selfSubscription.dispose);
	        this._disposables.push(pcastStatusSubscription.dispose);
	        this._disposables.push(pcastSessionIdSubscription.dispose);
	    }

	    function disposeOfArray(arrayOfDisposables) {
	        if (!_.isArray(arrayOfDisposables)) {
	            return;
	        }

	        for (var i = 0; i < arrayOfDisposables.length; i++) {
	            if (typeof arrayOfDisposables[i] === 'function') {
	                arrayOfDisposables[i]();
	            }
	        }
	    }

	    // Requests to server
	    function buildMemberForRequest(member, memberToCompare) {
	        var memberForRequest = findDifferencesInSelf(member, memberToCompare);

	        memberForRequest.sessionId = member.getSessionId();
	        // last valid update from server. Handles collisions.
	        memberForRequest.lastUpdate = memberToCompare ? memberToCompare.getLastUpdate() : _.now();

	        return memberForRequest;
	    }

	    function findDifferencesInSelf(member, memberToCompare) {
	        if (memberToCompare === null) {
	            return member.toJson();
	        }

	        var memberForRequest = {};
	        var newMember = member.toJson();
	        var cachedMember = memberToCompare.toJson();
	        var differences = _.findDifferences(newMember, cachedMember, true);

	        _.forEach(differences, function(key) {
	            memberForRequest[key] = newMember[key];
	        });

	        return memberForRequest;
	    }

	    function getRoomInfoRequest(roomId, alias, callback) {
	        this._authService.assertAuthorized();

	        var that = this;

	        this._protocol.getRoomInfo(roomId, alias,
	            function handleCreateRoomResponse(error, response) {
	                if (error) {
	                    that._logger.error('Request to get room info failed with error [%s]', error);

	                    return callback(error, null);
	                }

	                var result = {status: response.status};

	                if (response.status !== 'ok') {
	                    that._logger.warn('Request to get room info failed with status [%s]', response.status);

	                    return callback(null, result);
	                }

	                result.room = _.freeze(createImmutableRoomFromResponse.call(this, response));

	                callback(null, result);
	            }
	        );
	    }

	    function createRoomRequest(roomName, type, description, callback) {
	        this._authService.assertAuthorized();

	        var that = this;

	        this._protocol.createRoom(roomName, type, description,
	            function handleCreateRoomResponse(error, response) {
	                if (error) {
	                    that._logger.error('Creating room failed with error [%s]', error);

	                    return callback(error, null);
	                }

	                var result = {status: response.status};

	                if (response.status !== 'ok' && response.status !== 'already-exists') {
	                    that._logger.warn('Creating room failed with status [%s]', response.status);

	                    return callback(null, result);
	                }

	                result.room = _.freeze(createImmutableRoomFromResponse.call(this, response));

	                callback(null, result);
	            }
	        );
	    }

	    function enterRoomRequest(roomId, alias, callback) {
	        this._authService.assertAuthorized();

	        var self = this._self.getValue();

	        var screenName = self.getObservableScreenName().getValue();
	        var role = self.getObservableRole().getValue();
	        var selfForRequest = buildMemberForRequest.call(this, self, null);
	        var timestamp = _.now();

	        this._logger.info('Enter room [%s]/[%s] with screen name [%s] and role [%s]', roomId, alias, screenName, role);

	        var that = this;

	        this._protocol.enterRoom(roomId, alias, selfForRequest, timestamp,
	            function handleEnterRoomResponse(error, response) {
	                if (error) {
	                    that._logger.error('Joining of room failed with error [%s]', error);

	                    return callback(error, null);
	                }

	                var result = {status: response.status};

	                if (response.status !== 'ok') {
	                    that._logger.warn('Joining of room failed with status [%s]', response.status);

	                    return callback(null, result);
	                }

	                result.room = initializeRoomAndBuildCache.call(that, response);

	                callback(null, result)
	            }
	        );
	    }

	    function leaveRoomRequest(callback) {
	        if (!this._activeRoom.getValue()) {
	            return this._logger.warn('Unable to leave room. Not currently in a room.');
	        }

	        this._authService.assertAuthorized();

	        var roomId = this._activeRoom.getValue().getRoomId();
	        var timestamp = _.now();

	        this._logger.info('Leave room [%s]', roomId);

	        var that = this;

	        this._protocol.leaveRoom(roomId, timestamp,
	            function handleLeaveRoomResponse(error, response) {
	                if (error) {
	                    that._logger.error('Leaving room failed with error [%s]', error);

	                    return callback(error, null);
	                }

	                var result = {status: response.status};

	                if (response.status !== 'ok') {
	                    that._logger.warn('Leaving room failed with status [%s]', response.status);

	                    return callback(null, result);
	                }

	                if (that._roomChatService) {
	                    that._roomChatService.stop();
	                }

	                that._roomChatService = null;

	                that._activeRoom.setValue(null);
	                that._cachedRoom.setValue(null);

	                callback(null, result);
	            }
	        );
	    }

	    function updateMemberRequest(member, callback) {
	        if (!this._activeRoom.getValue()) {
	            this._logger.warn('Not in a room. Please Enter a room before updating member.');

	            return callback('not-in-room');
	        }

	        this._authService.assertAuthorized();

	        var cachedMember = findMemberInObservableRoom(member.getSessionId(), this._cachedRoom);
	        var memberForRequest = buildMemberForRequest.call(this, member, cachedMember);
	        var timestamp = _.now();

	        this._logger.info('Updating member info for active room');

	        var that = this;

	        this._protocol.updateMember(memberForRequest, timestamp,
	            function handleUpdateMemberResponse(error, response) {
	                if (error) {
	                    that._logger.error('Update of member failed with error [%s]', error);

	                    return callback(error, null);
	                }

	                var result = {status: response.status};

	                if (response.status !== 'ok') {
	                    that._logger.warn('Update of member failed with status [%s]', response.status);
	                }

	                callback(null, result);
	            }
	        );
	    }

	    function updateRoomRequest(callback) {
	        if (!this._activeRoom.getValue()) {
	            this._logger.warn('Not in a room. Please Enter a room before updating member.');

	            return callback('not-in-room');
	        }

	        this._authService.assertAuthorized();

	        var room = this._activeRoom.getValue();
	        var timestamp = _.now();

	        var that = this;

	        this._protocol.updateRoom(room.toJson(), timestamp,
	            function handleUpdateMemberResponse(error, response) {
	                if (error) {
	                    that._logger.error('Update of room failed with error [%s]', error);

	                    return callback(error, null);
	                }

	                var result = {status: response.status};

	                if (response.status !== 'ok') {
	                    that._logger.warn('Update of room failed with status [%s]', response.status);
	                }

	                callback(null, result);
	            }
	        );
	    }

	    function createImmutableRoomFromResponse(response) {
	        var roomInfo = response.room;
	        var members = response.members || [];
	        var roomService = this;

	        return new ImmutableRoom(roomService, roomInfo.roomId, roomInfo.alias, roomInfo.name, roomInfo.description, roomInfo.type, members, roomInfo.bridgeId, roomInfo.pin);
	    }

	    function createRoomFromResponse(response) {
	        var roomInfo = response.room;
	        var members = response.members;
	        var roomService = this;

	        return new Room(roomService, roomInfo.roomId, roomInfo.alias, roomInfo.name, roomInfo.description, roomInfo.type, members, roomInfo.bridgeId, roomInfo.pin);
	    }

	    function initializeRoomAndBuildCache(response) {
	        var room = createRoomFromResponse.call(this, response);
	        var cachedRoom = createRoomFromResponse.call(this, response);

	        replaceSelfInstanceInRoom.call(this, room);

	        this._activeRoom.setValue(room);
	        this._cachedRoom.setValue(cachedRoom);

	        return room;
	    }

	    function replaceSelfInstanceInRoom(room) {
	        var self = this._self.getValue();
	        var members = room.getObservableMembers().getValue();

	        var selfIndex = _.findIndex(members, function(member) {
	            return self.getSessionId() === member.getSessionId();
	        });

	        if (!_.isNumber(selfIndex)) {
	            throw new Error('Invalid Room State: Self member not in room list of members.');
	        }

	        self._update(members[selfIndex].toJson());

	        members[selfIndex] = self;

	        room.getObservableMembers().setValue(members);
	    }

	    return RoomService;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(27),
	    __webpack_require__(28),
	    __webpack_require__(29),
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, Observable, ObservableArray, Room) {
	    'use strict';

	    function ImmutableRoom(roomService, id, alias, name, description, type, members, bridgeId, pin) {
	        this.init(roomService, id, alias, name, description, type, members, bridgeId, pin);
	    }

	    ImmutableRoom.prototype.init = function init(roomService, id, alias, name, description, type, members, bridgeId, pin) {
	        // don't pass roomService.
	        this._room = new Room(null, id, alias, name, description, type, members, bridgeId, pin);

	        makeArrayOrObjectObservablesImmutable(this._room);
	    };

	    ImmutableRoom.prototype.getRoomId = function getImmutableRoomId() {
	        return this._room.getRoomId();
	    };

	    ImmutableRoom.prototype.getObservableAlias = function getObservableAlias() {
	        return this._room.getObservableAlias();
	    };

	    ImmutableRoom.prototype.getObservableName = function getObservableName() {
	        return this._room.getObservableName();
	    };

	    ImmutableRoom.prototype.getObservableDescription = function getObservableDescription() {
	        return this._room.getObservableDescription();
	    };

	    ImmutableRoom.prototype.getObservableType = function getObservableType() {
	        return this._room.getObservableType();
	    };

	    ImmutableRoom.prototype.getObservableMembers = function getObservableMembers() {
	        return this._room.getObservableMembers();
	    };

	    ImmutableRoom.prototype.getObservableBridgeId = function getObservableBridgeId() {
	        return this._room.getObservableBridgeId();
	    };

	    ImmutableRoom.prototype.getObservablePin = function getObservablePin() {
	        return this._room.getObservablePin();
	    };

	    ImmutableRoom.prototype.toString = function toString() {
	        return this._room.toString();
	    };

	    ImmutableRoom.prototype.toJson = function toJson() {
	        return this._room.toJson();
	    };

	    ImmutableRoom.prototype.commitChanges = throwImmutableError;
	    ImmutableRoom.prototype.reload = throwImmutableError;
	    ImmutableRoom.prototype._update = throwImmutableError;
	    ImmutableRoom.prototype._addMembers = throwImmutableError;
	    ImmutableRoom.prototype._removeMembers = throwImmutableError;
	    ImmutableRoom.prototype._updateMembers = throwImmutableError;

	    function throwImmutableError() {
	        throw new Error('ImmutableRoom is Immutable');
	    }

	    function makeArrayOrObjectObservablesImmutable(collection) {
	        if (_.isArray(collection)) {
	            _.forEach(collection, function (value, index) {
	                wrapObservableAndAnyObservableProperties(value);
	            });
	        } else if (_.isObject(collection)) {
	            _.forOwn(collection, function (value, key) {
	                wrapObservableAndAnyObservableProperties(value);
	            })
	        }
	    }

	    function wrapObservableAndAnyObservableProperties(value) {
	        wrapObservable(value);
	        makeArrayOrObjectObservablesImmutable(value);
	    }

	    function wrapObservable(value) {
	        if (value instanceof Observable || value instanceof ObservableArray) {
	            value.setValue = throwImmutableError;
	            value.subscribe = throwImmutableError;

	            var observableValue = value.getValue();

	            makeArrayOrObjectObservablesImmutable(observableValue);
	        }
	    }

	    return ImmutableRoom;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert) {
	    'use strict';

	    function Observable(initialValue, beforeChange) {
	        this.latestValue = null;
	        this.subscribeCallbacks = {};
	        this.subscriptionTimeout = 100;
	        this.subscriptionCount = 0;
	        this.resetOnChange = false;
	        this.lastChangeTime = 0;
	        this.isPendingChanges = false;
	        this.beforeChange = beforeChange;

	        setLatestValue.call(this, initialValue);
	    }

	    Observable.prototype.getValue = function getValue() {
	        return clone(this.latestValue);
	    };

	    Observable.prototype.setValue = function setValue(value) {
	        if (value !== this.latestValue) {
	            setLatestValue.call(this, value);
	            onSubscribeCallback.call(this, this.subscriptionTimeout);
	        }
	    };

	    Observable.prototype.subscribe = function subscribe(callback, options) {
	        assert.isFunction(callback);

	        if (options) {
	            assert.isObject(options);
	        }

	        var that = this;
	        var key = _.uniqueId();
	        var listenForChanges;

	        that.subscribeCallbacks[key] = callback;
	        that.subscriptionCount += 1;

	        if (options) {
	            if (options.initial === 'notify') {
	                onSubscribeCallback.call(that, that.subscriptionTimeout);
	            }
	            if (options.listenForChanges) {
	                listenForChanges = setInterval(function() {
	                    var valueAtInterval = options.listenForChanges.callback();

	                    if (valueAtInterval !== that.latestValue) {
	                        that.setValue(valueAtInterval);
	                    }
	                }, options.listenForChanges.timeout)
	            }
	        }

	        function dispose() {
	            delete that.subscribeCallbacks[key];

	            if (listenForChanges) {
	                clearInterval(listenForChanges);

	                listenForChanges = null;
	            }

	            that.subscriptionCount -= 1;
	        }

	        return { dispose: dispose };
	    };

	    Observable.prototype.extend = function extend(options) {
	        assert.isObject(options);

	        switch (options.method) {
	            case 'notifyWhenChangesStop':
	                this.subscriptionTimeout = options.timeout;
	                this.resetOnChange = true;
	                break;
	            case 'notifyAtFixedRate':
	                this.subscriptionTimeout = options.timeout;
	                break;
	            default:
	                break;
	        }
	        if (_.isNumber(options.rateLimit)) {
	            this.subscriptionTimeout = options.rateLimit;
	        }

	        return this;
	    };

	    function clone(value) {
	        if (typeof value === 'undefined' || value === null) {
	            return value;
	        }

	        // necessary for observable array. Subsequent comparison must not be equal in order to trigger updates.
	        if (_.isArray(value)) {
	            return value.slice();
	        } else {
	            return value;
	        }
	    }

	    function setLatestValue(value) {
	        var valueToSet = value;

	        if (this.beforeChange) {
	            valueToSet = this.beforeChange(value);
	        }

	        this.latestValue = clone(valueToSet);
	    }

	    function onSubscribeCallback(timeoutLength) {
	        this.lastChangeTime = _.now();

	        if (!this.isPendingChanges && this.subscriptionCount !== 0) {
	            this.isPendingChanges = true;

	            continueAfterTimeout.call(this, timeoutLength)
	        }
	    }

	    function continueAfterTimeout(timeoutLength) {
	        var that = this;

	        setTimeout(function() {
	            var timeElapsedSinceLastChange = _.now() - that.lastChangeTime;

	            if (that.resetOnChange && timeElapsedSinceLastChange < that.subscriptionTimeout) {
	                continueAfterTimeout.call(that, that.subscriptionTimeout - timeElapsedSinceLastChange);
	            } else {
	                try {
	                    executeSubscriptionCallbacks.call(that);
	                } finally {
	                    that.isPendingChanges = false;
	                }
	            }
	        }, timeoutLength);
	    }

	    function executeSubscriptionCallbacks() {
	        var that = this;

	        _.forOwn(that.subscribeCallbacks, function (callback) {
	            if (_.isFunction(callback)) {
	                callback(that.latestValue);
	            }
	        });
	    }

	    return Observable;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(27)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, Observable) {
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

	    function updateArray(array, valuesToRemove, i) {
	        valuesToRemove.push(array[i]);
	        array.splice(i, 1);
	        i--;
	        return i;
	    }

	    return ObservableArray;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(27),
	    __webpack_require__(28),
	    __webpack_require__(30),
	    __webpack_require__(35)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, Observable, ObservableArray, Member, room) {
	    'use strict';
	    var roomTypes = room.types;

	    function Room(roomService, id, alias, name, description, type, members, bridgeId, pin) {
	        this.init(roomService, id, alias, name, description, type, members, bridgeId, pin);
	    }

	    Room.prototype.init = function init(roomService, id, alias, name, description, type, members, bridgeId, pin) {
	        assert.isString(id, 'id');
	        assert.isString(alias, 'alias');
	        assert.isString(name, 'name');
	        assert.isString(description, 'description');
	        assert.isArray(members, 'members');

	        if (bridgeId) {
	            assert.isString(bridgeId, 'bridgeId');
	        }
	        if (pin) {
	            assert.isString(pin, 'pin');
	        }
	        if (roomService) {
	            assert.isObject(roomService);
	        }

	        this._roomId = new Observable(id);
	        this._alias = new Observable(alias);
	        this._name = new Observable(name);
	        this._description = new Observable(description);
	        this._type = new Observable(type, assertIsValidRoomType);
	        this._members = new ObservableArray([]).extend({ method: "notifyWhenChangesStop", timeout: 400 });
	        this._options = new ObservableArray();
	        this._bridgeId = new Observable(bridgeId);
	        this._pin = new Observable(pin);
	        this._roomService = roomService;

	        setMembers.call(this, members);
	    };

	    Room.prototype.getRoomId = function getRoomId() {
	        return this._roomId.getValue();
	    };

	    Room.prototype.getObservableAlias = function getObservableAlias() {
	        return this._alias;
	    };

	    Room.prototype.getObservableName = function getObservableName() {
	        return this._name;
	    };

	    Room.prototype.getObservableDescription = function getObservableDescription() {
	        return this._description;
	    };

	    Room.prototype.getObservableType = function getObservableType() {
	        return this._type;
	    };

	    Room.prototype.getObservableMembers = function getObservableMembers() {
	        return this._members;
	    };

	    Room.prototype.getObservableBridgeId = function getObservableBridgeId() {
	        return this._bridgeId;
	    };

	    Room.prototype.getObservablePin = function getObservablePin() {
	        return this._pin;
	    };

	    Room.prototype.toString = function toString() {
	        return this._type.getValue() + '[' + this._roomId.getValue() + ']';
	    };

	    Room.prototype.toJson = function toJson() {
	        return {
	            roomId: this._roomId.getValue(),
	            alias: this._alias.getValue(),
	            name: this._name.getValue(),
	            description: this._description.getValue(),
	            type: this._type.getValue(),
	            pin: this._pin.getValue(),
	            bridgeId: this._bridgeId.getValue()
	        }
	    };

	    Room.prototype.commitChanges = function commitChanges(callback) {
	        assert.isObject(this._roomService);

	        this._roomService.updateRoom(this, callback);
	    };

	    Room.prototype.reload = function reload() {
	        assert.isObject(this._roomService);

	        this._roomService.revertRoomChanges(this);
	    };

	    Room.prototype._update = function update(room) {
	        if (!_.isObject(room)) {
	            return;
	        }

	        if (room.roomId) {
	            this._roomId.setValue(room.roomId);
	        }

	        if (room.alias) {
	            this._alias.setValue(room.alias);
	        }

	        if (room.name) {
	            this._name.setValue(room.name);
	        }

	        if (room.description) {
	            this._description.setValue(room.description);
	        }

	        if (room.type) {
	            this._type.setValue(room.type);
	        }

	        if (room.options) {
	            this._options.setValue(room.options);
	        }

	        if (room.bridgeId) {
	            this._bridgeId.setValue(room.bridgeId);
	        }

	        if (room.pin) {
	            this._pin.setValue(room.pin);
	        }

	        if (room.members) {
	            // DO NOTHING -- members updated by member events
	        }
	    };

	    Room.prototype._addMembers = function addMembers(members) {
	        var that = this;

	        var newMembers = mapMembers(members);

	        _.forEach(newMembers, function (member) {
	            that._members.push(member);
	        });
	    };

	    Room.prototype._removeMembers = function removeMembers(members) {
	        var that = this;

	        _.forEach(members, function(member) {
	            that._members.remove(function(observableMember) {
	                return member.sessionId === observableMember.getSessionId()
	                    && member.lastUpdate >= observableMember.getObservableLastUpdate().getValue();
	            });
	        });
	    };

	    Room.prototype._updateMembers = function updateMembers(members) {
	        _.forEach(this._members.getValue(), function (observableMember) {
	            var memberToUpdate = _.find(members, function(member) {
	                return observableMember.getSessionId() === member.sessionId && member.lastUpdate > observableMember.getObservableLastUpdate().getValue();
	            });

	            if (memberToUpdate) {
	                observableMember._update(memberToUpdate);
	            }
	        });
	    };

	    function setMembers(members) {
	        var newMembers = mapMembers(members, this._roomService);

	        this._members.setValue(newMembers);
	    }

	    function mapMembers(members, roomService) {
	        return _.map(members, function(member) {
	            return new Member(roomService, member.state, member.sessionId, member.screenName, member.role, member.streams, member.lastUpdate);
	        });
	    }

	    function assertIsValidRoomType(type) {
	        type = _.getEnumName(roomTypes, type);

	        if (!type) {
	            throw new Error('"type" must be a valid room type');
	        }

	        return type;
	    }

	    return Room;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(27),
	    __webpack_require__(28),
	    __webpack_require__(31),
	    __webpack_require__(34)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, Observable, ObservableArray, Stream, member) {
	    'use strict';
	    var memberRoles = member.roles;
	    var memberStates = member.states;

	    function Member(roomService, state, sessionId, screenName, role, streams, lastUpdate) {
	        this.init(roomService, state, sessionId, screenName, role, streams, lastUpdate);
	    }

	    Member.prototype.init = function init(roomService, state, sessionId, screenName, role, streams, lastUpdate) {
	        assert.isString(sessionId, 'sessionId');
	        assert.isString(screenName, 'screenName');
	        assert.isArray(streams, 'streams');
	        assert.isNumber(_.utc(lastUpdate), 'lastUpdate');

	        if (roomService) {
	            assert.isObject(roomService);
	        }

	        this._sessionId = new Observable(sessionId);
	        this._screenName = new Observable(screenName);
	        this._streams = new ObservableArray([]);

	        this._state = new Observable(state, assertIsValidMemberState).extend({rateLimit:500});
	        this._role = new Observable(role, assertIsValidMemberRole);
	        this._lastUpdate = new Observable(lastUpdate, _.utc);
	        this._roomService = roomService;

	        this.setStreams(streams);
	    };

	    Member.prototype.getObservableState = function getObservableState() {
	        return this._state;
	    };

	    Member.prototype.getSessionId = function getSessionId() {
	        return this._sessionId.getValue();
	    };

	    Member.prototype.getObservableScreenName = function getObservableScreenName() {
	        return this._screenName;
	    };

	    Member.prototype.getObservableRole = function getObservableRole() {
	        return this._role;
	    };

	    Member.prototype.getObservableStreams = function getObservableStreams() {
	        return this._streams;
	    };

	    Member.prototype.getObservableLastUpdate = function getObservableLastUpdate() {
	        return this._lastUpdate;
	    };

	    Member.prototype.getLastUpdate = function getLastUpdate() {
	        return this._lastUpdate.getValue();
	    };

	    Member.prototype.getStreams = function getStreams() {
	        return _.map(this._streams.getValue(), function mapToJson(stream) {
	            return stream.toJson();
	        })
	    };

	    Member.prototype.commitChanges = function commitChanges(callback) {
	        assert.isObject(this._roomService);

	        this._roomService.updateMember(this, callback);
	    };

	    Member.prototype.reload = function reload() {
	        assert.isObject(this._roomService);

	        this._roomService.revertMemberChanges(this);
	    };

	    Member.prototype.setStreams = function setStreams(streams) {
	        var newStreams = _.map(streams, function(stream) {
	            return createNewObservableStream(stream);
	        });

	        this._streams.setValue(newStreams);
	    };

	    Member.prototype.toString = function toString() {
	        return this.getObservableRole().getValue() + '[' + this.getObservableScreenName().getValue() + ',' + this.getSessionId() + ']';
	    };

	    Member.prototype.toJson = function toJson() {
	        var member = {
	            sessionId: this._sessionId.getValue(),
	            screenName: this._screenName.getValue(),
	            role: this._role.getValue(),
	            state: this._state.getValue(),
	            streams: [],
	            lastUpdate: this._lastUpdate.getValue()
	        };

	        _.forEach(this._streams.getValue(), function(stream) {
	            member.streams.push(stream.toJson());
	        });

	        return member;
	    };

	    Member.prototype._update = function update(member) {
	        if (!_.isObject(member)) {
	            return;
	        }

	        if (member.hasOwnProperty('state')) {
	            this._state.setValue(member.state);
	        }

	        if (member.hasOwnProperty('screenName')) {
	            this._screenName.setValue(member.screenName);
	        }

	        if (member.hasOwnProperty('role')) {
	            this._role.setValue(member.role);
	        }

	        if (member.hasOwnProperty('lastUpdate')) {
	            this._lastUpdate.setValue(member.lastUpdate);
	        }

	        if (member.hasOwnProperty('streams')) {
	            updateStreams.call(this, member.streams);
	        }
	    };

	    function createNewObservableStream(stream) {
	        return new Stream(stream.uri, stream.type, stream.audioState, stream.videoState);
	    }

	    function updateStreams(streams) {
	        // iterate through new streams object, update those that have changed, push new ones, remove old ones
	        var oldObservableStreams = this._streams.getValue();
	        var newObservableStreams = [];

	        _.forEach(streams, function (stream) {
	            var streamToUpdate = _.find(oldObservableStreams, function(observableStream) {
	                return observableStream.getUri() === stream.uri && observableStream.getType() === stream.type;
	            });
	            if (streamToUpdate) {
	                streamToUpdate._update(stream);
	            } else {
	                streamToUpdate = createNewObservableStream(stream);
	            }

	            newObservableStreams.push(streamToUpdate);
	        });

	        this._streams.setValue(newObservableStreams);
	    }

	    function assertIsValidMemberRole(role) {
	        role = _.getEnumName(memberRoles, role);

	        if (!role) {
	            throw new Error('"role" must be a valid member role');
	        }

	        return role;
	    }

	    function assertIsValidMemberState(state) {
	        state = _.getEnumName(memberStates, state);

	        if (!state) {
	            throw new Error('"state" must be a valid member state');
	        }

	        return state;
	    }

	    return Member;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(27),
	    __webpack_require__(28),
	    __webpack_require__(32),
	    __webpack_require__(33)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, Observable, ObservableArray, stream, track) {
	    'use strict';

	    var streamTypes = stream.types;
	    var trackStates = track.states;

	    function Stream(uri, type, audioState, videoState) {
	        this.init(uri, type, audioState, videoState);
	    }

	    Stream.prototype.init = function (uri, type, audioState, videoState) {
	        assert.isString(uri, 'uri');

	        this._uri = new Observable(uri);
	        this._type = new Observable(type, assertIsValidStreamType);
	        this._audioState = new Observable(audioState || trackStates.trackEnabled.name, assertIsValidTrackState);
	        this._videoState = new Observable(videoState || trackStates.trackEnabled.name, assertIsValidTrackState);
	    };

	    Stream.prototype.getUri = function getUri() {
	        return this._uri.getValue();
	    };

	    Stream.prototype.getType = function getType() {
	        return this._type.getValue();
	    };

	    Stream.prototype.getObservableAudioState = function getObservableAudioState() {
	        return this._audioState;
	    };

	    Stream.prototype.getObservableVideoState = function getObservableVideoState() {
	        return this._videoState;
	    };

	    Stream.prototype.toJson = function toJson() {
	        return {
	            uri: this._uri.getValue(),
	            type: this._type.getValue(),
	            audioState: this._audioState.getValue(),
	            videoState: this._videoState.getValue()
	        };
	    };

	    Stream.prototype._update = function update(stream) {
	        if (!_.isObject(stream)) {
	            return;
	        }

	        if (stream.hasOwnProperty('audioState')) {
	            this._audioState.setValue(stream.audioState);
	        }

	        if (stream.hasOwnProperty('videoState')) {
	            this._videoState.setValue(stream.videoState);
	        }
	    };

	    function assertIsValidStreamType(type) {
	        type = _.getEnumName(streamTypes, type);

	        if (!type) {
	            throw new Error('"type" must be a valid stream type');
	        }

	        return type;
	    }

	    function assertIsValidTrackState(state) {
	        state = _.getEnumName(trackStates, state);

	        if (!state) {
	            throw new Error('"state" must be a valid track state');
	        }

	        return state;
	    }

	    return Stream;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var streamEnums = {
	        types: {
	            user: { id: 0, name: 'User' },
	            presentation: { id: 1, name: 'Presentation' },
	            audio: { id: 2, name: 'Audio' },
	        }
	    };

	    return streamEnums;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var trackEnums = {
	        states: {
	            trackEnabled: { id: 0, name: 'TrackEnabled' },
	            trackDisabled: { id: 1, name: 'TrackDisabled' },
	            trackEnded: { id: 2, name: 'TrackEnded' },
	        }
	    };

	    return trackEnums;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var memberEnums = {
	        roles: {
	            participant: {id: 0, name: 'Participant'},
	            moderator: {id: 1, name: 'Moderator'},
	            presenter: {id: 2, name: 'Presenter'},
	            audience: {id: 3, name: 'Audience'}
	        },
	        states: {
	            active: {id: 0, name: 'Active'},
	            passive: {id: 1, name: 'Passive'},
	            handRaised: {id: 2, name: 'HandRaised'},
	            inactive: {id: 3, name: 'Inactive'},
	            offline: {id: 4, name: 'Offline'}
	        }
	    };

	    return memberEnums;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var roomEnums = {
	        types: {
	            directChat: { id: 0, name: 'DirectChat' },
	            multiPartyChat: { id: 1, name: 'MultiPartyChat' },
	            moderatedChat: { id: 2, name: 'ModeratedChat' },
	            townHall: { id: 3, name: 'TownHall' },
	            channel: { id: 4, name: 'Channel' }
	        },
	        events: {
	            memberJoined: { id: 0, name: 'MemberJoined' },
	            memberLeft: { id: 1, name: 'MemberLeft' },
	            memberUpdated: { id: 2, name: 'MemberUpdated' },
	            roomUpdated: { id: 3, name: 'RoomUpdated' },
	            roomEnded: { id: 4, name: 'RoomEnded' },
	        }
	    }

	    return roomEnums;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(27),
	    __webpack_require__(37)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, Observable, ObservableMonitor) {
	    'use strict';

	    function AuthenticationService(pcast) {
	        this._sessionId = new Observable();
	        this._status = new Observable();
	        this._sessionIdMonitor = new ObservableMonitor(this._sessionId);
	        this._statusMonitor = new ObservableMonitor(this._status);

	        this.init(pcast);
	    }

	    AuthenticationService.prototype.init = function init(pcast) {
	        assert.isObject(pcast, 'pcast');
	        assert.isFunction(pcast.getStatus, 'pcast.getStatus');
	        assert.isFunction(pcast.getLogger, 'pcast.getLogger');
	        assert.isFunction(pcast.getProtocol, 'pcast.getProtocol');

	        if (this._pcast === pcast) {
	            return;
	        }

	        this._pcast = pcast;
	        this._logger = pcast.getLogger();
	        this._protocol = pcast.getProtocol();

	        assert.isObject(this._logger, 'this._logger');
	        assert.isObject(this._protocol, 'this._protocol');
	        assert.isFunction(this._protocol.getSessionId, 'this._protocol.getSessionId');
	        assert.isFunction(this._pcast.getStatus, 'this._pcast.getStatus');

	        this._sessionId.setValue(this.getPCastSessionId());
	        this._status.setValue(this.getPCastStatus());
	    };

	    AuthenticationService.prototype.start = function start() {
	        if (!this._sessionIdMonitor.isEnabled()) {
	            this._sessionIdMonitor.start(_.bind(this.getPCastSessionId, this));
	        }

	        if (!this._statusMonitor.isEnabled()) {
	            this._statusMonitor.start(_.bind(this.getPCastStatus, this));
	        }
	    };

	    AuthenticationService.prototype.stop = function stop() {
	        if (this._sessionIdMonitor.isEnabled()) {
	            this._sessionIdMonitor.stop();
	        }
	        if (this._statusMonitor.isEnabled()) {
	            this._statusMonitor.stop();
	        }
	    };

	    AuthenticationService.prototype.assertAuthorized = function assertAuthorized() {
	        if (!validPCastStatus(this.getPCastStatus())) {
	            throw new Error('Unable to perform action. Status [%s]. Please wait to reconnect.', this.getPCastStatus());
	        }

	        if (!validPCastSessionId(this.getPCastSessionId())) {
	            throw new Error('Unable to perform action. Invalid sessionId [%s]', this.getPCastSessionId());
	        }
	    };

	    AuthenticationService.prototype.getObservableSessionId = function getObservableSessionId() {
	        return this._sessionId;
	    };

	    AuthenticationService.prototype.getObservableStatus = function getObservableStatus() {
	        return this._status;
	    };

	    AuthenticationService.prototype.getPCastSessionId = function getPCastSessionId() {
	        return this._protocol.getSessionId();
	    };

	    AuthenticationService.prototype.getPCastStatus = function getPCastStatus() {
	        return this._pcast.getStatus();
	    };

	    function validPCastSessionId(sessionId) {
	        return sessionId !== null && sessionId !== undefined && sessionId !== '';
	    }

	    function validPCastStatus(status) {
	        return status !== null && status !== undefined && status !== '' && status.toLowerCase() !== 'offline';
	    }

	    return AuthenticationService;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert) {
	    'use strict';

	    function ObservableMonitor(observable) {
	        assert.isObject(observable, 'observable');

	        this._observable = observable;
	        this._listenerSubscription = null;
	        this._isEnabled = false;
	    }

	    ObservableMonitor.prototype.start = function start(checkForChanges, timeout) {
	        this._isEnabled = true;

	        this._listenerSubscription = this._observable.subscribe(_.noop, {
	            listenForChanges: {
	                callback: checkForChanges,
	                timeout: timeout || 500
	            }
	        });
	    };

	    ObservableMonitor.prototype.stop = function stop() {
	        this._isEnabled = false;

	        if (this._listenerSubscription) {
	            this._listenerSubscription.dispose();
	        }

	        this._listenerSubscription = null;
	    };

	    ObservableMonitor.prototype.isEnabled = function isEnabled() {
	        return this._isEnabled;
	    };

	    return ObservableMonitor;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(28),
	    __webpack_require__(39)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, ObservableArray, ChatService) {
	    'use strict';

	    var defaultBatchSize = 0;
	    var maxCachedQueueSize = 100;

	    function RoomChatService(roomService) {
	        assert.isObject(roomService, 'roomService');
	        assert.isObject(roomService._pcast, 'roomService._pcast');
	        assert.isObject(roomService._logger, 'roomService._logger');

	        this._roomService = roomService;
	        this._pcast = roomService._pcast;
	        this._logger = roomService._logger;
	        this._chatService = new ChatService(this._pcast);
	        this._chatMessages = new ObservableArray([]);
	        this._latestMessageQueue = [];
	        this._disposables = [];
	    }

	    RoomChatService.prototype.start = function start(batchSize) {
	        this._batchSize = batchSize || defaultBatchSize;
	        this._chatService.start();

	        setupSubscriptions.call(this);
	        setupMessageSubscription.call(this);
	    };

	    RoomChatService.prototype.stop = function stop() {
	        this._chatService.stop();

	        disposeOfMessageSubscription.call(this);

	        disposeOfArray(this._disposables);
	    };

	    RoomChatService.prototype.getObservableChatMessages = function getObservableChatMessages() {
	        return this._chatMessages;
	    };

	    RoomChatService.prototype.getObservableChatEnabled = function getObservableChatEnabled() {
	        return this._chatService.getObservableChatEnabled();
	    };

	    RoomChatService.prototype.sendMessageToRoom = function sendMessageToRoom(message, callback) {
	        var room = this._roomService.getObservableActiveRoom().getValue();
	        var roomId = room.getRoomId();
	        var self = this._roomService._self.getValue();
	        var screenName = self.getObservableScreenName().getValue();
	        var role = self.getObservableRole().getValue();
	        var lastUpdate = self.getLastUpdate();

	        this._chatService.sendMessageToRoom(roomId, screenName, role, lastUpdate, message, callback);
	    };

	    RoomChatService.prototype.getMessages = function getMessages(batchSize, afterMessageId, beforeMessageId, callback) {
	        var room = this._roomService.getObservableActiveRoom().getValue();
	        var roomId = room.getRoomId();

	        return this._chatService.getMessages(roomId, batchSize, afterMessageId, beforeMessageId, callback);
	    };

	    RoomChatService.prototype.toString = function toString() {
	        return 'RoomChatService';
	    };

	    function onRoomChange(room) {
	        disposeOfMessageSubscription.call(this);

	        if (room) {
	            setupMessageSubscription.call(this);
	        }
	    }

	    function setupSubscriptions() {
	        var roomSubscription = this._roomService.getObservableActiveRoom().subscribe(_.bind(onRoomChange, this));

	        this._disposables.push(roomSubscription.dispose);
	    }

	    function setupMessageSubscription() {
	        disposeOfMessageSubscription.call(this);

	        this._roomChatSubscriptionDispose = subscribeAndLoadMessages.call(this, this._batchSize);
	    }

	    function disposeOfMessageSubscription() {
	        if (this._roomChatSubscriptionDispose) {
	            this._roomChatSubscriptionDispose();
	        }
	    }

	    function subscribeAndLoadMessages(batchSize) {
	        var room = this._roomService.getObservableActiveRoom().getValue();
	        var roomId = room.getRoomId();

	        var that = this;

	        this._chatMessages.setValue([]);

	        return this._chatService.subscribeAndLoadMessages(roomId, batchSize, function onReceiveMessages(error, response) {
	            if (error) {
	                throw error;
	            }
	            if (response.status !== 'ok') {
	                throw new Error('Unable to subscribe to room chat. Status ' + status);
	            }

	            var messages = that._chatMessages.getValue();

	            _.forEach(response.chatMessages, function addMessage(message) {
	                messages.push(message);
	            });

	            if (messages.length > maxCachedQueueSize) {
	                messages.splice(0, messages.length - maxCachedQueueSize);
	            }

	            that._chatMessages.setValue(messages);
	        });
	    }

	    function disposeOfArray(arrayOfDisposables) {
	        if (!_.isArray(arrayOfDisposables)) {
	            return;
	        }

	        for (var i = 0; i < arrayOfDisposables.length; i++) {
	            if (typeof arrayOfDisposables[i] === 'function') {
	                arrayOfDisposables[i]();
	            }
	        }
	    }

	    return RoomChatService;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(27),
	    __webpack_require__(36)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, Observable, AuthenticationService) {
	    'use strict';

	    function ChatService(pcast) {
	        assert.isObject(pcast, 'pcast');
	        assert.isFunction(pcast.getLogger, 'pcast.getLogger');
	        assert.isFunction(pcast.getProtocol, 'pcast.getProtocol');

	        this._pcast = pcast;
	        this._logger = pcast.getLogger();
	        this._protocol =  pcast.getProtocol();
	        this._enabled = new Observable(false);

	        assert.isObject(this._logger, 'this._logger');
	        assert.isObject(this._protocol, 'this._protocol');

	        this._authService = new AuthenticationService(this._pcast);
	    }

	    ChatService.prototype.start = function start() {
	        if (this._enabled.getValue()) {
	            return;
	        }

	        this._disposables = [];
	        this._roomMessagesListeners = {};

	        this._enabled.setValue(true);
	        this._authService.start();
	        setupSubscriptions.call(this);

	        var disposeOfConversationHandler = this._protocol.on('roomChatEvent', _.bind(onRoomConversationEvent, this));

	        this._disposables.push(disposeOfConversationHandler);
	    };

	    ChatService.prototype.stop = function stop() {
	        if (!this._enabled.getValue()) {
	            return;
	        }

	        this._authService.stop();

	        disposeOfArray(this._disposables);
	    };

	    ChatService.prototype.getObservableChatEnabled = function getObservableChatEnabled() {
	        return this._enabled;
	    };

	    ChatService.prototype.sendMessageToRoom = function sendMessageToRoom(roomId, screenName, role, lastUpdate, message, callback) {
	        sendMessageRequest.call(this, roomId, screenName, role, lastUpdate, message, callback);
	    };

	    ChatService.prototype.subscribeAndLoadMessages = function subscribeAndLoadMessages(roomId, batchSize, onReceiveMessages) {
	        var disposeOfListener = setupChatListener.call(this, roomId, onReceiveMessages);

	        subscribeToRoomConversationRequest.call(this, roomId, batchSize);

	        return disposeOfListener;
	    };

	    ChatService.prototype.getMessages = function getMessages(roomId, batchSize, afterMessageId, beforeMessageId, onReceiveMessages) {
	        getMessagesRequest.call(this, roomId, batchSize, afterMessageId, beforeMessageId, onReceiveMessages);
	    };

	    ChatService.prototype.toString = function toString() {
	        return 'ChatService';
	    };

	    function setupSubscriptions() {
	        var pcastStatusSubscription = this._authService.getObservableStatus().subscribe(_.bind(onStatusChange, this));
	        var pcastSessionIdSubscription = this._authService.getObservableSessionId().subscribe(_.bind(onSessionIdChange, this));

	        this._disposables.push(pcastStatusSubscription.dispose);
	        this._disposables.push(pcastSessionIdSubscription.dispose);
	    }

	    function setupChatListener(roomId, onReceiveMessages) {
	        var that = this;

	        this._roomMessagesListeners[roomId] = onReceiveMessages;

	        var disposeOfHandler = function() {
	            if (that._roomMessagesListeners[roomId] === onReceiveMessages) {
	                delete that._roomMessagesListeners[roomId];
	            }
	        };

	        this._disposables.push(disposeOfHandler);

	        return disposeOfHandler;
	    }

	    function onRoomConversationEvent(event) {
	        assert.isObject(event, 'event');
	        assert.stringNotEmpty(event.roomId, 'event.roomId');
	        assert.stringNotEmpty(event.eventType, 'event.eventType');
	        assert.isArray(event.chatMessages, 'event.chatMessages');

	        switch (event.eventType) {
	            case 'Message':
	                this._logger.debug('[%s] Room messages [%s]', event.roomId, event.chatMessages);
	                var listener = this._roomMessagesListeners[event.roomId];

	                convertTimeFromLongInChatMessages(event.chatMessages);

	                if (listener) {
	                    listener(null, {status: 'ok', chatMessages: event.chatMessages});
	                }
	                break;
	            default:
	                this._logger.warn('Unsupported room conversation event [%s]', event.eventType)
	        }
	    }

	    function onStatusChange(status) {
	        switch (status.toLowerCase()) {
	            case 'offline':
	                return;
	            case 'online':
	                return refreshMessageSubscriptions.call(this);
	        }
	    }

	    function onSessionIdChange() {
	        refreshMessageSubscriptions.call(this);
	    }

	    function refreshMessageSubscriptions() {
	        var that = this;

	        _.forOwn(this._roomMessagesListeners, function(listener, roomId) {
	            subscribeToRoomConversationRequest.call(that, roomId, 1);
	        });
	    }

	    function getMessagesRequest(roomId, batchSize, afterMessageId, beforeMessageId, callback) {
	        assert.stringNotEmpty(roomId, 'roomId');
	        assert.isFunction(callback, 'callback');

	        if (!beforeMessageId || !afterMessageId) {
	            assert.isNumber(batchSize, 'batchSize');
	        }

	        if (beforeMessageId) {
	            assert.stringNotEmpty(beforeMessageId, 'beforeMessageId');
	        }

	        if (afterMessageId) {
	            assert.stringNotEmpty(afterMessageId, 'afterMessageId');
	        }

	        assertEnabled.call(this);
	        this._authService.assertAuthorized();

	        var sessionId = this._authService.getPCastSessionId();

	        this._logger.info('Get messages from room [%s] conversation with batch size of [%s], after [%s], and before [%s]', roomId, batchSize, afterMessageId, beforeMessageId);

	        var that = this;

	        this._protocol.getMessages(sessionId, roomId, batchSize, afterMessageId, beforeMessageId,
	            function (error, response) {
	                if (error) {
	                    that._logger.error('Get messages from room conversation failed with error [%s]', error);

	                    return callback(error, null);
	                }

	                var result = {status: response.status};

	                if (response.status !== 'ok') {
	                    that._logger.warn('Get messages from room conversation failed with status [%s]', response.status);

	                    return callback(null, result);
	                }

	                result.chatMessages = response.chatMessages;

	                convertTimeFromLongInChatMessages(result.chatMessages);

	                callback(null, result);
	            }
	        );
	    }

	    function subscribeToRoomConversationRequest(roomId, batchSize) {
	        assert.stringNotEmpty(roomId, 'roomId');
	        assert.isNumber(batchSize, 'batchSize');

	        assertEnabled.call(this);
	        this._authService.assertAuthorized();

	        var sessionId = this._authService.getPCastSessionId();

	        this._logger.info('Subscribe to room [%s] conversation with batch size of [%s]', roomId, batchSize);

	        var that = this;

	        this._protocol.subscribeToRoomConversation(sessionId, roomId, batchSize, function (error, response) {
	            var onReceiveMessages = that._roomMessagesListeners[roomId];

	            if (!onReceiveMessages) {
	                return that._logger.warn('No subscription callback set for room [%s]', roomId);
	            }

	            if (error) {
	                that._logger.error('Subscribe to room conversation failed with error [%s]', error);

	                return onReceiveMessages(error, null);
	            }

	            var result = {status: response.status};

	            if (response.status !== 'ok') {
	                delete that._roomMessagesListeners[roomId];

	                that._logger.warn('Subscribe to room conversation failed with status [%s]', response.status);

	                return onReceiveMessages(null, result);
	            }

	            result.chatMessages = response.chatMessages;

	            convertTimeFromLongInChatMessages(result.chatMessages);

	            onReceiveMessages(null, result);
	        });
	    }

	    function sendMessageRequest(roomId, screenName, role, lastUpdate, message, callback) {
	        assert.stringNotEmpty(roomId, 'roomId');
	        assert.stringNotEmpty(screenName, 'screenName');
	        assert.stringNotEmpty(role, 'role');
	        assert.isNumber(lastUpdate, 'lastUpdate');
	        assert.stringNotEmpty(message, 'message');
	        assert.isFunction(callback, 'callback');

	        assertEnabled.call(this);
	        this._authService.assertAuthorized();

	        var sessionId = this._authService.getPCastSessionId();

	        var chatMessage = {
	            messageId: '',
	            timestamp: 0,
	            from: {
	                sessionId: sessionId,
	                screenName: screenName,
	                role: role,
	                lastUpdate: lastUpdate
	            },
	            message: message
	        };

	        this._logger.info('Send message to room [%s] from [%s]', roomId, screenName);

	        var that = this;

	        return this._protocol.sendMessageToRoom(roomId, chatMessage, function (error, response) {
	            if (error) {
	                that._logger.error('Send message to room failed with error [%s]', error);

	                return callback(error, null);
	            }

	            var result = {status: response.status};

	            if (response.status !== 'ok') {
	                that._logger.warn('Send message to room failed with status [%s]', response.status);
	            }

	            callback(null, result);
	        });
	    }

	    function assertEnabled() {
	        if (!this._enabled.getValue()) {
	            throw new Error('ChatService not Enabled. Please start before performing actions.');
	        }
	    }

	    function convertTimeFromLongInChatMessages(chatMessages) {
	        _.forEach(chatMessages, function(chatMessage) {
	            convertTimeFromLongInChatMessage(chatMessage);
	        });
	    }

	    function convertTimeFromLongInChatMessage(chatMessage) {
	        if (chatMessage.timestamp) {
	            chatMessage.timestamp = _.utc(chatMessage.timestamp);
	        }
	        if (chatMessage.from) {
	            chatMessage.from.lastUpdate = _.utc(chatMessage.from.lastUpdate);
	        }
	    }

	    function disposeOfArray(arrayOfDisposables) {
	        if (!_.isArray(arrayOfDisposables)) {
	            return;
	        }

	        for (var i = 0; i < arrayOfDisposables.length; i++) {
	            if (typeof arrayOfDisposables[i] === 'function') {
	                arrayOfDisposables[i]();
	            }
	        }
	    }

	    return ChatService;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(19),
	    __webpack_require__(21),
	    __webpack_require__(41),
	    __webpack_require__(42),
	    __webpack_require__(43)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, pcastLoggerFactory, PCastEndPoint, AudioContext, AudioVolumeMeter, AudioSpeakerDetectionAlgorithm) {
	    'use strict';

	    function AudioSpeakerDetector(userMediaStreams, options) {
	        assert.isArray(userMediaStreams, 'userMediaStreams');

	        options = options || {};

	        this._baseUri = options.uri || PCastEndPoint.DefaultPCastUri;
	        this._logger = options.logger || pcastLoggerFactory.createPCastLogger(this._baseUri);
	        this._audioContext = options.audioContext || new AudioContext();
	        this._nativeAudioContext = this._audioContext.getNativeAudioContext();
	        this._audioVolumeMeters = [];
	        this._onSpeakingChanged = null;
	        this._userMediaStreams = userMediaStreams;
	        this._disposeOfAudioContext = !_.isObject(options.audioContext);
	    }

	    AudioSpeakerDetector.prototype.start = function start(options, callback) {
	        assert.isFunction(callback, 'callback');

	        this._onSpeakingChanged = callback;

	        options = options || {};

	        _.forEach(this._userMediaStreams, _.bind(setupSpeakingDetection, this, options));
	    };

	    AudioSpeakerDetector.prototype.stop = function stop() {
	        _.forEach(this._audioVolumeMeters, function stopAudioVolumeMeters(meter) {
	            meter.stop();
	        });

	        this._onSpeakingChanged = null;
	    };

	    AudioSpeakerDetector.prototype.dispose = function dispose() {
	        if (this._disposeOfAudioContext) {
	            this._nativeAudioContext.close();
	        }

	        this._userMediaStreams = null;
	    };

	    AudioSpeakerDetector.prototype.toString = function toString() {
	        return 'AudioSpeakerDetector';
	    };

	    function setupSpeakingDetection(options, stream) {
	        var audioVolumeMeter = new AudioVolumeMeter(this._logger);
	        var audioSpeakerDetectionAlgorithm = new AudioSpeakerDetectionAlgorithm(this._logger);

	        audioVolumeMeter.init(this._nativeAudioContext, options.alpha);
	        audioVolumeMeter.connect(stream);

	        audioSpeakerDetectionAlgorithm.onValue(this._onSpeakingChanged);
	        audioSpeakerDetectionAlgorithm.startDetection(audioVolumeMeter, options);

	        this._audioVolumeMeters.push(audioVolumeMeter)
	    }

	    return AudioSpeakerDetector;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert) {
	    'use strict';

	    function AudioContext() {
	        this.init();
	    }

	    AudioContext.prototype.init = function init() {
	        if (!window.AudioContext) {
	            throw new Error('Browser does not support AudioContext')
	        }

	        this._audioContext = new window.AudioContext();
	    };

	    AudioContext.prototype.getNativeAudioContext = function getNativeAudioContext() {
	        return this._audioContext;
	    };

	    AudioContext.prototype.toString = function toString() {
	        return 'AudioContext';
	    };

	    return AudioContext;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert) {
	    'use strict';

	    var defaultAlpha = 1/16;

	    function AudioVolumeMeter(logger) {
	        assert.isObject(logger);

	        this._logger = logger;
	    }

	    AudioVolumeMeter.prototype.init = function init(context, alpha) {
	        assert.isObject(context, 'context');
	        assert.isFunction(context.createScriptProcessor, 'context.createScriptProcessor');

	        alpha = parseFloat(alpha || defaultAlpha);
	        assert.isNumber(alpha, 'alpha');

	        this._context = context;
	        this._alpha = alpha;
	        this._value = 0.;
	        this._smoothedValue = 0.;
	        this._smoothedPeakValue = 0.;
	        this._clipped = 0.;
	        this._scriptProcessor = context.createScriptProcessor(4096, 1, 1);
	        this._scriptProcessor.addEventListener('audioprocess', _.bind(onAudioProcess, this));
	    };

	    AudioVolumeMeter.prototype.onValue = function onValue(callback) {
	        this._callback = callback;
	    };

	    AudioVolumeMeter.prototype.getValue = function getValue() {
	        return this._value;
	    };

	    AudioVolumeMeter.prototype.getSmoothedValue = function getSmoothedValue() {
	        return this._smoothedValue;
	    };

	    AudioVolumeMeter.prototype.getSmoothedPeakValue = function getSmoothedPeakValue() {
	        return this._smoothedPeakValue;
	    };

	    AudioVolumeMeter.prototype.connect = function connect(stream) {
	        var that = this;

	        return connectToStream.call(that, stream);
	    };

	    AudioVolumeMeter.prototype.stop = function stop() {
	        return stopConnections.call(this);
	    };

	    AudioVolumeMeter.prototype.toString = function toString() {
	        return 'AudioVolumeMeter';
	    };

	    function onAudioProcess(event) {
	        var input = event.inputBuffer.getChannelData(0);
	        var sum = 0.;
	        var clipped = 0;

	        for (var i = 0; i < input.length; i++) {
	            sum += input[i] * input[i];

	            if (Math.abs(input[i]) > 0.99) {
	                clipped++;
	            }
	        }

	        this._value = Math.sqrt(sum / input.length);
	        this._smoothedValue = this._alpha * this._value + (1. - this._alpha) * this._smoothedValue;
	        this._smoothedPeakValue = Math.max(this._value, this._alpha * this._value + (1. - this._alpha) * this._smoothedPeakValue);
	        this._clipped = clipped;

	        if (this._callback) {
	            this._callback.call(this, {
	                date: _.now(),
	                value: this._value,
	                smoothedValue: this._smoothedValue,
	                smoothedPeakValue: this._smoothedPeakValue,
	                clipped: this._clipped
	            });
	        }
	    }

	    function connectToStream(stream) {
	        assert.isObject(stream, 'stream');

	        var that = this;

	        if (stream.getAudioTracks().length > 0) {
	            that._mediaStreamSource = that._context.createMediaStreamSource(stream);
	            that._mediaStreamSource.connect(that._scriptProcessor);
	            that._scriptProcessor.connect(that._context.destination);
	        } else {
	            that._logger.info('Stream has no audio tracks');
	        }
	    }

	    function stopConnections() {
	        if (this._mediaStreamSource) {
	            this._mediaStreamSource.disconnect();
	        }

	        this._scriptProcessor.disconnect();
	    }

	    return AudioVolumeMeter;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert) {
	    'use strict';

	    var defaultSpeakingHysteresisInterval = 50;
	    var defaultSilenceHysteresisInterval = 1500;

	    function AudioSpeakerDetectionAlgorithm(logger) {
	        assert.isObject(logger);

	        this._logger = logger;

	        this.init();
	    }

	    AudioSpeakerDetectionAlgorithm.prototype.init = function init() {

	    };

	    AudioSpeakerDetectionAlgorithm.prototype.onValue = function onValue(callback) {
	        this._callback = callback;
	    };

	    AudioSpeakerDetectionAlgorithm.prototype.startDetection = function startDetection(audioVolumeMeter, options) {
	        var that = this;

	        return startAudioDetection.call(that, audioVolumeMeter, options);
	    };

	    AudioSpeakerDetectionAlgorithm.prototype.toString = function toString() {
	        return 'AudioSpeakerDetection';
	    };

	    function startAudioDetection(audioVolumeMeter, options) {
	        assert.isObject(audioVolumeMeter, 'audioVolumeMeter');

	        options = options || {};

	        var that = this;
	        var stopped = false;
	        var speakingHysteresisInterval = options.speakingHysteresisInterval || defaultSpeakingHysteresisInterval;
	        var silenceHysteresisInterval = options.silenceHysteresisInterval || defaultSilenceHysteresisInterval;

	        assert.isNumber(speakingHysteresisInterval, 'options.speakingHysteresisInterval');
	        assert.isNumber(silenceHysteresisInterval, 'options.silenceHysteresisInterval');

	        var speaking = false;
	        var nextSpeakingDeadline = _.now() + speakingHysteresisInterval;
	        var nextSilenceDeadline = _.now() + silenceHysteresisInterval;

	        audioVolumeMeter.onValue(function (value) {
	            if (stopped) {
	                return;
	            }

	            assert.isObject(audioVolumeMeter, 'audioVolumeMeter');
	            assert.isNumber(value.date, 'value.date');
	            assert.isNumber(value.value, 'value.value');
	            assert.isNumber(value.smoothedValue, 'value.smoothedValue');
	            assert.isNumber(value.smoothedPeakValue, 'value.smoothedPeakValue');
	            assert.isNumber(value.clipped, 'value.clipped');

	            var speakingThreshold = value.value > 0.01 && value.value > 2 * value.smoothedValue && value.value > 0.25 * value.smoothedPeakValue;
	            var speakingContinuationThreshold = value.value > 0.8 * value.smoothedValue;
	            var notSpeakingThreshold = value.value < 0.5 * value.smoothedValue;
	            var notSpeakingContinuationThreshold = !speakingThreshold;

	            if ((speakingThreshold || (speaking && speakingContinuationThreshold)) && nextSpeakingDeadline < value.date) {
	                nextSilenceDeadline = _.utc(value.date) + silenceHysteresisInterval;
	                if (!speaking) {
	                    speaking = true;

	                    that._logger.info('Speaking detected');

	                    if (that._callback) {
	                        that._callback('speaking');
	                    }
	                }
	            } else if ((notSpeakingThreshold || (!speaking && notSpeakingContinuationThreshold)) && nextSilenceDeadline < value.date) {
	                nextSpeakingDeadline = _.utc(value.date) + speakingHysteresisInterval;
	                if (speaking) {
	                    speaking = false;

	                    that._logger.info('Silence detected');

	                    if (that._callback) {
	                        that._callback('silence');
	                    }
	                }
	            }
	        });
	    }

	    return AudioSpeakerDetectionAlgorithm;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5),
	    __webpack_require__(19),
	    __webpack_require__(21),
	    __webpack_require__(45)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert, pcastLoggerFactory, PCastEndPoint, PublisherBandwidthAdjuster) {
	    'use strict';

	    function BandwidthMonitor(publishers, options) {
	        assert.isArray(publishers, 'userMediaStreams');

	        options = options || {};

	        this._baseUri = options.uri || PCastEndPoint.DefaultPCastUri;
	        this._logger = options.logger || pcastLoggerFactory.createPCastLogger(this._baseUri);
	        this._publisherAdjusters = [];
	        this._publishers = publishers;
	    }

	    BandwidthMonitor.prototype.start = function start(roomService, options) {
	        options = options || {};

	        _.forEach(this._publishers, _.bind(setupPublisherAdjusters, this, roomService, options));
	    };

	    BandwidthMonitor.prototype.stop = function stop() {
	        _.forEach(this._publisherAdjusters, function closePublisherAdjusters(adjuster) {
	            adjuster.close();
	        });

	        this._publisherAdjusters = [];
	    };

	    BandwidthMonitor.prototype.toString = function toString() {
	        return 'BandwidthMonitor';
	    };

	    function setupPublisherAdjusters(roomService, options, publisher) {
	        var publisherAdjuster = new PublisherBandwidthAdjuster(publisher);

	        publisherAdjuster.connect(roomService, options);

	        this._publisherAdjusters.push(publisherAdjuster)
	    }

	    return BandwidthMonitor;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(4),
	    __webpack_require__(5)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, assert) {
	    'use strict';

	    var defaultRoomBandwidthLimit = 5000000;

	    function PublisherBandwidthAdjuster(publisher) {
	        this.init(publisher);
	    }

	    PublisherBandwidthAdjuster.prototype.init = function init(publisher) {
	        assert.isObject(publisher, 'publisher');

	        this._publisher = publisher;
	        this._roomMemberCount = 0;
	        this._roomSubscription = null;
	        this._membersSubscription = null;
	    };

	    PublisherBandwidthAdjuster.prototype.connect = function connect(roomService, options) {
	        assert.isObject(roomService, 'roomService');

	        options = options || {};

	        var roomObservable = roomService.getObservableActiveRoom();
	        var roomBandwidthLimit = options.roomBandwidthLimit || defaultRoomBandwidthLimit;

	        this._roomSubscription = roomObservable.subscribe(_.bind(onRoomChange, this, roomBandwidthLimit), {initial:'notify'});
	    };

	    PublisherBandwidthAdjuster.prototype.close = function close() {
	        if (this._roomSubscription) {
	            this._roomSubscription.dispose()
	        }
	        if (this._membersSubscription) {
	            this._membersSubscription.dispose()
	        }

	        this._roomSubscription = null;
	        this._membersSubscription = null;
	    };

	    PublisherBandwidthAdjuster.prototype.toString = function toString() {
	        return 'PublisherBandwidthAdjuster';
	    };

	    function onRoomChange(roomBandwidthLimit, room) {
	        if (this._membersSubscription) {
	            this._membersSubscription.dispose();
	        }
	        if (!room) {
	            return this._publisher.limitBandwidth(roomBandwidthLimit);
	        }

	        var membersObservable = room.getObservableMembers();

	        this._membersSubscription = membersObservable.subscribe(_.bind(onRoomMembersChanged, this, roomBandwidthLimit), {initial:'notify'});
	    }

	    function onRoomMembersChanged(roomBandwidthLimit, members) {
	        if (members.length === this._roomMemberCount) {
	            return;
	        }

	        this._roomMemberCount = members.length;

	        var targetBitRate = roomBandwidthLimit / Math.max(1, this._roomMemberCount - 1);

	        this._publisher.limitBandwidth(targetBitRate);
	    }

	    return PublisherBandwidthAdjuster;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }
/******/ ])
});
;