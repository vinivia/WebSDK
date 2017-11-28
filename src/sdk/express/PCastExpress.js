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
    'phenix-web-lodash-light',
    'phenix-web-assert',
    '../AdminAPI',
    '../userMedia/UserMediaResolver',
    '../PCast',
    'phenix-rtc',
    '../streaming/shaka.json'
], function (_, assert, AdminAPI, UserMediaResolver, PCast, rtc, shakaEnums) {
    'use strict';

    var unauthorizedStatus = 'unauthorized';
    var capacityBackoffTimeout = 1000;
    var defaultPrerollSkipDuration = 500;

    function PCastExpress(options) {
        assert.isObject(options, 'options');
        assert.isStringNotEmpty(options.backendUri, 'options.backendUri');
        assert.isObject(options.authenticationData, 'options.authenticationData');

        if (options.authToken) {
            assert.isStringNotEmpty(options.authToken, 'options.authToken');
        }

        if (options.onError) {
            assert.isFunction(options.onError, 'options.onError');
        }

        this._pcast = null;
        this._subscribers = {};
        this._publishers = {};
        this._adminAPI = new AdminAPI(options.backendUri, options.authenticationData);
        this._pcast = new PCast(options);
        this._logger = this._pcast.getLogger();
        this._isInstantiated = false;
        this._reauthCount = 0;
        this._authToken = options.authToken;
        this._onError = options.onError;

        instantiatePCast.call(this);
    }

    PCastExpress.prototype.dispose = function dispose() {
        if (this._pcast) {
            this._pcast.stop();
        }
    };

    PCastExpress.prototype.getPCast = function getPCast() {
        return this._pcast;
    };

    PCastExpress.prototype.getAdminAPI = function getAdminAPI() {
        return this._adminAPI;
    };

    PCastExpress.prototype.getUserMedia = function(options, callback) {
        var that = this;

        assert.isObject(options.mediaConstraints, 'options.mediaConstraints');
        assert.isFunction(callback, 'callback');

        if (options.resolution) {
            assert.isNumber(options.resolution, 'options.resolution');
        }

        if (options.frameRate) {
            assert.isNumber(options.frameRate, 'options.frameRate');
        }

        if (options.aspectRatio) {
            assert.isStringNotEmpty(options.aspectRatio, 'options.aspectRatio');
        }

        if (options.onResolveMedia) {
            assert.isFunction(options.onResolveMedia, 'options.onResolveMedia');
        }

        if (options.onScreenShare) {
            assert.isFunction(options.onScreenShare, 'options.onScreenShare');
        }

        var userMediaResolver = new UserMediaResolver(that._pcast, options.aspectRatio, options.resolution, options.frameRate, function(screenOptions) {
            screenOptions = options.onScreenShare ? options.onScreenShare(screenOptions) : screenOptions;

            if (screenOptions.resolution) {
                assert.isNumber(screenOptions.resolution, 'clientOptions.resolution');
            }

            if (screenOptions.frameRate) {
                assert.isNumber(screenOptions.frameRate, 'screenOptions.frameRate');
            }

            if (screenOptions.aspectRatio) {
                assert.isStringNotEmpty(screenOptions.aspectRatio, 'screenOptions.aspectRatio');
            }

            return _.assign({resolutionHeight: screenOptions.resolution}, screenOptions);
        });

        userMediaResolver.getUserMedia(options.mediaConstraints, function(error, response) {
            if (error) {
                return callback(error);
            }

            if (options.onResolveMedia) {
                options.onResolveMedia(response.options);
            }

            callback(null, _.assign({status: 'ok'}, response));
        });
    };

    PCastExpress.prototype.publish = function publish(options, callback) {
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');

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

        if (options.streamToken) {
            assert.isStringNotEmpty(options.streamToken, 'options.streamToken');
        }

        var that = this;

        this.waitForOnline(function() {
            if (options.userMediaStream) {
                return getStreamingTokenAndPublish.call(that, options.userMediaStream, options, false, callback);
            }

            that.getUserMedia(options, function(error, response) {
                if (error) {
                    return callback(error);
                }

                if (response.status !== 'ok') {
                    return callback(null, response);
                }

                getStreamingTokenAndPublish.call(that, response.userMedia, options, true, callback);
            });
        });
    };

    var connectOptionCapabilities = ['streaming', 'low-latency', 'on-demand', 'uld', 'vvld', 'vld', 'ld', 'sd', 'hd', 'fhd', 'uhd'];

    PCastExpress.prototype.publishRemote = function publish(options, callback) {
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');
        assert.isStringNotEmpty(options.streamUri, 'options.streamUri');

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

        if (options.prerollSkipDuration) {
            assert.isNumber(options.prerollSkipDuration, 'options.prerollSkipDuration');
        }

        if (options.monitor) {
            assert.isObject(options.monitor, 'options.monitor');
            assert.isFunction(options.monitor.callback, 'options.monitor.callback');

            if (options.monitor.options) {
                assert.isObject(options.monitor.options, 'options.monitor.options');
            }
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

        if (options.streamToken) {
            assert.isStringNotEmpty(options.streamToken, 'options.streamToken');
        }

        var that = this;

        this.waitForOnline(function() {
            var remoteOptions = _.assign({
                connectOptions: [],
                capabilities: []
            }, options);

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

            remoteOptions.connectOptions.push('source-uri-preroll-skip-duration=' + (_.isNumber(options.prerollSkipDuration) ? options.prerollSkipDuration : defaultPrerollSkipDuration).toString());

            getStreamingTokenAndPublish.call(that, remoteOptions.streamUri, remoteOptions, false, callback);
        });
    };

    PCastExpress.prototype.publishScreen = function publish(options, callback) {
        var publishScreenOptions = _.assign({mediaConstraints: {screen: true}}, options);

        _.set(publishScreenOptions, ['monitor', 'options'], _.assign({}, {
            monitorFrameRate: false,
            videoBitRateThreshold: 1000,
            conditionCountForNotificationThreshold: 8
        }, _.get(publishScreenOptions, ['monitor', 'options'], {})));

        return this.publish(publishScreenOptions, callback);
    };

    PCastExpress.prototype.subscribe = function subscribe(options, callback) {
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');
        assert.isStringNotEmpty(options.streamId, 'options.streamId');
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

        if (options.streamToken) {
            assert.isStringNotEmpty(options.streamToken, 'options.streamToken');
        }

        var that = this;

        this.waitForOnline(function() {
            if (options.streamToken) {
                return subscribeToStream.call(that, options.streamToken, options, callback);
            }

            that._adminAPI.createStreamTokenForSubscribing(that._pcast.getProtocol().getSessionId(), options.capabilities, options.streamId, null, function(error, response) {
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

    PCastExpress.prototype.subscribeToScreen = function publish(options, callback) {
        var subscribeToScreenOptions = _.assign({}, options);

        _.set(subscribeToScreenOptions, ['monitor', 'options'], _.assign({}, {
            monitorFrameRate: false,
            videoBitRateThreshold: 1000,
            conditionCountForNotificationThreshold: 8
        }, _.get(subscribeToScreenOptions, ['monitor', 'options'], {})));

        return this.subscribe(subscribeToScreenOptions, callback);
    };

    PCastExpress.prototype.waitForOnline = function waitForOnline(callback) {
        assert.isFunction(callback, 'callback');

        if (this._pcast.getStatus() === 'online') {
            return callback();
        }

        var subscription = this._pcast.getObservableStatus().subscribe(function(status) {
            if (status !== 'online') {
                return;
            }

            subscription.dispose();

            return callback();
        });
    };

    function instantiatePCast() {
        var that = this;

        if (this._authToken) {
            return this._pcast.start(this._authToken,
                function authenticationCallback(pcast, status, sessionId) {
                    handlePCastInstantiated.call(that, null, {
                        status: status,
                        sessionId: sessionId
                    });
                },
                function onlineCallback() {
                    handlePCastInstantiated.call(that, null, {status: 'ok'});
                }, function offlineCallback() {
                    handlePCastInstantiated.call(that, null, {status: 'offline'});
                });
        }

        this._adminAPI.createAuthenticationToken(function(error, response) {
            if (error) {
                return handlePCastInstantiated.call(that, error);
            }

            if (response.status !== 'ok') {
                return handlePCastInstantiated.call(that, null, response);
            }

            that._pcast.start(response.authenticationToken,
                function authenticationToken(pcast, status, sessionId) {
                    handlePCastInstantiated.call(that, null, {
                        status: status,
                        sessionId: sessionId
                    });
                },
                function onlineCallback() {
                    handlePCastInstantiated.call(that, null, {status: 'ok'});
                }, function offlineCallback() {
                    handlePCastInstantiated.call(that, null, {status: 'offline'});
                });
        });
    }

    function handlePCastInstantiated(error, response) {
        if (error) {
            return handleError.call(this, error);
        }

        var that = this;

        if (response && response.status !== 'ok' && response.status !== 'offline') {
            that._reauthCount++;

            switch (response.status) {
            case 'unauthorized':
                delete this._authToken;

                if (that._reauthCount > 1) {
                    return handleError.call(this, new Error(response.status));
                }

                that._logger.info('[Express] Attempting to create new authToken and re-connect after [%s] response', unauthorizedStatus);

                return instantiatePCast.call(that);
            case 'capacity':
            case 'network-unavailable':
                return setTimeout(function () {
                    instantiatePCast.call(that);
                }, capacityBackoffTimeout * that._reauthCount * that._reauthCount);
            case 'failed':
            default:
                return handleError.call(this, new Error(response.status));
            }
        }

        this._reauthCount = 0;

        if (!that._isInstantiated) {
            that._logger.info('Express API successfully instantiated');
        }

        that._isInstantiated = true;
    }

    function handleError(e) {
        if (!this._onError) {
            throw e;
        }

        this._onError(e);
    }

    function getStreamingTokenAndPublish(userMediaOrUri, options, cleanUpUserMediaOnStop, callback) {
        var that = this;

        assert.isArray(options.capabilities, 'options.capabilities');

        if (options.streamToken) {
            return publishUserMediaOrUri.call(that, options.streamToken, userMediaOrUri, options, cleanUpUserMediaOnStop, callback);
        }

        that._adminAPI.createStreamTokenForPublishing(that._pcast.getProtocol().getSessionId(), options.capabilities, function(error, response) {
            if (error) {
                return callback(error);
            }

            if (response.status !== 'ok') {
                return callback(null, response);
            }

            publishUserMediaOrUri.call(that, response.streamToken, userMediaOrUri, options, cleanUpUserMediaOnStop, callback);
        }, 1);
    }

    function publishUserMediaOrUri(streamToken, userMediaOrUri, options, cleanUpUserMediaOnStop, callback) {
        var that = this;
        var hasAlreadyAttachedMedia = false;

        if (options.tags) {
            assert.isArray(options.tags, 'options.tags');
        }

        if (options.connectOptions) {
            assert.isArray(options.connectOptions, 'options.connectOptions');
        }

        var publishCallback = function publishCallback(pcast, status, publisher) {
            var retryPublisher = function retryPublisher(reason) {
                var placeholder = _.uniqueId();

                that._publishers[placeholder] = true;
                publisher.stop(reason, true);

                publishUserMediaOrUri.call(that, streamToken, userMediaOrUri, options, cleanUpUserMediaOnStop, callback);

                delete that._publishers[placeholder];
            };

            if (status === unauthorizedStatus && options.streamToken) {
                that._logger.info('[Express] Attempting to create new streamToken and re-publish after [%s] response', unauthorizedStatus);

                var reAuthOptions = _.assign({}, options);

                delete reAuthOptions.streamToken;

                return getStreamingTokenAndPublish.call(that, userMediaOrUri, reAuthOptions, cleanUpUserMediaOnStop, callback);
            }

            if (status !== 'ok') {
                return callback(null, {status: status});
            }

            that._publishers[publisher.getStreamId()] = publisher;

            if (options.videoElement && !hasAlreadyAttachedMedia) {
                rtc.attachMediaStream(options.videoElement, userMediaOrUri);

                hasAlreadyAttachedMedia = true;
            }

            var isPublisher = true;
            var noopCallback = function() {};
            var publisherEndedCallback = _.bind(onPublisherOrStreamEnd, that, noopCallback, retryPublisher, isPublisher);

            if (options.monitor) {
                var monitorCallback = _.bind(onMonitorCallback, that, options.monitor.callback, retryPublisher);

                publisher.monitor(options.monitor.options || {}, monitorCallback);

                publisherEndedCallback = _.bind(onPublisherOrStreamEnd, that, options.monitor.callback, retryPublisher, isPublisher);
            }

            publisher.setPublisherEndedCallback(publisherEndedCallback);

            var expressPublisher = createExpressPublisher.call(that, publisher, options.videoElement, cleanUpUserMediaOnStop);

            callback(null, {
                status: 'ok',
                publisher: expressPublisher
            });
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

            if (status === unauthorizedStatus && options.streamToken) {
                that._logger.info('[%s] [Express] Attempting to create new streamToken and re-subscribe after [%s] response', options.streamId, unauthorizedStatus);

                var reAuthOptions = _.assign({}, options);

                delete reAuthOptions.streamToken;

                return that.subscribe(reAuthOptions, callback);
            }

            if (status === 'streaming-not-ready') {
                return callback(null, {
                    status: status,
                    retry: _.bind(retrySubscriber, that, status)
                });
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

            var isPublisher = false;
            var noopCallback = function() {};
            var subscriberEndedCallback = _.bind(onPublisherOrStreamEnd, that, noopCallback, retrySubscriber, isPublisher);

            if (options.monitor) {
                var monitorCallback = _.bind(onMonitorCallback, that, options.monitor.callback, retrySubscriber);

                subscriber.monitor(options.monitor.options || {}, monitorCallback);

                subscriberEndedCallback = _.bind(onPublisherOrStreamEnd, that, options.monitor.callback, retrySubscriber, isPublisher);
            }

            subscriber.setStreamEndedCallback(subscriberEndedCallback);

            var expressSubscriber = createExpressSubscriber.call(that, subscriber, renderer);
            var subscribeResponse = {
                status: 'ok',
                mediaStream: expressSubscriber
            };

            subscriber.setStreamErrorCallback(function(playerRenderer, errorType, error) {
                if (errorType === 'shaka' && error.severity !== shakaEnums.errorSeverity.critical.id) {
                    return; // Ignore error
                }

                that._logger.warn('[%s] Error while playing stream with Express API. Stopping stream.', expressSubscriber.getStreamId(), error);

                expressSubscriber.stop();

                return callback(error);
            });

            if (renderer) {
                subscribeResponse.renderer = renderer;
            }

            callback(null, subscribeResponse);
        });
    }

    function createExpressPublisher(publisher, videoElement, cleanUpUserMediaOnStop) {
        var publisherStop = publisher.stop;

        publisher.stop = function(reason, isInternal) {
            publisherStop(reason);

            if (videoElement) {
                videoElement.src = '';
                videoElement.srcObject = null;
            }

            if (cleanUpUserMediaOnStop && publisher.getStream() && !isInternal) {
                var nativeMediaStream = publisher.getStream();

                if (nativeMediaStream) {
                    nativeMediaStream.getTracks().forEach(function(track) {
                        track.stop();
                    });
                }
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

        // Publisher Ended Callback handled with normal callback route for express
        publisher.setPublisherEndedCallback = function() {};

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

        // Stream Ended Callback handled with normal callback route for express
        subscriber.setStreamEndedCallback = function() {};

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
        });
    }

    function onMonitorCallback(callback, retry, stream, reason, description) { // eslint-disable-line no-unused-vars
        switch (reason) {
        case 'client-side-failure':
            callback(null, {
                status: reason,
                retry: _.bind(retry, null, reason)
            });

            // Handle failure event, redo stream
            break;
        default:
            // No failure has occurred, handle monitor event
            break;
        }
    }

    function onPublisherOrStreamEnd(monitorCallback, retry, isPublisher, publisherOrStream, reason, description) {
        var response = {
            status: 'stream-ended',
            reason: reason,
            description: description
        };

        switch (reason) {
        case 'ended': // Normal operation
        case 'censored': // Forced to stop
            var endedResponse = {
                status: reason,
                reason: reason,
                description: description
            };

            if (isPublisher) {
                endedResponse.publisher = publisherOrStream;
            } else {
                endedResponse.mediaStream = publisherOrStream;
            }

            return monitorCallback(null, endedResponse);
        case 'custom':
            // Client ended publisher, do nothing
            return monitorCallback(null, response);
        case 'capacity':
            // Don't inform the client, attempt to re-publish automatically after backoff
            return setTimeout(function() {
                return retry(reason);
            }, capacityBackoffTimeout);
        case 'failed':
        case 'maintenance':
            // Don't inform the client, attempt to re-publish automatically
            return retry(reason);
        case 'app-background':
        default:
            // Give client option to re-publish
            response.retry = retry;

            return monitorCallback(null, response);
        }
    }

    return PCastExpress;
});