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
    './AdminAPI',
    './PhenixPCast',
    'phenix-rtc'
], function (_, assert, AdminAPI, PhenixPCast, rtc) {
    'use strict';

    function PCastExpress(options) {
        assert.isObject(options, 'options');
        assert.stringNotEmpty(options.backendUri, 'options.backendUri');
        assert.isObject(options.authenticationData, 'options.authenticationData');

        this._pcast = null;
        this._subscribers = {};
        this._publishers = {};
        this._adminAPI = new AdminAPI(options.backendUri, options.authenticationData);
        this._pcast = new PhenixPCast(options);
    }

    PCastExpress.prototype.stop = function stop() {
        if (!this._pcast) {
            return;
        }

        this._pcast.stop();
    };

    PCastExpress.prototype.getPCast = function getPCast() {
        return this._pcast;
    };

    PCastExpress.prototype.publish = function publish(options, callback) {
        assert.isObject(options, 'options');
        assert.isObject(options.mediaConstraints, 'options.mediaConstraints');
        assert.isObject(options.capabilities, 'options.capabilities');
        if (options.videoElement) {
            assert.isObject(options.videoElement, 'options.videoElement');
        }

        var that = this;

        instantiatePCastIfNoneExist.call(this, function(error, instantiateResponse) {
            if (error) {
                return callback(error);
            }

            if (instantiateResponse.status !== 'ok') {
                return callback(null, instantiateResponse);
            }

            that._pcast.getUserMedia(options.mediaConstraints, function(pcast, status, userMedia, e) {
                if (e) {
                    return callback(e);
                }

                if (status !== 'ok') {
                    return callback(null, {status: status});
                }

                that._adminAPI.createStreamTokenForPublishing(that._pcast.getProtocol().getSessionId(), options.capabilities, function(error, response) {
                    if (error) {
                        return callback(error);
                    }

                    if (response.status !== 'ok') {
                        return callback(null, response);
                    }

                    that._pcast.publish(response.streamToken, userMedia, function(pcast, status, publisher) {
                        if (response.status !== 'ok') {
                            return callback(null, {status: status});
                        }

                        that._publishers[publisher.getStreamId()] = publisher;

                        if (options.videoElement) {
                            rtc.attachMediaStream(options.videoElement, userMedia);
                        }

                        var expressPublisher = createExpressPublisher.call(that, publisher);

                        callback(null, {status: 'ok', publisher: expressPublisher});
                    })
                }, 1)
            });
        });
    };

    PCastExpress.prototype.subscribe = function subscribe(options, callback) {
        assert.isObject(options, 'options');
        assert.stringNotEmpty(options.streamId, 'options.streamId');
        assert.isObject(options.capabilities, 'options.capabilities');
        if (options.videoElement) {
            assert.isObject(options.videoElement, 'options.videoElement');
        }

        var that = this;

        instantiatePCastIfNoneExist.call(this, function(error, instantiateResponse) {
            if (error) {
                return callback(error);
            }

            if (instantiateResponse.status !== 'ok') {
                return callback(null, instantiateResponse);
            }

            that._adminAPI.createStreamTokenForSubscribing(that._pcast.getProtocol().getSessionId(), options.capabilities, options.streamId, function(error, response) {
                if (error) {
                    return callback(error);
                }

                if (response.status !== 'ok') {
                    return callback(null, response);
                }

                that._pcast.subscribe(response.streamToken, function(pcast, status, subscriber) {
                    if (response.status !== 'ok') {
                        return callback(null, {status: status});
                    }

                    that._subscribers[subscriber.getStreamId()] = subscriber;

                    var renderer;

                    if (options.videoElement) {
                        renderer = subscriber.createRenderer();

                        renderer.start(options.videoElement);
                    }

                    var expressSubscriber = createExpressSubscriber.call(that, subscriber, renderer);

                    callback(null, {status: 'ok', mediaStream: expressSubscriber});
                })
            }, 1);
        });
    };

    function instantiatePCastIfNoneExist(callback) {
        if (this._pcast && this._pcast.getStatus() !== 'offline') {
            return callback(null, {status: 'ok'});
        }

        var that = this;

        this._adminAPI.createAuthenticationToken(function(error, response) {
            if (error) {
                return callback(error);
            }

            if (response.status !== 'ok') {
                return callback(null, response);
            }

            that._pcast.start(response.authenticationToken,
                function authenticationToken(sessionId) {},
                function onlineCallback() {
                    callback(null, {status: 'ok'});
                }, function offlineCallback(reason) {
                    callback(null, {status: 'offline'});
                });
        });
    }

    function stopPCastIfNoActiveStreams() {
        var subscriptionCount = _.values(this._subscribers).length;
        var publisherCount = _.values(this._publishers).length;

        if (!publisherCount && !subscriptionCount) {
            this.stop();
        }
    }

    function createExpressPublisher(publisher) {
        var that = this;
        var publisherStop = publisher.stop;

        publisher.stop =  function() {
            publisherStop();

            delete that._publishers[publisher.getStreamId()];

            stopPCastIfNoActiveStreams.call(that);
        };

        publisher.enableAudio = function() {
            return setStreamAudioTracksState(publisher.getStream(), true);
        };

        publisher.disableAudio = function() {
            return setStreamAudioTracksState(publisher.getStream(), false);
        };

        publisher.enableVideo = function() {
            return setStreamVideoTracksState(publisher.getStream(), true);
        };

        publisher.disableVideo = function() {
            return setStreamVideoTracksState(publisher.getStream(), false);
        };

        return publisher;
    }

    function createExpressSubscriber(subscriber, renderer) {
        var that = this;
        var subscriberStop = subscriber.stop;

        subscriber.stop = function() {
            if (renderer) {
                renderer.stop();
            }

            subscriberStop();

            delete that._subscribers[subscriber.getStreamId()];

            stopPCastIfNoActiveStreams.call(that);
        };

        subscriber.enableAudio = function() {
            return setStreamAudioTracksState(subscriber.getStream(), true);
        };

        subscriber.disableAudio = function() {
            return setStreamAudioTracksState(subscriber.getStream(), false);
        };

        subscriber.enableVideo = function() {
            return setStreamVideoTracksState(subscriber.getStream(), true);
        };

        subscriber.disableVideo = function() {
            return setStreamVideoTracksState(subscriber.getStream(), false);
        };

        return subscriber;
    }

    function setStreamAudioTracksState(stream, newState) {
        if (!stream) {
            return;
        }

        setTracksEnabled(stream.getAudioTracks(), newState);

        return newState;
    }

    function setStreamVideoTracksState(stream, newState) {
        if (!stream) {
            return;
        }

        setTracksEnabled(stream.getVideoTracks(), newState);

        return newState;
    }

    function setTracksEnabled(tracks, enabled) {
        assert.isArray(tracks, 'tracks');

        _.forEach(tracks, function(track) {
            track.enabled = enabled;
        })
    }

    return PCastExpress;
});
