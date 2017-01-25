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
    '../observable/ObservableArray',
    './stream.json',
    './track.json'
], function (_, assert, Observable, ObservableArray, stream, track) {
    'use strict';

    var streamTypes = stream.types;
    var trackStates = track.states;

    function Stream(uri, type, audioState, videoState) {
        this.init(uri, type, audioState, videoState);
    }

    Stream.prototype.init = function (uri, type, audioState, videoState) {
        assert.isString(uri, 'uri');

        this._uri = new Observable(uri);
        this._type = new Observable(type, assertIsValidStreamType);
        this._audioState = new Observable(audioState || trackStates.trackEnabled.name, assertIsValidTrackState);
        this._videoState = new Observable(videoState || trackStates.trackEnabled.name, assertIsValidTrackState);
    };

    Stream.prototype.getUri = function getUri() {
        return this._uri.getValue();
    };

    Stream.prototype.getType = function getType() {
        return this._type.getValue();
    };

    Stream.prototype.getObservableAudioState = function getObservableAudioState() {
        return this._audioState;
    };

    Stream.prototype.getObservableVideoState = function getObservableVideoState() {
        return this._videoState;
    };

    Stream.prototype.toJson = function toJson() {
        return {
            uri: this._uri.getValue(),
            type: this._type.getValue(),
            audioState: this._audioState.getValue(),
            videoState: this._videoState.getValue()
        };
    };

    Stream.prototype._update = function update(stream) {
        if (!_.isObject(stream)) {
            return;
        }

        if (stream.hasOwnProperty('audioState')) {
            this._audioState.setValue(stream.audioState);
        }

        if (stream.hasOwnProperty('videoState')) {
            this._videoState.setValue(stream.videoState);
        }
    };

    function assertIsValidStreamType(type) {
        type = _.getEnumName(streamTypes, type);

        if (!type) {
            throw new Error('"type" must be a valid stream type');
        }

        return type;
    }

    function assertIsValidTrackState(state) {
        state = _.getEnumName(trackStates, state);

        if (!state) {
            throw new Error('"state" must be a valid track state');
        }

        return state;
    }

    return Stream;
});