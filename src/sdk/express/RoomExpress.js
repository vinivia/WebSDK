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
    './PCastExpress',
    '../room/RoomService',
    '../room/room.json',
    '../room/member.json',
    '../room/stream.json',
    '../room/track.json'
], function (_, assert, AdminAPI, PCastExpress, RoomService, roomEnums, memberEnums, streamEnums, trackEnums) {
    'use strict';

    var defaultStreamWildcardTokenRefreshInterval = 300000;
    var defaultWildcardEnabled = true;

    function RoomExpress(options) {
        assert.isObject(options, 'options');

        if (options.pcastExpress) {
            assert.isObject(options.pcastExpress, 'options.pcastExpress');
        } else {
            assert.isStringNotEmpty(options.backendUri, 'options.backendUri');
            assert.isObject(options.authenticationData, 'options.authenticationData');
        }

        this._pcastExpress = options.pcastExpress || new PCastExpress(options);
        this._shouldDisposeOfPCastExpress = !options.pcastExpress;
        this._roomServices = {};
        this._activeRoomServices = [];
        this._membersSubscriptions = {};
        this._logger = this._pcastExpress.getPCast().getLogger();
    }

    RoomExpress.prototype.dispose = function dispose() {
        if (_.values(this._roomServices).length) {
            _.forOwn(this._roomServices, function (roomService) {
                roomService.stop();
            });

            this._roomServices = {};
        }

        if (this._shouldDisposeOfPCastExpress) {
            this._pcastExpress.dispose();
        }
    };

    RoomExpress.prototype.getPCastExpress = function getPCastExpress() {
        return this._pcastExpress;
    };

    RoomExpress.prototype.createRoom = function createRoom(options, callback) {
        assert.isFunction(callback, 'callback');
        assert.isObject(options.room, 'options.room');
        assert.isStringNotEmpty(options.room.name, 'options.room.name');
        assert.isStringNotEmpty(options.room.type, 'options.room.type');

        if (options.room.description) {
            assert.isStringNotEmpty(options.room.description, 'options.room.description');
        }

        var that = this;
        var roomDescription = options.room.description || getDefaultRoomDescription(options.room.type);

        createRoomService.call(this, null, null, function(error, roomServiceResponse) {
            if (error) {
                return callback(error);
            }

            if (roomServiceResponse.status !== 'ok') {
                return callback(null, roomServiceResponse);
            }

            var roomService = roomServiceResponse.roomService;
            var roomToCreate = _.assign({}, options.room);

            if (!roomToCreate.description) {
                roomToCreate.description = roomDescription;
            }

            roomService.createRoom(roomToCreate, function (error, roomResponse) {
                if (error) {
                    roomService.stop();

                    return callback(error);
                }

                if (roomResponse.status !== 'already-exists' && roomResponse.status !== 'ok') {
                    roomService.stop();
                }

                // Use cached roomService or returned roomService
                roomResponse.roomService = findActiveRoom.call(that, roomResponse.room.getRoomId(), null) || roomService;

                return callback(null, roomResponse);
            });
        });
    };

    RoomExpress.prototype.createChannel = function createChannel(options, callback) {
        assert.isObject(options, 'options');
        assert.isObject(options.room, 'options.room');

        var createRoomOptions = _.assign({}, options);

        createRoomOptions.room.type = roomEnums.types.channel.name;

        this.createRoom(createRoomOptions, callback);
    };

    RoomExpress.prototype.joinRoom = function joinRoom(options, joinRoomCallback, membersChangedCallback) {
        assert.isObject(options, 'options');
        assert.isFunction(joinRoomCallback, 'joinRoomCallback');
        assert.isFunction(membersChangedCallback, 'membersChangedCallback');
        assert.isStringNotEmpty(options.role, 'options.role');

        if (options.screenName) {
            assert.isStringNotEmpty(options.screenName, 'options.screenName');
        }

        if (options.roomId) {
            assert.isStringNotEmpty(options.roomId, 'options.roomId');
        }

        if (options.alias) {
            assert.isStringNotEmpty(options.alias, 'options.alias');
        }

        if (options.streams) {
            assert.isArray(options.streams, 'options.streams');
        }

        var that = this;
        var role = options.role;
        var screenName = options.screenName || _.uniqueId();

        createRoomService.call(this, options.roomId, options.alias, function(error, roomServiceResponse) {
            if (error) {
                return joinRoomCallback(error);
            }

            if (roomServiceResponse.status !== 'ok') {
                return joinRoomCallback(null, roomServiceResponse);
            }

            var roomService = roomServiceResponse.roomService;
            var activeRoom = roomService.getObservableActiveRoom().getValue();

            if (!activeRoom) {
                roomService.start(role, screenName);
            }

            if (options.streams) {
                updateSelf.call(that, options, roomService, joinRoomCallback);
            }

            if (activeRoom) {
                if (that._membersSubscriptions[activeRoom.getRoomId()]) {
                    return;
                }

                return that._membersSubscriptions[activeRoom.getRoomId()] = activeRoom.getObservableMembers().subscribe(membersChangedCallback, {initial: 'notify'});
            }

            roomService.enterRoom(options.roomId, options.alias, function(error, roomResponse) {
                if (error) {
                    roomService.stop();

                    return joinRoomCallback(error);
                }

                if (roomResponse.status === 'not-found') {
                    roomService.stop();

                    return joinRoomCallback(null, {status: 'room-not-found'});
                }

                if (roomResponse.status !== 'ok') {
                    roomService.stop();

                    return joinRoomCallback(null, roomResponse);
                }

                var room = roomResponse.room;
                var roomServiceLeaveRoom = roomService.leaveRoom;

                that._activeRoomServices.push(roomService);

                roomService.leaveRoom = function leaveRoom(callback) {
                    roomServiceLeaveRoom.call(roomService, function(error, response) {
                        if (error) {
                            roomService.stop();

                            return callback(error);
                        }

                        if (response.status !== 'ok') {
                            return callback(null, response);
                        }

                        if (that._membersSubscriptions[room.getRoomId()]) {
                            that._membersSubscriptions[room.getRoomId()].dispose();

                            delete that._membersSubscriptions[room.getRoomId()];
                        }

                        roomService.stop();
                    });
                };

                joinRoomCallback(null, {
                    status: 'ok',
                    roomService: roomService
                });

                that._membersSubscriptions[room.getRoomId()] = room.getObservableMembers().subscribe(membersChangedCallback, {initial: 'notify'});
            });
        });
    };

    RoomExpress.prototype.joinChannel = function joinChannel(options, joinChannelCallback, subscriberCallback) {
        assert.isObject(options, 'options');
        assert.isFunction(joinChannelCallback, 'joinChannelCallback');
        assert.isFunction(subscriberCallback, 'subscriberCallback');

        if (options.videoElement) {
            assert.isObject(options.videoElement, 'options.videoElement');
        }

        var channelOptions = _.assign({
            type: roomEnums.types.channel.name,
            role: memberEnums.roles.audience.name
        }, options);
        var lastMediaStream;
        var lastStreamId;
        var that = this;

        var joinRoomCallback = function(error, response) {
            var channelResponse = !response || _.assign({}, response);

            if (response && response.roomService) {
                var leaveRoom = response.roomService.leaveRoom;

                channelResponse.roomService.leaveRoom = function(callback) {
                    if (lastMediaStream) {
                        lastMediaStream.stop();
                    }

                    leaveRoom(callback);
                };
            }

            joinChannelCallback(error, channelResponse);
        };

        this.joinRoom(channelOptions, joinRoomCallback, function membersChangedCallback(members) {
            var presenters = _.filter(members, function(member) {
                return member.getObservableRole().getValue() === memberEnums.roles.presenter.name;
            });
            var mostRecentPresenter = _.reduce(presenters, function(presenterA, presenterB) {
                if (!presenterA) {
                    return presenterB;
                }

                return presenterA.getLastUpdate() > presenterB.getLastUpdate() ? presenterA : presenterB;
            });

            if (!mostRecentPresenter) {
                return subscriberCallback(null, {status: 'no-stream-playing'});
            }

            var presenterStream = mostRecentPresenter.getObservableStreams().getValue()[0];

            if (!presenterStream) {
                return subscriberCallback(null, {status: 'no-stream-playing'});
            }

            if (!checkifStreamingIsAvailable(presenterStream.getUri()) && _.includes(options.capabilities, 'streaming')) {
                return subscriberCallback(null, {status: 'streaming-not-available'});
            }

            var streamId = parseStreamIdFromStreamUri(presenterStream.getUri());
            var streamToken = parseStreamTokenFromStreamUri(presenterStream.getUri(), options.capabilities);

            if (!streamId) {
                return subscriberCallback(null, {status: 'no-stream-playing'});
            }

            if (streamId === lastStreamId) {
                return;
            } else if (lastStreamId) {
                lastMediaStream.stop();
            }

            var subscribeOptions = {
                capabilities: options.capabilities,
                videoElement: options.videoElement,
                streamId: streamId,
                monitor: {
                    callback: _.bind(monitorSubsciberOrPublisher, that, subscriberCallback),
                    options: {conditionCountForNotificationThreshold: 8}
                },
                streamToken: streamToken
            };

            var successReason = lastStreamId ? 'stream-override' : 'stream-started';

            lastStreamId = streamId;

            var mediaStreamCallback = function mediaStreamCallback(error, response) {
                if (response && response.mediaStream) {
                    lastMediaStream = response.mediaStream;
                } else {
                    lastStreamId = null;
                    lastMediaStream = null;
                }

                subscriberCallback(error, response);
            };

            subscribeToMemberStream.call(that, subscribeOptions, mediaStreamCallback, successReason);
        });
    };

    RoomExpress.prototype.publishToRoom = function publishToRoom(options, callback) {
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');
        assert.isObject(options.room, 'options.room');

        if (options.streamUri) {
            assert.isStringNotEmpty(options.streamUri, 'options.streamUri');
        } else if (options.mediaConstraints) {
            assert.isObject(options.mediaConstraints, 'options.mediaConstraints');
        } else {
            assert.isObject(options.userMediaStream, 'options.userMediaStream');
        }

        if (options.videoElement) {
            assert.isObject(options.videoElement, 'options.videoElement');
        }

        if (options.screenName) {
            assert.isStringNotEmpty(options.screenName, 'options.screenName');
        }

        if (options.capabilities) {
            assert.isArray(options.capabilities, 'options.capabilities');
        }

        if (options.tags) {
            assert.isArray(options.tags, 'options.tags');
        }

        if (_.isUndefined(options.enableWildcardCapability)) {
            options.enableWildcardCapability = defaultWildcardEnabled;
        }

        assert.isBoolean(options.enableWildcardCapability, 'options.enableWildcardCapability');

        var that = this;
        var role = memberEnums.roles.audience.name;
        var screenName = options.screenName || _.uniqueId();

        this.createRoom(options, function(error, createRoomResponse) {
            if (error) {
                return callback(error);
            }

            if (createRoomResponse.status !== 'ok' && createRoomResponse.status !== 'already-exists') {
                return callback(null, createRoomResponse);
            }

            var roomService = createRoomResponse.roomService;
            var room = createRoomResponse.room;

            roomService.start(role, screenName);

            var publishOptions = _.assign({
                monitor: {
                    callback: _.bind(monitorSubsciberOrPublisher, that, callback),
                    options: {conditionCountForNotificationThreshold: 8}
                }
            }, options);

            if (options.streamUri) {
                var remoteOptions = _.assign({connectOptions: []}, publishOptions);
                var hasRoomConnectOptions = _.find(remoteOptions.connectOptions, function(option) {
                    return _.startsWith(option, 'room-id');
                });

                if (!hasRoomConnectOptions) {
                    remoteOptions.connectOptions = remoteOptions.connectOptions.concat([
                        'room-id=' + room.getRoomId(),
                        'member-role=Presenter',
                        'member-stream-type=Presentation',
                        'screen-name=' + screenName
                    ]);
                }

                if (options.enableWildcardCapability) {
                    remoteOptions.connectOptions.concat([
                        'member-stream-token-type=Wildcard',
                        'member-stream-token-refresh-interval=' + defaultStreamWildcardTokenRefreshInterval
                    ]);
                }

                return that._pcastExpress.publishRemote(remoteOptions, callback);
            }

            publishToRoomAndJoinAsMember.call(that, publishOptions, room, callback);
        });
    };

    RoomExpress.prototype.publishToChannel = function publishToChannel(options, callback) {
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');

        var channelOptions = _.assign({}, options);

        options.room.type = roomEnums.types.channel.name;

        this.publishToRoom(channelOptions, callback);
    };

    function createRoomService(roomId, alias, callback) {
        var that = this;
        var uniqueId = _.uniqueId();

        var activeRoomService = findActiveRoom.call(this, roomId, alias);

        if (activeRoomService) {
            return callback(null, {
                status: 'ok',
                roomService: activeRoomService
            });
        }

        this._pcastExpress.waitForOnline(function() {
            that._roomServices[uniqueId] = new RoomService(that._pcastExpress.getPCast());

            var expressRoomService = createExpressRoomService.call(that, that._roomServices[uniqueId], uniqueId);

            callback(null, {
                status: 'ok',
                roomService: expressRoomService
            });
        });
    }

    function findActiveRoom(roomId, alias) {
        return _.find(this._activeRoomServices, function(roomService) {
            var activeRoom = roomService.getObservableActiveRoom().getValue();

            return activeRoom && (activeRoom.getRoomId() === roomId || activeRoom.getObservableAlias().getValue() === alias);
        });
    }

    function createExpressRoomService(roomService, uniqueId) {
        var that = this;
        var roomServiceStop = roomService.stop;

        roomService.stop = function() {
            roomServiceStop.call(roomService);

            delete that._roomServices[uniqueId];
        };

        return roomService;
    }

    function subscribeToMemberStream(subscribeOptions, callback, successReason) {
        var that = this;

        var count = 0;

        that._pcastExpress.subscribe(subscribeOptions, function(error, response) {
            if (error) {
                return callback(error);
            }

            if (response.status !== 'ok' && response.status !== 'streaming-not-ready') {
                return callback(null, response);
            }

            count++;

            if (response.status === 'streaming-not-ready' && count < 3) {
                return setTimeout(response.retry, count * count * 1000);
            } else if (response.status === 'streaming-not-ready' && count >= 3) {
                return callback(null, {status: response.status});
            }

            var subscribeResponse = _.assign({}, response, {
                status: 'ok',
                reason: successReason
            });

            if (count > 1) {
                subscribeResponse.reason = 'stream-failure-recovered';

                return callback(null, subscribeResponse);
            }

            callback(null, subscribeResponse);
        });
    }

    function publishToRoomAndJoinAsMember(options, room, callback) {
        var that = this;
        var publisher;
        var refreshTokenTimeout;

        this._pcastExpress.publish(options, function(error, response) {
            if (refreshTokenTimeout && publisher) {
                clearInterval(refreshTokenTimeout);
            }

            if (error) {
                return callback(error);
            }

            if (response.status !== 'ok') {
                return callback(null, response);
            }

            publisher = response.publisher;

            var publisherStop = _.bind(publisher.stop, publisher);

            publisher.stop = function() {
                clearInterval(refreshTokenTimeout);
                publisherStop();
            };

            if (options.enableWildcardCapability) {
                refreshTokenTimeout = setInterval(function() {
                    createViewerStreamTokenAndJoinRoom.call(that, options, publisher, room, callback);
                }, defaultStreamWildcardTokenRefreshInterval);
            }

            createViewerStreamTokenAndJoinRoom.call(that, options, response.publisher, room, callback);
        });
    }

    function createViewerStreamTokenAndJoinRoom(options, publisher, room, callback) {
        var that = this;

        if (!options.enableWildcardCapability) {
            var joinRoomOptions = _.assign({}, options, {
                roomId: room.getRoomId(),
                streams: [mapStreamToMemberStream(publisher, streamEnums.types.presentation.name)],
                role: memberEnums.roles.presenter.name
            });

            return joinRoomAndIgnoreMemberChanges.call(that, joinRoomOptions, callback, publisher);
        }

        this._pcastExpress.getAdminAPI().createStreamTokenForSubscribing('*', [], publisher.getStreamId(), function(error, createStreamTokenResponse) {
            if (error) {
                return callback(error);
            }

            if (createStreamTokenResponse.status !== 'ok') {
                return callback(null, createStreamTokenResponse);
            }

            if (_.includes(options.capabilities, 'streaming')) {
                return that._pcastExpress.getAdminAPI().createStreamTokenForSubscribing('*', ['streaming'], publisher.getStreamId(), function(error, createStreamTokenWithStreamingResponse) {
                    if (error) {
                        return callback(error);
                    }

                    if (createStreamTokenResponse.status !== 'ok') {
                        return callback(null, createStreamTokenResponse);
                    }

                    var joinRoomOptions = _.assign({}, options, {
                        roomId: room.getRoomId(),
                        streams: [mapStreamToMemberStream(publisher, streamEnums.types.presentation.name, createStreamTokenResponse.streamToken, createStreamTokenWithStreamingResponse.streamToken)],
                        role: memberEnums.roles.presenter.name
                    });

                    joinRoomAndIgnoreMemberChanges.call(that, joinRoomOptions, callback, publisher);
                });
            }

            var joinRoomOptions = _.assign({}, options, {
                roomId: room.getRoomId(),
                streams: [mapStreamToMemberStream(publisher, streamEnums.types.presentation.name, createStreamTokenResponse.streamToken)],
                role: memberEnums.roles.presenter.name
            });

            joinRoomAndIgnoreMemberChanges.call(that, joinRoomOptions, callback, publisher);
        });
    }

    function joinRoomAndIgnoreMemberChanges(joinRoomOptions, callback, publisher) {
        var responseObject = {publisher: publisher};
        var publisherStop;

        this.joinRoom(joinRoomOptions, function(error, response) {
            if (error) {
                return callback(error);
            }

            if (response.roomService && !publisherStop) {
                publisherStop = _.bind(publisher.stop, publisher);

                publisher.stop = function() {
                    response.roomService.leaveRoom(function() {});

                    publisherStop();
                };
            }

            if (response) {
                return callback(null, _.assign({}, responseObject, response));
            }
        }, function() {});
    }

    function updateSelf(options, roomService, callback) {
        var activeRoom = roomService.getObservableActiveRoom().getValue();
        var updateSelfErrors = 0;
        var that = this;

        if (options.streams) {
            var self = roomService.getSelf();

            self.setStreams(options.streams);
        }

        if (activeRoom) {
            roomService.updateSelf(function handleUpdateSelf(error, response) {
                if (error) {
                    updateSelfErrors++;
                }

                if (response && response.status === 'conflict') {
                    return roomService.updateSelf(handleUpdateSelf);
                }

                if (response && response.status !== 'ok') {
                    updateSelfErrors++;
                }

                if (response && response.status === 'ok') {
                    updateSelfErrors = 0;
                }

                if (updateSelfErrors > 3) {
                    that._logger.warn('Unable to update self after 3 attempts.');

                    return callback(new Error('Unable to update self'));
                }

                if (updateSelfErrors > 0 && updateSelfErrors < 3) {
                    that._logger.warn('Unable to update self after [%s] attempts. Retrying.', updateSelfErrors);

                    return roomService.updateSelf(handleUpdateSelf);
                }
            });
        }
    }

    function monitorSubsciberOrPublisher(callback, error, response) {
        if (error) {
            return callback(error);
        }

        if (response.retry) {
            return response.retry();
        }

        callback(error, response);
    }

    function getDefaultRoomDescription(type) {
        switch(type) {
        case roomEnums.types.channel.name:
            return 'Room Channel';
        case roomEnums.types.moderatedChat.name:
            return 'Moderated Chat';
        case roomEnums.types.multiPartyChat.name:
            return 'Multi Party Chat';
        case roomEnums.types.townHall.name:
            return 'Town Hall';
        case roomEnums.types.directChat.name:
            return 'Direct Chat';
        default:
            throw new Error('Unsupported Room Type');
        }
    }

    var pcastStreamPrefix = 'pcast://phenixp2p.com/';

    function parseStreamIdFromStreamUri(uri) {
        var hasPrefix = _.includes(uri, pcastStreamPrefix);

        if (!hasPrefix) {
            return null;
        }

        return uri.replace(pcastStreamPrefix, '').split('?')[0];
    }

    function checkifStreamingIsAvailable(uri) {
        var queryParamString = uri.split('?');
        var deferToCreateToken = true;

        if (queryParamString.length !== 2) {
            return deferToCreateToken;
        }

        var queryParamsString = queryParamString[1];

        return _.includes(queryParamsString, 'streamTokenStreaming');
    }

    function parseStreamTokenFromStreamUri(uri, capabilities) {
        var queryParamString = uri.split('?');
        var streamToken = '';

        if (queryParamString.length !== 2) {
            return streamToken;
        }

        var queryParamsString = queryParamString[1];
        var queryParams = queryParamsString.split('&');

        _.forEach(queryParams, function(param) {
            var key = param.split('=')[0];

            if (key === 'streamToken' && !_.includes(capabilities, 'streaming')) {
                streamToken = param.split('=')[1];
            }

            if (key === 'streamTokenStreaming' && _.includes(capabilities, 'streaming')) {
                streamToken = param.split('=')[1];
            }
        });

        return streamToken;
    }

    function addOrUpdatePublishedStreams(self, publisher, type, viewerStreamToken) { // eslint-disable-line no-unused-vars
        var streams = self.getStreams();
        var publishedStream = _.find(streams, function(stream) {
            return parseStreamIdFromStreamUri(stream.uri) === publisher.getStreamId();
        });
        var shouldAppendStream = !publishedStream;

        publishedStream = _.assign(publishedStream || {}, mapStreamToMemberStream(publisher, type, viewerStreamToken));

        if (shouldAppendStream) {
            streams.push(publishedStream);
        }

        self.setStreams(streams);
    }

    function mapStreamToMemberStream(publisher, type, viewerStreamToken, viewerStreamTokenStreaming) {
        var mediaStream = publisher.getStream();
        var audioTracks = mediaStream ? mediaStream.getAudioTracks() : null;
        var videoTracks = mediaStream ? mediaStream.getVideoTracks() : null;
        var audioTrackEnabled = audioTracks.length > 0 && audioTracks[0].enabled;
        var videoTrackEnabled = videoTracks.length > 0 && videoTracks[0].enabled;

        var publishedStream = {
            uri: 'pcast://phenixp2p.com/' + publisher.getStreamId(),
            type: type,
            audioState: audioTrackEnabled ? trackEnums.states.trackEnabled.name : trackEnums.states.trackDisabled.name,
            videoState: videoTrackEnabled ? trackEnums.states.trackEnabled.name : trackEnums.states.trackDisabled.name
        };

        if (viewerStreamToken) {
            publishedStream.uri = publishedStream.uri + '?streamToken=' + viewerStreamToken;
        }

        if (viewerStreamTokenStreaming) {
            publishedStream.uri = publishedStream.uri + '&streamTokenStreaming=' + viewerStreamTokenStreaming;
        }

        return publishedStream;
    }

    return RoomExpress;
});