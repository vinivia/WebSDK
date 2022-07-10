'use strict';

/**
 * Copyright 2022 Phenix Real Time Solutions, Inc. All Rights Reserved.
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
const _ = require('phenix-web-lodash-light');
const assert = require('phenix-web-assert');
const http = require('phenix-web-http');
const disposable = require('phenix-web-disposable');

var networkUnavailableCode = 0;
var requestMaxTimeout = 20000;
var defaultRequestOptions = {
    timeout: requestMaxTimeout,
    retryOptions: {
        backoff: 1.5,
        delay: 1000,
        maxAttempts: 3,
        additionalRetryErrorCodes: [networkUnavailableCode]
    }
};
var authenticationDataLocations = {
    body: {
        id: 1,
        name: 'body'
    },
    header: {
        id: 2,
        name: 'header'
    }
};
var defaultEndpointPaths = {
    createStreamTokenPath: '/stream',
    createAuthTokenPath: '/auth'
};
var requestTypes = {
    auth: {
        id: 1,
        name: 'auth'
    },
    stream: {
        id: 2,
        name: 'stream'
    }
};

function AdminApiProxyClient() {
    this._requestHandler = null;
    this._backendUri = '';
    this._endpointPaths = defaultEndpointPaths;
    this._authenticationData = {};
    this._authenticationDataLocationInPayload = authenticationDataLocations.body.name;
    this._disposables = new disposable.DisposableList();
}

AdminApiProxyClient.prototype.dispose = function() {
    return this._disposables.dispose();
};

AdminApiProxyClient.prototype.toString = function() {
    return 'AdminApiProxyClient[' +
        'customRequestHandler=' + (!!this._requestHandler).toString() +
        ',backendUri=' + this._backendUri +
        ',authenticationDataLocationInPayload=' + this._authenticationDataLocationInPayload +
        ',customEndpointPaths=' + (this._endpointPaths === defaultEndpointPaths).toString() +
        ',customAuthenticationData=' + (_.keys(this._authenticationData).length > 0).toString() + ']';
};

AdminApiProxyClient.prototype.getBackendUri = function() {
    return this._backendUri;
};

AdminApiProxyClient.prototype.setBackendUri = function(backendUri) {
    assert.isString(backendUri, 'backendUri');

    this._backendUri = backendUri;
};

AdminApiProxyClient.prototype.getEndpointPaths = function() {
    return _.assign({}, this._endpointPaths);
};

AdminApiProxyClient.prototype.setEndpointPaths = function(endpointPaths) {
    assert.isObject(endpointPaths, 'endpointPaths');

    if (endpointPaths.createStreamTokenPath) {
        assert.isStringNotEmpty(endpointPaths.createStreamTokenPath, 'endpointPaths.createStreamTokenPath');
    }

    if (endpointPaths.createAuthTokenPath) {
        assert.isStringNotEmpty(endpointPaths.createAuthTokenPath, 'endpointPaths.createAuthTokenPath');
    }

    this._endpointPaths = _.assign({}, defaultEndpointPaths, endpointPaths);
};

AdminApiProxyClient.prototype.getAuthenticationData = function() {
    return _.assign({}, this._authenticationData);
};

AdminApiProxyClient.prototype.setAuthenticationData = function(authenticationData) {
    assert.isObject(authenticationData, 'authenticationData');

    this._authenticationData = authenticationData;
};

AdminApiProxyClient.prototype.getAuthenticationDataLocationInPayload = function() {
    return this._authenticationDataLocationInPayload;
};

AdminApiProxyClient.prototype.setAuthenticationDataLocationInPayload = function(authenticationDataLocationInPayload) {
    assert.isValidType(authenticationDataLocationInPayload, authenticationDataLocations, 'authenticationDataLocationInPayload');

    this._authenticationDataLocationInPayload = authenticationDataLocationInPayload;
};

AdminApiProxyClient.prototype.getRequestHandler = function() {
    return this._requestHandler;
};

AdminApiProxyClient.prototype.setRequestHandler = function(callback) {
    assert.isFunction(callback, 'callback');

    if (this._backendUri) {
        throw new Error('Conflicting parameter [backendUri]');
    }

    if (_.keys(this._authenticationData).length > 0) {
        throw new Error('Conflicting parameter [authenticationData]');
    }

    if (this._authenticationDataLocationInPayload !== authenticationDataLocations.body.name) {
        throw new Error('Conflicting parameter [authenticationDataLocationInPayload]');
    }

    if (this._endpointPaths !== defaultEndpointPaths) {
        throw new Error('Conflicting parameter [endpointPaths]');
    }

    this._requestHandler = callback;
};

AdminApiProxyClient.prototype.createAuthenticationToken = function createAuthenticationToken(callback) {
    if (this._requestHandler) {
        return this._requestHandler(requestTypes.auth.name, {}, _.bind(handleOverrideRequestResponse, this, requestTypes.auth.name, callback));
    }

    if (!this._backendUri) {
        callback(null, {status: 'unauthorized'});

        return;
    }

    var requestWithoutCallback = bindAuthDataAndPrepareRequest.call(this, http.postWithRetry, http, this._backendUri + this._endpointPaths.createAuthTokenPath, {}, defaultRequestOptions);

    return requestWithTimeout.call(this, requestWithoutCallback, callback);
};

AdminApiProxyClient.prototype.createStreamTokenForPublishing = function createStreamTokenForPublishing(sessionId, capabilities, callback) {
    assert.isStringNotEmpty(sessionId, 'sessionId');
    assert.isObject(capabilities, 'capabilities');

    var data = {
        sessionId: sessionId,
        capabilities: capabilities
    };

    if (this._requestHandler) {
        return this._requestHandler(requestTypes.stream.name, data, _.bind(handleOverrideRequestResponse, this, requestTypes.stream.name, callback));
    }

    if (!this._backendUri) {
        callback(null, {status: 'unauthorized'});

        return;
    }

    var requestWithoutCallback = bindAuthDataAndPrepareRequest.call(this, http.postWithRetry, http, this._backendUri + this._endpointPaths.createStreamTokenPath, data, defaultRequestOptions);

    return requestWithTimeout.call(this, requestWithoutCallback, callback);
};

AdminApiProxyClient.prototype.createStreamTokenForPublishingToExternal = function createStreamTokenForPublishingToExternal(sessionId, capabilities, streamId, callback) {
    this.createStreamTokenForSubscribing(sessionId, capabilities, streamId, null, callback);
};

AdminApiProxyClient.prototype.createStreamTokenForSubscribing = function createStreamTokenForSubscribing(sessionId, capabilities, streamId, alternateStreamIds, callback) {
    assert.isStringNotEmpty(sessionId, 'sessionId');
    assert.isObject(capabilities, 'capabilities');

    if (!_.isNullOrUndefined(alternateStreamIds)) {
        assert.isArray(alternateStreamIds, 'additionalStreamIds');

        _.forEach(alternateStreamIds, function(alternateOriginStreamId) {
            assert.isStringNotEmpty(alternateOriginStreamId, 'alternateOriginStreamId');
        });
    }

    var data = {
        sessionId: sessionId,
        capabilities: capabilities,
        originStreamId: streamId
    };

    if (alternateStreamIds && alternateStreamIds.length > 0) {
        data.alternateOriginStreamIds = alternateStreamIds;
    }

    if (this._requestHandler) {
        return this._requestHandler(requestTypes.stream.name, data, _.bind(handleOverrideRequestResponse, this, requestTypes.stream.name, callback));
    }

    if (!this._backendUri) {
        callback(null, {status: 'unauthorized'});

        return;
    }

    var requestWithoutCallback = bindAuthDataAndPrepareRequest.call(this, http.postWithRetry, http, this._backendUri + this._endpointPaths.createStreamTokenPath, data, defaultRequestOptions);

    return requestWithTimeout.call(this, requestWithoutCallback, callback);
};

function requestWithTimeout(requestWithoutCallback, callback) {
    var requestTimeoutId = null;
    var requestDisposable = requestWithoutCallback(_.bind(handleResponse, this, function(error, response) {
        clearTimeout(requestTimeoutId);

        switch (_.get(error, ['code'])) {
        case 401:
            return callback(null, {status: 'unauthorized'});
        case 404:
            return callback(null, {status: 'origin-not-found'});
        case 410:
            return callback(null, {status: 'origin-ended'});
        default:
            return callback(error, response);
        }
    }));

    requestTimeoutId = setTimeout(function() {
        requestDisposable.dispose();
        callback(new Error('timeout'));
    }, requestMaxTimeout);

    this._disposables.add(requestDisposable);
    this._disposables.add(new disposable.Disposable(function() {
        clearTimeout(requestTimeoutId);
    }));

    return requestDisposable;
}

function bindAuthDataAndPrepareRequest(method, scope, uri, data, options) {
    switch (this._authenticationDataLocationInPayload) {
    case authenticationDataLocations.body.name:
        data = appendAuthDataTo.call(this, data);

        break;
    case authenticationDataLocations.header.name:
        options = appendAuthHeaders.call(this, options);

        break;
    default:
        throw new Error('Unsupported Authentication Mode ' + this._authenticationDataLocationInPayload);
    }

    return _.bind(method, scope, uri, JSON.stringify(data), options);
}

function appendAuthDataTo(data) {
    return _.assign({}, data, this._authenticationData);
}

function appendAuthHeaders(options) {
    if (options.headers) {
        options.headers = _.assign({}, this._authenticationData, options.headers);

        return options;
    }

    return _.assign({}, {headers: this._authenticationData}, options);
}

function handleResponse(callback, error, response) {
    if (error) {
        return callback(error, {});
    }

    var res = JSON.parse(response.data);

    if (res.status !== 'ok') {
        return callback(null, {status: res.status || 'status-code-missing'});
    }

    return callback(null, res);
}

function handleOverrideRequestResponse(type, callback, error, token) {
    if (!token || error) {
        return callback(error, {status: 'failed'});
    }

    var response = {status: 'ok'};

    switch(type) {
    case requestTypes.auth.name:
        response.authenticationToken = token;

        break;
    case requestTypes.stream.name:
        response.streamToken = token;

        break;
    default:
        throw new Error('Unsupported request type ' + type);
    }

    return callback(error, response);
}

module.exports = AdminApiProxyClient;