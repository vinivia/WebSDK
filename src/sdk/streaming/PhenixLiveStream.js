/**
 * Copyright 2018 Phenix Inc. All Rights Reserved.
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
    'phenix-web-lodash-light',
    'phenix-web-assert',
    'phenix-web-event',
    'phenix-rtc',
    './ShakaRenderer',
    './HlsRenderer',
    './PhenixPlayerRenderer',
    './stream.json'
], function(_, assert, event, rtc, ShakaRenderer, HlsRenderer, PhenixPlayerRenderer, streamEnums) {
    'use strict';

    function PhenixLiveStream(type, streamId, uri, streamTelemetry, options, shaka, logger) {
        this._type = type;
        this._streamId = streamId;
        this._uri = uri;
        this._streamTelemetry = streamTelemetry;
        this._options = options;
        this._shaka = shaka;
        this._logger = logger;
        this._renderer = null;
        this._element = null;
        this._dimensionsChangedMonitor = null;
        this._namedEvents = new event.NamedEvents();
    }

    PhenixLiveStream.prototype.on = function(name, callback) {
        this._namedEvents.listen(name, callback);
    };

    PhenixLiveStream.prototype.createRenderer = function() {
        switch (this._type) {
        case streamEnums.types.dash.name:
            if (this._shaka) {
                this._renderer = new ShakaRenderer(this._streamId, this._uri, this._streamTelemetry, this._options, this._shaka, this._logger);
            } else {
                this._renderer = new PhenixPlayerRenderer(this._streamId, this._uri, this._streamTelemetry, this._options, this._logger);
            }

            break;
        case streamEnums.types.hls.name:
            if (PhenixPlayerRenderer.isSupported() && !this._options.useNativeHlsPlayer) {
                this._renderer = new PhenixPlayerRenderer(this._streamId, this._uri, this._streamTelemetry, this._options, this._logger);
            } else {
                this._renderer = new HlsRenderer(this._streamId, this._uri, this._streamTelemetry, this._options, this._logger);
            }

            break;
        default:
            throw new Error('Unsupported Live stream Type ' + this._type);
        }

        var that = this;

        this._renderer.on(streamEnums.rendererEvents.error.name, function(type, error) {
            that._namedEvents.fire(streamEnums.streamEvents.playerError.name, [type, error]);
        });
        this._renderer.on(streamEnums.rendererEvents.ended.name, function(reason) {
            that._namedEvents.fire(streamEnums.streamEvents.playerEnded.name, [reason]);
        });

        return this._renderer;
    };

    PhenixLiveStream.prototype.select = function select(trackSelectCallback) { // eslint-disable-line no-unused-vars
        this._logger.warn('[%s] selection of tracks not supported for [%s] live streams', this._streamId, this._type);

        return this;
    };

    PhenixLiveStream.prototype.setStreamEndedCallback = function setStreamEndedCallback(callback) {
        assert.isFunction(callback, 'callback');

        this.streamEndedCallback = callback;
    };

    PhenixLiveStream.prototype.setStreamErrorCallback = function setStreamErrorCallback(callback) {
        assert.isFunction(callback, 'callback');

        this.streamErrorCallback = callback;
    };

    PhenixLiveStream.prototype.stop = function stop(reason) {
        if (!this.isActive()) {
            return;
        }

        this._logger.info('[%s] stop media stream', this._streamId);

        this._namedEvents.fire(streamEnums.streamEvents.stopped.name, [reason]);

        this._isStopped = true;
    };

    PhenixLiveStream.prototype.monitor = function monitor(options, callback) {
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');
    };

    PhenixLiveStream.prototype.getMonitor = function getMonitor() {
        return null;
    };

    PhenixLiveStream.prototype.getStream = function getStream() {
        this._logger.debug('[%s] stream not available for [%s] live streams', this._streamId, this._type);

        return null;
    };

    PhenixLiveStream.prototype.isActive = function isActive() {
        return !this._isStopped;
    };

    PhenixLiveStream.prototype.getStreamId = function getStreamId() {
        return this._streamId;
    };

    PhenixLiveStream.prototype.getStats = function getStats() {
        this._logger.debug('[%s] stats not available for [%s] live streams', this._streamId, this._type);

        return null;
    };

    PhenixLiveStream.prototype.getRenderer = function getRenderer() {
        return this._renderer;
    };

    return PhenixLiveStream;
});