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
    './../LodashLight',
    './../assert',
    'phenix-rtc'
], function (_, assert, phenixRTC) {
    'use strict';

    var start = window['__phenixPageLoadTime'] || window['__pageLoadTime'] || _.now();
    var defaultEnvironment = '%ENVIRONMENT%' || '?';
    var sdkVersion = '%SDKVERSION%' || '?';

    function StreamAnalytix(sessionId, logger, metricsTransmitter) {
        assert.stringNotEmpty(sessionId, 'sessionId');

        this._environment = defaultEnvironment;
        this._version = sdkVersion;
        this._sessionId = sessionId;
        this._properties = {};
        this._logger = logger;
        this._metricsTransmitter = metricsTransmitter;
        this._start = _.now();
        this._disposables = [];

        logMetric.call(this, 'Stream initializing');
    }

    StreamAnalytix.prototype.setProperty = function(name, value) {
        assert.stringNotEmpty(name, 'name');
        assert.stringNotEmpty(value, 'value');

        this._properties[name] = value;
    };

    StreamAnalytix.prototype.recordMetric = function(metric, value, previousValue) {
        assert.stringNotEmpty(metric, 'metric');

        recordMetricRecord.call(this, {
            metric: metric,
            elapsed: this.elapsed(),
            value: value,
            previousValue: previousValue
        }, since());
    };

    StreamAnalytix.prototype.setStreamId = function(streamId) {
        assert.stringNotEmpty(streamId, 'streamId');

        if (this._streamId) {
            throw new Error('Stream ID can only be set once.');
        }

        this._streamId = streamId;

        var now = _.now();

        recordMetricRecord.call(this, {
            metric: 'Initialized',
            elapsed: this.elapsed() - now + this._start // Adjust for delay to get the stream ID
        }, since() - (now - this._start) / 1000); // Adjust for delay to get the stream ID);
    };

    StreamAnalytix.prototype.setStartOffset = function(startOffset) {
        assert.isNumber(startOffset, 'startOffset');

        if (this._startOffset) {
            throw new Error('Start offset can only be set once.');
        }

        this._startOffset = startOffset;

        this.recordMetric('Offset', {uint64: startOffset});
    };

    StreamAnalytix.prototype.getStartOffset = function () {
        return this._startOffset;
    };

    StreamAnalytix.prototype.elapsed = function () {
        var now = _.now();

        return now - this._start;
    };

    StreamAnalytix.prototype.stop = function() {
        _.forEach(this._disposables, function(dispose) {
            dispose();
        });

        this.recordMetric('Stopped');

        logMetric.call(this, 'Stream stopped');
    };

    StreamAnalytix.prototype.recordTimeToFirstFrame = function(video) {
        var that = this;
        var timeOfFirstFrame;

        var listenForFirstFrame = function() {
            if (timeOfFirstFrame) {
                return;
            }

            that.recordMetric('TimeToFirstFrame');

            timeOfFirstFrame = _.now();

            logMetric.call(that, 'First frame');

            phenixRTC.removeEventListener(video, 'loadeddata', listenForFirstFrame);
        };

        phenixRTC.addEventListener(video, 'loadeddata', listenForFirstFrame);
    };

    // TODO(dy) Add logging for bit rate changes using PC.getStats

    StreamAnalytix.prototype.recordVideoResolutionChanges = function(video) {
        var that = this;
        var lastResolution = {
            width: video.videoWidth,
            height: video.videoHeight
        };

        var listenForResolutionChangeOnProgress = function() {
            if (lastResolution.width === video.videoWidth && lastResolution.height === video.videoHeight) {
                return;
            }

            that.recordMetric('ResolutionChanged', {string: video.videoWidth + 'x' + video.videoHeight}, {string: lastResolution.width + 'x' + lastResolution.height});

            lastResolution = {
                width: video.videoWidth,
                height: video.videoHeight
            };

            logMetric.call(that, 'Resolution changed: width [%s] height [%s]', video.videoWidth, video.videoHeight);
        };

        // TODO(sbi) We should use our stream polling for this as it's way more efficien than processing on each progress

        // Events loadedmetadata and loadeddata do not fire as expected. So Progress is used.
        phenixRTC.addEventListener(video, 'progress', listenForResolutionChangeOnProgress);

        this._disposables.push(function() {
            phenixRTC.removeEventListener(video, 'progress', listenForResolutionChangeOnProgress);
        });
    };

    StreamAnalytix.prototype.recordRebuffering = function(video) {
        var that = this;
        var videoStalled;
        var lastProgress;

        var listenForStall = function() {
            if (videoStalled) {
                return;
            }

            that.recordMetric('Stalled');

            videoStalled = _.now();

            logMetric.call(that, '[buffering] Stream has stalled');
        };

        var listenForContinuation = function(event) {
            if (!videoStalled || !video.buffered.length || (event.type === 'progress' && video.buffered.end(video.buffered.length) === lastProgress)) {
                return;
            }

            if (event.type === 'progress') {
                lastProgress = video.buffered.end(video.buffered.length);
            }

            var timeSinceStop = _.now() - videoStalled;

            that.recordMetric('Buffering', {uint64: timeSinceStop});
            that.recordMetric('Playing');

            logMetric.call(that, '[buffering] Stream has recovered from stall after [%s] milliseconds', timeSinceStop);

            videoStalled = null;
        };

        phenixRTC.addEventListener(video, 'stalled', listenForStall);
        phenixRTC.addEventListener(video, 'paused', listenForStall);
        phenixRTC.addEventListener(video, 'suspend', listenForStall);
        phenixRTC.addEventListener(video, 'play', listenForContinuation);
        phenixRTC.addEventListener(video, 'playing', listenForContinuation);
        phenixRTC.addEventListener(video, 'progress', listenForContinuation);

        this._disposables.push(function() {
            phenixRTC.removeEventListener(video, 'stalled', listenForStall);
            phenixRTC.removeEventListener(video, 'paused', listenForStall);
            phenixRTC.removeEventListener(video, 'suspend', listenForStall);
            phenixRTC.removeEventListener(video, 'play', listenForContinuation);
            phenixRTC.removeEventListener(video, 'playing', listenForContinuation);
            phenixRTC.removeEventListener(video, 'progress', listenForContinuation);
        });
    };

    function logMetric() {
        var args = Array.prototype.slice.call(arguments);

        if (args.length === 0) {
            throw new Error('Invalid logging arguments.');
        }

        var streamAnalytixPrepend = '[%s] [StreamAnalytix] [%s] ';
        var message = streamAnalytixPrepend + args[0];
        var loggingArguments = args.slice(1);
        var analytixArguments = [message, this._streamId, _.now() - this._start].concat(loggingArguments);

        this._logger.debug.apply(this._logger, analytixArguments);
    }

    function since() {
        var now = _.now();

        return (now - start) / 1000;
    }

    function recordMetricRecord(record, since) {
        assert.stringNotEmpty(record.metric, 'record.metric');

        record = _.assign(this._properties, record);

        this._metricsTransmitter.submitMetric(record.metric, since, this._sessionId, this._streamId, this._environment, this._version, record);
    }

    return StreamAnalytix;
});