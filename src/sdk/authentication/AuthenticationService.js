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
    '../observable/Observable',
    '../observable/ObservableMonitor'
], function (_, assert, Observable, ObservableMonitor) {
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
});
