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
    'phenix-rtc'
], function (_, phenixRTC) {
    'use strict';

    var defaultOfflineTimeoutLength = 15000;

    function NetworkConnectionMonitor(offlineTimeoutLength, logger) {
        this._logger = logger;
        this._timeout = null;
        this._onOnline = null;
        this._onOffline = null;
        this._offlineHysteresisTimeout = _.isNumber(offlineTimeoutLength) ? offlineTimeoutLength : defaultOfflineTimeoutLength;
    }

    NetworkConnectionMonitor.prototype.start = function start(onlineCallback, offlineCallback) {
        this._onOnline = _.bind(handleOnline, this, onlineCallback);
        this._onOffline = _.bind(handleOfflineWithHysteresis, this, offlineCallback);

        phenixRTC.addEventListener(window, 'online', this._onOnline, false);
        phenixRTC.addEventListener(window, 'offline', this._onOffline, false);
    };

    NetworkConnectionMonitor.prototype.stop = function stop() {
        phenixRTC.removeEventListener(window, 'online', this._onOnline, false);
        phenixRTC.removeEventListener(window, 'offline', this._onOffline, false);

        this._onOnline = null;
        this._onOffline = null;
    };

    function handleOfflineWithHysteresis(offlineCallback, event) {
        var that = this;

        if (that._logger) {
            that._logger.warn('Network Disconnect Detected. Waiting for reconnect.');
        }

        that.offlineTimeout = setTimeout(function() {
            if (!offlineCallback || !that._onOffline) {
                return;
            }

            if (that._logger) {
                that._logger.warn('Network not reconnected after [%s]. Going Offline.', that._offlineHysteresisTimeout);
            }

            offlineCallback();
        }, that._offlineHysteresisTimeout);
    }

    function handleOnline(onlineCallback, event) {
        if (this._logger) {
            this._logger.info('Network Reconnected.');
        }

        if (this.offlineTimeout) {
            clearTimeout(this.offlineTimeout);

            this.offlineTimeout = null;
        }

        if (onlineCallback && this._onOnline) {
            onlineCallback();
        }
    }

    return NetworkConnectionMonitor;
});
