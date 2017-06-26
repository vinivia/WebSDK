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
    '../AdminAPI',
    '../PCast',
    '../room/RoomService',
    'phenix-rtc'
], function (_, assert, AdminAPI, PCast, RoomService, rtc) {
    'use strict';

    function PCastExpress(options) {
        assert.isObject(options, 'options');
        assert.stringNotEmpty(options.backendUri, 'options.backendUri');
        assert.isObject(options.authenticationData, 'options.authenticationData');

        this._pcast = null;
        this._subscribers = {};
        this._publishers = {};
        this._roomServices = {};
        this._adminAPI = new AdminAPI(options.backendUri, options.authenticationData);
        this._pcast = new PCast(options);
    }

    PCastExpress.prototype.stop = function stop() {
        if (_.values(this._roomServices).length) {
            _.forOwn(this._roomServices, function (roomService) {
                roomService.stop();
            });

            this._roomServices = {};
        }

        if (this._pcast) {
            this._pcast.stop();
        }
    };

    PCastExpress.prototype.getPCast = function getPCast() {
        return this._pcast;
    };

    PCastExpress.prototype.getUserMedia = function(options, callback) {
        var that = this;

        assert.isObject(options.mediaConstraints, 'options.mediaConstraints');

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

                callback(null, {status: 'ok', userMedia: userMedia});
            });
        });
    };

    PCastExpress.prototype.publish = function publish(options, callback) {
        assert.isObject(options, 'options');

        if (options.capabilities) {
            assert.isArray(options.capabilities, 'options.capabilities');
        }

        if (options.connectOptions) {
            assert.isArray(options.connectOptions, 'options.connectOptions');
        }

        if (options.mediaConstraints) {
            assert.isObject(options.mediaConstraints, 'options.mediaConstraints');
        } else {
            assert.isObject(options.userMediaStream, 'options.userMediaStream');
        }

        if (options.videoElement) {
            assert.isObject(options.videoElement, 'options.videoElement');
        }

        if (options.monitor) {
            assert.isObject(options.monitor, 'options.monitor');
            assert.isFunction(options.monitor.callback, 'options.monitor.callback');

            if (options.monitor.options) {
                assert.isObject(options.monitor.options, 'options.monitor.options');
            }
        }

        var that = this;

        instantiatePCastIfNoneExist.call(this, function(error, instantiateResponse) {
            if (error) {
                return callback(error);
            }

            if (instantiateResponse.status !== 'ok') {
                return callback(null, instantiateResponse);
            }

            if (options.userMediaStream) {
                return getStreamingTokenAndPublish.call(that, options.userMediaStream, options, callback);
            }

            that._pcast.getUserMedia(options.mediaConstraints, function(pcast, status, userMedia, e) {
                if (e) {
                    return callback(e);
                }

                if (status !== 'ok') {
                    return callback(null, {status: status});
                }

                getStreamingTokenAndPublish.call(that, userMedia, options, callback);
            });
        });
    };

    var connectOptionCapabilities = ['streaming', 'low-latency', 'on-demand', 'uld', 'vvld', 'vld', 'ld', 'sd', 'hd', 'fhd', 'uhd'];

    PCastExpress.prototype.publishRemote = function publish(options, callback) {
        assert.isObject(options, 'options');
        assert.stringNotEmpty(options.streamUri, 'options.streamUri');

        if (options.capabilities) {
            assert.isArray(options.capabilities, 'options.capabilities');
        }

        if (options.connectOptions) {
            assert.isArray(options.connectOptions, 'options.connectOptions');
        }

        if (options.mediaConstraints) {
            throw new Error('Invalid argument, Media Constraints, for publishing remote.');
        }

        if (options.videoElement) {
            throw new Error('May not view remote stream publisher. Please subscribe to view.');
        }

        if (options.monitor) {
            throw new Error('May not monitor remote stream.');
        }

        if (options.frameRate) {
            assert.isObject(options.frameRate, 'options.frameRate');

            if (options.frameRate.exact) {
                assert.isNumber(options.frameRate.exact, 'options.frameRate.exact');
            }

            if (options.frameRate.max) {
                assert.isNumber(options.frameRate.max, 'options.frameRate.max');
            }
        }

        var that = this;

        instantiatePCastIfNoneExist.call(this, function(error, instantiateResponse) {
            if (error) {
                return callback(error);
            }

            if (instantiateResponse.status !== 'ok') {
                return callback(null, instantiateResponse);
            }

            var remoteOptions = _.assign(options, {connectOptions: [], capabilities: []});

            if (!_.includes(remoteOptions.capabilities, 'publish-uri')) {
                remoteOptions.capabilities.push('publish-uri');
            }

            _.forEach(connectOptionCapabilities, function(capability) {
                if (_.includes(remoteOptions.capabilities, capability)) {
                    remoteOptions.connectOptions.push('publisher-capability=' + capability);
                }
            });

            if (options.frameRate && options.frameRate.exact) {
                remoteOptions.connectOptions.push('source-uri-video-fps=' + options.frameRate.exact);
            }

            if (options.frameRate && options.frameRate.max) {
                remoteOptions.connectOptions.push('source-uri-video-fps-max=' + options.frameRate.max);
            }

            getStreamingTokenAndPublish.call(that, remoteOptions.streamUri, remoteOptions, callback);
        });
    };

    PCastExpress.prototype.subscribe = function subscribe(options, callback) {
        assert.isObject(options, 'options');
        assert.stringNotEmpty(options.streamId, 'options.streamId');
        assert.isObject(options.capabilities, 'options.capabilities');
        if (options.videoElement) {
            assert.isObject(options.videoElement, 'options.videoElement');
        }
        if (options.monitor) {
            assert.isObject(options.monitor, 'options.monitor');
            assert.isFunction(options.monitor.callback, 'options.monitor.callback');
            if (options.monitor.options) {
                assert.isObject(options.monitor.options, 'options.monitor.options');
            }
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

                subscribeToStream.call(that, response.streamToken, options, callback);
            }, 1);
        });
    };

    PCastExpress.prototype.createRoomService = function createRoomService(callback) {
        var that = this;
        var uniqueId = _.uniqueId();

        instantiatePCastIfNoneExist.call(this, function(error, instantiateResponse) {
            if (error) {
                return callback(error);
            }

            if (instantiateResponse.status !== 'ok') {
                return callback(null, instantiateResponse);
            }

            that._roomServices[uniqueId] = new RoomService(that._pcast);

            var expressRoomService = createExpressRoomService.call(that, that._roomServices[uniqueId], uniqueId);

            callback(null, {status: 'ok', roomService: expressRoomService});
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

    function getStreamingTokenAndPublish(userMediaOrUri, options, callback) {
        var that = this;

        assert.isArray(options.capabilities, 'options.capabilities');

        that._adminAPI.createStreamTokenForPublishing(that._pcast.getProtocol().getSessionId(), options.capabilities, function(error, response) {
            if (error) {
                return callback(error);
            }

            if (response.status !== 'ok') {
                return callback(null, response);
            }

            publishUserMediaOrUri.call(that, response.streamToken, userMediaOrUri, options, callback);
        }, 1);
    }

    function publishUserMediaOrUri(streamToken, userMediaOrUri, options, callback) {
        var that = this;

        if (options.tags) {
            assert.isArray(options.tags, 'options.tags');
        }

        if (options.connectOptions) {
            assert.isArray(options.connectOptions, 'options.connectOptions');
        }

        var publishCallback = function publishCallback(pcast, status, publisher) {
            if (status !== 'ok') {
                return callback(null, {status: status});
            }

            that._publishers[publisher.getStreamId()] = publisher;

            if (options.videoElement) {
                rtc.attachMediaStream(options.videoElement, userMediaOrUri);
            }

            if (options.monitor) {
                var retryPublisher = function retryPublisher(reason) {
                    var placeholder = _.uniqueId();
                    that._publishers[placeholder] = true;
                    publisher.stop(reason);
                    publishUserMedia.call(that, streamToken, userMediaOrUri, options, callback);
                    delete that._publishers[placeholder];
                };
                var monitorCallback = _.bind(onMonitorCallback, that, options.monitor.callback, retryPublisher);

                publisher.monitor(options.monitor.options || {}, monitorCallback);
            }

            var expressPublisher = createExpressPublisher.call(that, publisher, options.videoElement);

            callback(null, {status: 'ok', publisher: expressPublisher});
        };

        that._pcast.publish(streamToken, userMediaOrUri, publishCallback, options.tags, {connectOptions: options.connectOptions});
    }

    function subscribeToStream(streamToken, options, callback) {
        var that = this;

        that._pcast.subscribe(streamToken, function(pcast, status, subscriber) {
            var retrySubscriber = function retrySubscriber(reason) {
                var placeholder = _.uniqueId();
                that._subscribers[placeholder] = true;
                subscriber.stop(reason);
                subscribeToStream.call(that, streamToken, options, callback);
                delete that._subscribers[placeholder];
            };

            if (status === 'streaming-not-ready') {
                return callback(null, {status: status, retry: _.bind(retrySubscriber, that, status)});
            }

            if (status !== 'ok') {
                return callback(null, {status: status});
            }

            that._subscribers[subscriber.getStreamId()] = subscriber;

            var renderer;

            if (options.videoElement) {
                renderer = subscriber.createRenderer();

                renderer.start(options.videoElement);
            }

            if (options.monitor) {
                var monitorCallback = _.bind(onMonitorCallback, that, options.monitor.callback, retrySubscriber);

                subscriber.monitor(options.monitor.options || {}, monitorCallback);
            }

            var expressSubscriber = createExpressSubscriber.call(that, subscriber, renderer);

            callback(null, {status: 'ok', mediaStream: expressSubscriber});
        })

    }

    function createExpressPublisher(publisher, videoElement) {
        var publisherStop = publisher.stop;

        publisher.stop =  function(reason) {
            publisherStop(reason);

            if (videoElement) {
                videoElement.src = '';
                videoElement.srcObject = null;
            }
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
        var subscriberStop = subscriber.stop;

        subscriber.stop = function(reason) {
            if (renderer) {
                renderer.stop();
            }

            subscriberStop(reason);
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

    function createExpressRoomService(roomService, uniqueId) {
        var that = this;
        var roomServiceStop = roomService.stop;

        roomService.stop = function() {
            roomServiceStop.call(roomService);

            delete that._roomServices[uniqueId];

            // stopPCastIfNoActiveStreams.call(that);
        };

        return roomService;
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

    function onMonitorCallback(callback, retry, stream, reason, description) {
        switch (reason) {
            case  'client-side-failure':
                callback(null, {status: reason, retry: _.bind(retry, null, reason)});
                // handle failure event, redo stream
                break;
            default:
                // no failure has occurred, handle monitor event
                break;
        }
    }

    return PCastExpress;
});
