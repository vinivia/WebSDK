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
    '../logging/pcastLoggerFactory',
    '../PCastEndPoint',
    './AudioContext',
    './AudioVolumeMeter',
    './AudioSpeakerDetectionAlgorithm'
], function (_, assert, pcastLoggerFactory, PCastEndPoint, AudioContext, AudioVolumeMeter, AudioSpeakerDetectionAlgorithm) {
    'use strict';

    function AudioSpeakerDetector(userMediaStreams, options) {
        assert.isArray(userMediaStreams, 'userMediaStreams');

        options = options || {};

        this._baseUri = options.uri || PCastEndPoint.DefaultPCastUri;
        this._logger = options.logger || pcastLoggerFactory.createPCastLogger(this._baseUri);
        this._audioContext = options.audioContext || new AudioContext();
        this._nativeAudioContext = this._audioContext.getNativeAudioContext();
        this._audioVolumeMeters = [];
        this._onSpeakingChanged = null;
        this._userMediaStreams = userMediaStreams;
        this._disposeOfAudioContext = !_.isObject(options.audioContext);
    }

    AudioSpeakerDetector.prototype.start = function start(options, callback) {
        assert.isFunction(callback, 'callback');

        this._onSpeakingChanged = callback;

        options = options || {};

        _.forEach(this._userMediaStreams, _.bind(setupSpeakingDetection, this, options));
    };

    AudioSpeakerDetector.prototype.stop = function stop() {
        _.forEach(this._audioVolumeMeters, function stopAudioVolumeMeters(meter) {
            meter.stop();
        });

        this._onSpeakingChanged = null;
    };

    AudioSpeakerDetector.prototype.dispose = function dispose() {
        if (this._disposeOfAudioContext) {
            this._nativeAudioContext.close();
        }

        this._userMediaStreams = null;
    };

    AudioSpeakerDetector.prototype.toString = function toString() {
        return 'AudioSpeakerDetector';
    };

    function setupSpeakingDetection(options, stream) {
        var audioVolumeMeter = new AudioVolumeMeter(this._logger);
        var audioSpeakerDetectionAlgorithm = new AudioSpeakerDetectionAlgorithm(this._logger);

        audioVolumeMeter.init(this._nativeAudioContext, options.alpha);
        audioVolumeMeter.connect(stream);

        audioSpeakerDetectionAlgorithm.onValue(this._onSpeakingChanged);
        audioSpeakerDetectionAlgorithm.startDetection(audioVolumeMeter, options);

        this._audioVolumeMeters.push(audioVolumeMeter)
    }

    return AudioSpeakerDetector;
});
