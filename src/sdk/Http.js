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
    './Time'
], function (Time) {
    'use strict';

    function Http(version, baseUri, logger) {
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

    Http.prototype.httpGetWithRetry = function httpGetWithRetry(url, callback, maxAttempts, attempt) {
        if (attempt === undefined) {
            attempt = 1;
        }

        var that = this;
        var xhr = new XMLHttpRequest();
        var requestMethod = 'GET';
        var requestUrl = url + '?version=' + encodeURIComponent(that._version) + '&_=' + Time.now();

        if ('withCredentials' in xhr) {
            // Most browsers.
            xhr.open(requestMethod, requestUrl, true);
        } else if (typeof XDomainRequest != 'undefined') {
            // IE8 & IE9
            xhr = new XDomainRequest();
            xhr.open(requestMethod, requestUrl);
        } else {
            // CORS not supported.
            var err = new Error('unsupported');

            err.code = 'unsupported';

            callback(err);
        }

        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4 /* DONE */) {
                if (xhr.status === 200) {
                    callback(undefined, xhr.responseText);
                } else if (xhr.status >= 500 && xhr.status < 600 && attempt <= maxAttempts) {
                    httpGetWithRetry.call(that, url, callback, maxAttempts, attempt + 1);
                } else {
                    that._logger.info('HTTP GET [%s] failed with [%s] [%s]', url, xhr.status, xhr.statusText);

                    var err = new Error(xhr.status === 0 ? 'timeout' : xhr.statusText);

                    err.code = xhr.status;

                    callback(err);
                }
            }
        });

        xhr.timeout = 15000;

        xhr.send();
    };

    return Http;
});
