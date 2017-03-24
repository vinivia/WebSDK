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
        './MQProtocol',
        'ByteBuffer',
        'phenix-rtc'
    ], function (MQProtocol, ByteBuffer, phenixRTC) {
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
        this._webSocket.onopen = onOpen.bind(this);
        this._webSocket.onclose = onClose.bind(this);
        this._webSocket.onmessage = onMessage.bind(this);
        this._webSocket.onerror = onError.bind(this);

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
                connectOptions: options.connectOptions || [],
                createOfferDescription: {
                    streamId: '',
                    options: [streamType, browser, browserWithVersion],
                    apiVersion: this._mqProtocol.getApiVersion()
                }
            }
        };

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
        }

        var callback = this._requests[response.requestId];

        if (callback) {
            delete this._requests[response.requestId];

            if (response.type === 'mq.Error' || message.status !== 'ok') {
                callback(undefined, message);
            } else {
                callback(message);
            }
        }
    }

    function onError(evt) {
        this._logger.error('An error occurred', evt.data);
    }

    return PCastProtocol;
});
