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
define([
    'phenix-web-assert',
    'phenix-web-lodash-light',
    'phenix-web-http',
    'phenix-web-disposable',
    'phenix-web-closest-endpoint-resolver'
], function(assert, _, http, disposable, ClosestEndPointResolver) {
    'use strict';

    var maxAttempts = 4;

    function PCastEndPoint(version, baseUri, logger, sessionTelemetry) {
        assert.isStringNotEmpty(version, 'version');
        assert.isStringNotEmpty(baseUri, 'baseUri');
        assert.isObject(logger, 'logger');

        this._version = version;
        this._baseUri = baseUri;
        this._logger = logger;
        this._disposables = new disposable.DisposableList();
        this._sessionTelemetry = sessionTelemetry;
    }

    PCastEndPoint.DefaultPCastUri = 'https://pcast.phenixrts.com';

    PCastEndPoint.prototype.getBaseUri = function() {
        return this._baseUri;
    };

    PCastEndPoint.prototype.resolveUri = function(callback /* (error, {uri, roundTripTime}) */) {
        return resolveUri.call(this, this._baseUri, callback);
    };

    PCastEndPoint.prototype.dispose = function() {
        this._disposables.dispose();
    };

    PCastEndPoint.prototype.toString = function() {
        return 'PCastEndPoint[' + this._baseUri + ']';
    };

    function resolveUri(baseUri, callback /* (error, {uri, roundTripTime}) */) {
        if (baseUri.lastIndexOf('wss:', 0) === 0) {
            // WSS - Specific web socket end point
            callback(undefined, {
                uri: baseUri + '/ws',
                roundTripTime: 0
            });
        } else if (baseUri.lastIndexOf('https:', 0) === 0) {
            // HTTP - Resolve closest end point
            var that = this;

            getEndpoints.call(that, baseUri, function(err, endPoints) {
                if (err) {
                    return callback(err);
                }

                var closestEndPointResolver = new ClosestEndPointResolver(that._logger, that._version, callback, function(err, response){
                    if(err){
                        that._logger.warn('An error occured in resolving an endpoint', err);

                        return;
                    }

                    that._sessionTelemetry.recordMetric('RoundTripTime', {uint64: response.time}, null, {
                        resource: response.endPoint,
                        kind: 'https'
                    });
                });

                closestEndPointResolver.resolveAll(endPoints);

                that._disposables.add(closestEndPointResolver);
            });
        } else {
            // Not supported
            callback(new Error('Uri not supported'));
        }
    }

    function getEndpoints(baseUri, callback) {
        var requestDisposable = http.getWithRetry(baseUri + '/pcast/endPoints', {
            timeout: 15000,
            queryParameters: {
                version: '%SDKVERSION%',
                _: _.now()
            },
            retryOptions: {maxAttempts: maxAttempts}
        }, function(err, response) {
            if (err) {
                return callback(new Error('Failed to resolve an end point', err));
            }

            var endPoints = response.data.split(',');

            if (endPoints.length < 1) {
                callback(new Error('Failed to discover end points'));
            }

            callback(undefined, endPoints);
        });

        this._disposables.add(requestDisposable);
    }

    return PCastEndPoint;
});