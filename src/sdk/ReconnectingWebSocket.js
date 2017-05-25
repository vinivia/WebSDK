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
    './LodashLight',
    './assert',
    './NetworkConnectionMonitor'
], function (_, assert, NetworkConnectionMonitor) {
    'use strict';

    var networkDisconnectHysteresisInterval = 15000;
    var waitForDisconnectEventTimeout = 1000;
    var defaultReconnectBackoffInterval = 1000;
    var defaultMaxReconnectAttempts = 4;
    var closeReasons = {
        byebye: {
            code: 1000,
            reason: 'byebye',
            desc: 'Client closed'
        },
        backoffLimitReached: {
            code: 4000,
            reason: 'backoff-limit-reached',
            desc: 'Reached the limit in terms of the number of reconnects'
        },
        networkDisconnect: {
            code: 4001,
            reason: 'network-disconnect',
            desc: 'Network connection monitor determined loss to internet connectivity'
        },
        reconnecting: {
            code: 4002,
            reason: 'reconnecting',
            desc: 'Closing WebSocket in order to attempt to establish another connection'
        }
    };
    var readyStates = {
        connecting: {
            code: 0,
            state: 'CONNECTING',
            desc: 'The connection is not yet open'
        },
        open: {
            code: 1,
            state: 'OPEN',
            desc: 'The connection is open and ready to communicate'
        },
        closing: {
            code: 2,
            state: 'CLOSING',
            desc: 'The connection is in the process of closing'
        },
        closed: {
            code: 3,
            state: 'CLOSED',
            desc: 'The connection is closed or could not be opened'
        }
    };

    function ReconnectingWebSocket(uri, logger, maxReconnectAttempts, reconnectBackoffInterval) {
        assert.stringNotEmpty(uri, 'uri');
        assert.isObject(logger, 'logger');

        if (!_.isNullOrUndefined(maxReconnectAttempts)) {
            assert.isNumber(maxReconnectAttempts);
        } else {
            maxReconnectAttempts = defaultMaxReconnectAttempts;
        }

        this._uri = uri;
        this._logger = logger;
        this._maxReconnectAttempts = maxReconnectAttempts;
        this._reconnectBackoffInterval = reconnectBackoffInterval || defaultReconnectBackoffInterval;
        this._networkConnectionMonitor = new NetworkConnectionMonitor(networkDisconnectHysteresisInterval, this._logger);
        this._hasAttemptedReconnect = false;
        this._stopped = false;

        this._logger.info('Connecting to [%s]', uri);

        this._webSocket = createWebSocket.call(this, onOpen, onClose);
        this._networkConnectionMonitor.start(_.bind(onNetworkReconnect, this), _.bind(onNetworkDisconnect, this));
    }

    ReconnectingWebSocket.prototype.onmessage = null;
    ReconnectingWebSocket.prototype.onconnected = null;
    ReconnectingWebSocket.prototype.onreconnecting = null;
    ReconnectingWebSocket.prototype.onreconnected = null;
    ReconnectingWebSocket.prototype.ondisconnected = null;
    ReconnectingWebSocket.prototype.onerror = null;

    ReconnectingWebSocket.prototype.send = function (message) {
        return this._webSocket.send(message);
    };

    ReconnectingWebSocket.prototype.reconnect = function (attempt) {
        this._webSocket.onclose = null;
        this._webSocket.onerror = null;
        this._hasAttemptedReconnect = true;

        var that = this;
        var backoffTimeout;

        if (!_.isNumber(attempt)) {
            attempt = 1;
        }

        if (this._stopped) {
            return this._logger.info('Client has stopped WebSocket after [%s] reconnect attempts', attempt - 1);
        }

        if (attempt > this._maxReconnectAttempts) {
            this._logger.warn('Unable to reconnect WebSocket after [%s] attempts', this._maxReconnectAttempts);

            return closeWebSocketOrTriggerDisconnectEvent.call(this, closeReasons.backoffLimitReached);
        }

        closeWebSocketOrTriggerDisconnectEvent.call(this, closeReasons.reconnecting);

        try {
            this._webSocket = createWebSocket.call(that, function onOpenEvent() {
                if (backoffTimeout) {
                    clearTimeout(backoffTimeout);
                }

                that._hasAttemptedReconnect = false;
                that._webSocket.onclose = _.bind(onClose, that);

                return onReconnect.call(that);
            }, function onCloseEvent() {
                if (attempt + 1 > that._maxReconnectAttempts) {
                    if (backoffTimeout) {
                        clearTimeout(backoffTimeout);
                    }

                    reconnectIfNotOpen.call(that, attempt);
                }
            });
        } catch(e) {
            this._logger.warn('Unable to create WebSocket connection [%s]', e);
            // swallow error - we will alert client of failure after timeouts.
        }

        backoffTimeout = reconnectWithBackoff.call(this, attempt)
    };

    ReconnectingWebSocket.prototype.disconnect = function () {
        this._networkConnectionMonitor.stop();
        this._stopped = true;

        return this._webSocket.close(closeReasons.byebye.code, closeReasons.byebye.reason);
    };

    ReconnectingWebSocket.prototype.toString = function () {
        return 'ReconnectedWebSocket[' + this._uri + ',' + this._webSocket.readyState + ']';
    };

    function closeWebSocketOrTriggerDisconnectEvent(evt) {
        if (this._webSocket.readyState === readyStates.closed.code) {
            return onClose.call(this, evt)
        }

        return this._webSocket.close(evt.code, evt.reason);
    }

    function createWebSocket(onOpenCallback, onCloseCallback) {
        var webSocket = new WebSocket(this._uri);

        webSocket.onopen = _.bind(onOpenCallback, this);
        webSocket.onclose = _.bind(onCloseCallback, this);
        webSocket.onmessage = _.bind(onMessage, this);
        webSocket.onerror = _.bind(onError, this);

        return webSocket;
    }

    function reconnectWithBackoff(attempt) {
        var that = this;

        return setTimeout(function () {
            reconnectIfNotOpen.call(that, attempt);
        }, attempt * attempt * this._reconnectBackoffInterval);
    }

    function reconnectIfNotOpen(attempt) {
        if (this._webSocket.readyState === readyStates.open.code) {
            return;
        }

        this.reconnect(attempt + 1);
    }

    function onClose(evt) {
        switch (evt.code) {
            case closeReasons.reconnecting.code:
                return;
            case closeReasons.byebye.code:
            case closeReasons.backoffLimitReached.code:
            case closeReasons.networkDisconnect.code:
                return onDisconnect.call(this, evt);
            default:
                if (this._hasAttemptedReconnect) {
                    return;
                }

                return onReconnecting.call(this, evt);
        }
    }

    function onReconnecting(evt) {
        this._logger.info('Attempting to re-establish socket connection after disconnect event with code [%s] and reason [%s]', evt.code, evt.reason);

        if (this.onreconnecting) {
            this.onreconnecting(evt);
        }

        this.reconnect();
    }

    function onOpen(evt) {
        this._logger.info('Connected');

        if (this.onconnected) {
            this.onconnected(evt);
        }
    }

    function onReconnect(evt) {
        this._logger.info('Successfully reconnected to WebSocket');

        if (this.onreconnected) {
            this.onreconnected(evt);
        }
    }

    function onDisconnect(evt) {
        this._logger.info('Disconnected [%s]: [%s]', evt.code, evt.reason);

        if (this.ondisconnected) {
            this.ondisconnected(evt);
        }
    }

    function onError(evt) {
        this._logger.error('An error occurred [%s]', evt.data);

        if (this.onerror) {
            this.onerror(evt);
        }
    }

    function onMessage(evt) {
        this._logger.debug('>> [%s]', evt.data);

        if (this.onmessage) {
            this.onmessage(evt);
        }
    }

    function onNetworkReconnect(didGoOffline) {
        var that = this;

        setTimeout(function() {
            if (that._stopped) {
                return that._logger.info('Unable to go back online after network reconnect. Client has stopped WebSocket.')
            }

            if (that._webSocket.readyState !== readyStates.open.code) {
                return that.reconnect();
            }

            if (didGoOffline) {
                return onOpen.call(that);
            }
        }, waitForDisconnectEventTimeout);
    }

    function onNetworkDisconnect() {
        // Don't close the WebSocket.
        onDisconnect.call(this, closeReasons.networkDisconnect);
    }

    return ReconnectingWebSocket;
});
