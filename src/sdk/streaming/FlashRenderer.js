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
    'phenix-web-lodash-light',
    'phenix-web-assert',
    'phenix-web-logging',
    'phenix-web-event',
    'phenix-web-http',
    'phenix-web-player',
    'phenix-rtc',
    './stream.json'
], function(_, assert, logging, event, http, phenixWebPlayer, rtc, streamEnums) {
    'use strict';

    var timeoutForStallWithoutProgressToRestart = 6000;
    var minTimeBeforeNextReload = 15000;
    var hasFlashPlugin = detectFlashPlugin();
    var defaultSwfFileSrc = 'https://phenixrts.com/public/rtmp/rtmp-flash-renderer.swf';

    function FlashRenderer(streamId, streamsInfo, streamTelemetry, options, logger) {
        this._logger = logger;
        this._streamId = streamId;
        this._streamsInfo = _.map(streamsInfo, function(info) {
            info.uri = encodeURI(info.uri).replace(/[#]/g, '%23');

            return info;
        });
        this._streamTelemetry = streamTelemetry;
        this._options = options;
        this._renderer = null;
        this._phenixVideo = null;
        this._namedEvents = new event.NamedEvents();

        this._onStalled = _.bind(stalled, this);
        this._onEnded = _.bind(ended, this);
        this._onError = _.bind(handleError, this);
        this._MediaElement = options.MediaElement || rtc.global.MediaElement;
        this._swfSrc = options.swfSrc || defaultSwfFileSrc;
        this._swfSrcPath = this._swfSrc.substring(0, this._swfSrc.lastIndexOf('/') + 1);
        this._swfSrcFileName = this._swfSrc.substring(this._swfSrc.lastIndexOf('/') + 1);
    }

    FlashRenderer.isSupported = function() {
        return hasFlashPlugin;
    };

    FlashRenderer.prototype.on = function(name, callback) {
        return this._namedEvents.listen(name, callback);
    };

    FlashRenderer.prototype.start = function(elementToAttachTo) {
        if (!this._MediaElement) {
            throw new Error('MediaElement must exist. Please include mediaelement.js library');
        }

        var that = this;
        var sources = _.map(this._streamsInfo, function(info) {
            return {
                src: info.uri,
                type: 'video/rtmp'
            };
        });
        var firstRtmpUri = _.get(this._streamsInfo, [0, 'uri'], '');
        var uriEndpoint = firstRtmpUri.substring(0, firstRtmpUri.lastIndexOf('/'));

        this._phenixVideo = new rtc.PhenixVideo(elementToAttachTo);

        this._phenixVideo.hookUpEvents();

        this._player = new this._MediaElement(this._phenixVideo.getElement(), {
            flashStreamer: uriEndpoint,
            plugins: ['flash', 'silverlight'],
            alwaysShowControls: false,
            success: function(mediaElement) {
                that._playerMediaElement = mediaElement;
            },
            pluginPath: this._swfSrcPath,
            filename: this._swfSrcFileName,
            renderers: ['flash_video'],
            error: that._onError
        });

        this._streamTelemetry.recordTimeToFirstFrame(this._playerMediaElement);
        this._streamTelemetry.recordRebuffering(this._playerMediaElement);
        this._streamTelemetry.recordVideoResolutionChanges(this, this._playerMediaElement);
        this._streamTelemetry.recordVideoPlayingAndPausing(this._playerMediaElement);

        this._player.setSrc(sources);

        if (this._playerMediaElement) {
            this._playerMediaElement.play();
        }

        _.addEventListener(this._playerMediaElement, 'stalled', that._onStalled, false);
        _.addEventListener(this._playerMediaElement, 'pause', that._onStalled, false);
        _.addEventListener(this._playerMediaElement, 'suspend', that._onStalled, false);
        _.addEventListener(this._playerMediaElement, 'ended', that._onEnded, false);

        return elementToAttachTo;
    };

    FlashRenderer.prototype.stop = function(reason) {
        var that = this;

        this._streamTelemetry.stop();

        if (this._player) {
            var finalizeStreamEnded = function finalizeStreamEnded() {
                disposePlayer.call(that);

                that._namedEvents.fire(streamEnums.rendererEvents.ended.name, [reason]);
            };

            try {
                finalizeStreamEnded();

                this._logger.info('[%s] Flash player has been destroyed', this._streamId);
            } catch (e) {
                that._logger.error('[%s] Error while destroying Flash player [%s]', that._streamId, e.code, e);

                finalizeStreamEnded();

                that._namedEvents.fire(streamEnums.rendererEvents.error.name, ['flash-player', e]);
            }
        }
    };

    FlashRenderer.prototype.getStats = function() {
        if (!this._playerMediaElement) {
            return {
                width: 0,
                height: 0,
                currentTime: 0.0,
                lag: 0.0,
                networkState: streamEnums.networkStates.networkNoSource.id
            };
        }

        var stat = {};
        var currentTime = this._playerMediaElement.currentTime;
        var trueCurrentTime = (_.now() - this._options.originStartTime) / 1000;

        stat.lag = Math.max(0.0, trueCurrentTime - currentTime);

        if (stat.estimatedBandwidth > 0) {
            stat.networkState = streamEnums.networkStates.networkLoading.id;
        } else if (stat.playTime > 0) {
            stat.networkState = streamEnums.networkStates.networkIdle.id;
        } else if (stat.video) {
            stat.networkState = streamEnums.networkStates.networkEmpty.id;
        } else {
            stat.networkState = streamEnums.networkStates.networkNoSource.id;
        }

        return stat;
    };

    FlashRenderer.prototype.setDataQualityChangedCallback = function(callback) {
        assert.isFunction(callback, 'callback');

        this.dataQualityChangedCallback = callback;
    };

    FlashRenderer.prototype.getPlayer = function() {
        return this._player;
    };

    FlashRenderer.prototype.addVideoDisplayDimensionsChangedCallback = function() {
        this._logger.warn('Unable to detect dimensions changes');
    };

    function disposePlayer() {
        this._player.pause();
        this._player.setSrc({
            src: '',
            type: 'video/mp4'
        });

        if (this._player.load) {
            this._player.load();
        }

        if (this._playerMediaElement && this._playerMediaElement.parentNode) {
            this._playerMediaElement.parentNode.replaceChild(this._phenixVideo.getElement(), this._playerMediaElement);
        }

        if (this._phenixVideo) {
            this._phenixVideo.destroy();
            this._phenixVideo.src = '';
        }

        if (this._playerMediaElement) {
            _.removeEventListener(this._playerMediaElement, 'stalled', this._onStalled, false);
            _.removeEventListener(this._playerMediaElement, 'pause', this._onStalled, false);
            _.removeEventListener(this._playerMediaElement, 'suspend', this._onStalled, false);
            _.removeEventListener(this._playerMediaElement, 'ended', this._onEnded, false);
        }

        this._player = null;
        this._phenixVideo = null;
        this._playerMediaElement = null;
    }

    function handleError(e) {
        this._namedEvents.fire(streamEnums.rendererEvents.error.name, ['flash-player', e]);
    }

    function reload() {
        this._player.dispose();

        this._player = null;

        var videoElement = this._phenixVideo.getElement();

        disposePlayer.call(this);
        this.start(videoElement);
    }

    function reloadIfAble() {
        if (!canReload.call(this)) {
            return;
        }

        this._logger.warn('Reloading unhealthy stream that was active for at least [%s] seconds', minTimeBeforeNextReload / 1000);

        this._lastReloadTime = _.now();

        reload.call(this);
    }

    function canReload() {
        var hasElapsedMinTimeSinceLastReload = !this._lastReloadTime || _.now() - this._lastReloadTime > minTimeBeforeNextReload;

        return this._playerMediaElement && !this._waitForLastChunk && this._player && this._playerMediaElement.buffered.length !== 0 && hasElapsedMinTimeSinceLastReload;
    }

    function stalled(event) {
        var that = this;

        that._logger.info('[%s] Loading flash player stalled caused by [%s] event.', that._streamId, event.type);

        var currentVideoTime = that._playerMediaElement.currentTime;

        setTimeout(function() {
            if (that._playerMediaElement && that._playerMediaElement.currentTime === currentVideoTime && !that._playerMediaElement.paused && canReload.call(that)) {
                that._logger.warn('Reloading stream after being stalled for [%s] seconds', timeoutForStallWithoutProgressToRestart / 1000);

                reloadIfAble.call(that);
            }
        }, timeoutForStallWithoutProgressToRestart);
    }

    function ended() {
        this._logger.info('[%s] Flash player ended.', this._streamId);
    }

    function detectFlashPlugin() {
        var defaultVersion = [10, 0, 0];
        var pluginName = 'Shockwave Flash';
        var mimeType = 'application/x-shockwave-flash';
        var activeX = 'ShockwaveFlash.ShockwaveFlash';
        var version = [0, 0, 0];

        // Firefox, Webkit, Opera
        if (_.get(rtc.global.navigator, ['plugins', pluginName])) {
            var description = rtc.global.navigator.plugins[pluginName].description;

            if (description && _.get(rtc.global.navigator, ['mimeTypes', mimeType, 'enabledPlugin'], false)) {
                version = description.replace(pluginName, '').replace(/^\s+/, '').replace(/\sr/gi, '.').split('.');

                for (var i = 0, total = version.length; i < total; i++) {
                    version[i] = parseInt(version[i].match(/\d+/), 10);
                }
            }
            // Internet Explorer / ActiveX
        } else if (rtc.global.ActiveXObject) {
            try {
                var ax = new rtc.global.ActiveXObject(activeX);

                if (ax) {
                    var versionString = ax.GetVariable("$version") || '';
                    var versionInfo = _.get(versionString.split(" "), [1], version).split(",");

                    version = [parseInt(versionInfo[0], 10), parseInt(versionInfo[1], 10), parseInt(versionInfo[2], 10)];
                }
            } catch (e) {
                console.error(e);
            }
        }

        return (version[0] > defaultVersion[0] || (version[0] === defaultVersion[0] && version[1] > 0) || (version[0] === defaultVersion[0] && version[1] === 0 && version[2] >= 0));
    }

    return FlashRenderer;
});