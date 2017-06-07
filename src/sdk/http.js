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

    function Http() {
        this._version = '%SDKVERSION%';
    }

    Http.prototype.get = function get(url, callback, settings) {
        var requestMethod = 'GET';
        settings = settings || {};

        var xhr = getAndOpenVendorSpecificXmlHttpMethod(requestMethod, url, callback);

        if (!xhr) {
            return callback(getUnsupportedError());
        }

        if (settings.mimeType) {
            xhr.overrideMimeType(settings.mimeType);
        }

        xhr.addEventListener('readystatechange', _.bind(handleReadyStateChange, this, xhr, callback));

        xhr.timeout = settings.timeout || 15000;

        xhr.send();
    };

    Http.prototype.getWithRetry = function getWithRetry(url, callback, maxAttempts, attempt) {
        if (!_.isNumber(attempt)) {
            attempt = 1;
        }

        var that = this;
        var requestUrl = appendQueryParameters(url, that._version, _.now());

        function retryCallback(err, response) {
            if (err) {
                if ((attempt < maxAttempts) && err.retryable) {
                    getWithRetry.call(that, url, callback, maxAttempts, attempt + 1);
                } else {
                    callback(err);
                }
            } else {
                callback(null, response);
            }
        }

        that.get(requestUrl, retryCallback, {});
    };

    Http.prototype.post = function postWithRetry(url, data, callback, settings) {
        var requestMethod = 'POST';

        settings = settings || {};

        var xhr = getAndOpenVendorSpecificXmlHttpMethod(requestMethod, url, callback);

        if (!xhr) {
            return callback(getUnsupportedError());
        }

        appendDataTypeHeaders(xhr, settings.dataType);

        xhr.addEventListener('readystatechange', _.bind(handleReadyStateChange, this, xhr, callback));

        xhr.timeout = settings.timeout || 15000;

        xhr.send(data);
    };

    Http.prototype.postWithRetry = function postWithRetry(url, dataType, data, callback, maxAttempts, attempt) {
        if (!_.isNumber(attempt)) {
            attempt = 1;
        }

        var that = this;
        var requestUrl = appendQueryParameters(url, that._version, _.now());
        var settings = {};

        if (dataType) {
            settings.dataType = dataType;
        }

        function retryCallback(err, response) {
            if (err) {
                if ((attempt < maxAttempts) && err.retryable) {
                    postWithRetry.call(that, url, dataType, data, callback, maxAttempts, attempt + 1);
                } else {
                    callback(err);
                }
            } else {
                callback(null, response);
            }
        }

        that.post(requestUrl, data, retryCallback, settings);
    };

    function appendQueryParameters(url, version, timestamp) {
        return url + '?version=' + encodeURIComponent(version) + '&_=' + timestamp;
    }

    function getAndOpenVendorSpecificXmlHttpMethod(requestMethod, requestUrl) {
        var xhr = new XMLHttpRequest();

        if ('withCredentials' in xhr) {
            // Most browsers.
            xhr.open(requestMethod, requestUrl, true);
        } else if (typeof XDomainRequest !== 'undefined') {
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
            xhr.setRequestHeader('Content-type', 'application/json'); // Default to json
            xhr.setRequestHeader('Accept', 'application/json');
        }
    }

    function handleReadyStateChange(xhr, callback) {
        if (xhr.readyState === 4 /* DONE */) {
            if (xhr.status === 200) {
                callback(null, xhr.responseText);
            } else {
                var err = new Error(xhr.status === 0 ? 'timeout' : xhr.statusText);
                err.code = xhr.status;

                if (xhr.status >= 500 && xhr.status < 600) {
                    err.retryable = true;
                }

                callback(err);
            }
        }
    }

    return new Http();
});