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
        this._roomServicePublishers = {};
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
        assert.isStringNotEmpty(options.role, 'options.role');

        if (membersChangedCallback) {
            assert.isFunction(membersChangedCallback, 'membersChangedCallback');
        }

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
                updateSelf.call(that, options, roomService, function (error) {
                    if (error) {
                        return joinRoomCallback(error);
                    }
                });
            }

            if (activeRoom && membersChangedCallback) {
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

        assert.isValidType(options.streamType, streamEnums.types, 'options.streamType');
        assert.isValidType(options.memberRole, memberEnums.roles, 'options.memberRole');
        assert.isBoolean(options.enableWildcardCapability, 'options.enableWildcardCapability');

        var that = this;
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
            var activeRoom = roomService.getObservableActiveRoom().getValue();

            if (!activeRoom) {
                roomService.start(options.memberRole, screenName);
            }

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
                        'member-role=' + options.memberRole,
                        'member-stream-type=' + options.streamType,
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

    RoomExpress.prototype.publishScreenToRoom = function publishScreenToRoom(options, callback) {
        var publishScreenOptions = _.assign({}, options, {mediaConstraints: {screen: true}});

        this.publishToRoom(publishScreenOptions, callback);
    };

    RoomExpress.prototype.publishToChannel = function publishToChannel(options, callback) {
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');

        var channelOptions = _.assign({
            memberRole: memberEnums.roles.presenter.name,
            streamType: streamEnums.types.presentation.name
        }, options);

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

        var handlePublish = function(error, response) {
            if (refreshTokenTimeout && publisher) {
                clearInterval(refreshTokenTimeout);
            }

            if (error) {
                return callback(error);
            }

            if (response.status !== 'ok') {
                return callback(null, response);
            }

            addPublisher.call(that, response.publisher, room);
            removePublisher.call(that, publisher, room);

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
        };

        if (_.get(options, ['mediaConstraints', 'screen'], false)) {
            return this._pcastExpress.publishScreen(options, handlePublish);
        }

        this._pcastExpress.publish(options, handlePublish);
    }

    function addPublisher(publisher, room) {
        if (!this._roomServicePublishers[room.getRoomId()]) {
            this._roomServicePublishers[room.getRoomId()] = [];
        }

        this._roomServicePublishers[room.getRoomId()].push(publisher);
    }

    function removePublisher(publisher, room) {
        if (!this._roomServicePublishers[room.getRoomId()] || !publisher) {
            return;
        }

        this._roomServicePublishers[room.getRoomId()] = _.filter(this._roomServicePublishers[room.getRoomId()], function(roomPublisher) {
            return roomPublisher.getStreamId() !== publisher.getStreamId();
        });
    }

    function createViewerStreamTokenAndJoinRoom(options, publisher, room, callback) {
        var that = this;
        var realtimeCapabilities = [];
        var streamType = options.streamType;
        var memberRole = options.memberRole;

        if (!options.enableWildcardCapability) {
            var publisherStream = mapStreamToMemberStream(publisher, streamType);
            var joinRoomOptions = _.assign({}, options, {
                roomId: room.getRoomId(),
                streams: mapNewPublisherStreamToMemberStreams.call(that, publisherStream, room),
                role: memberRole
            });

            return joinRoomAndIgnoreMemberChanges.call(that, joinRoomOptions, callback, publisher, room);
        }

        if (_.includes(options.capabilities, 'prefer-h264')) {
            realtimeCapabilities.push('prefer-h264');
        }

        this._pcastExpress.getAdminAPI().createStreamTokenForSubscribing('*', realtimeCapabilities, publisher.getStreamId(), function(error, createStreamTokenResponse) {
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

                    var publisherStream = mapStreamToMemberStream(publisher, streamType, createStreamTokenResponse.streamToken, createStreamTokenWithStreamingResponse.streamToken);
                    var joinRoomOptions = _.assign({}, options, {
                        roomId: room.getRoomId(),
                        streams: mapNewPublisherStreamToMemberStreams.call(that, publisherStream, room),
                        role: memberRole
                    });

                    joinRoomAndIgnoreMemberChanges.call(that, joinRoomOptions, callback, publisher, room);
                });
            }

            var publisherStream = mapStreamToMemberStream(publisher, streamType, createStreamTokenResponse.streamToken);
            var joinRoomOptions = _.assign({}, options, {
                roomId: room.getRoomId(),
                streams: mapNewPublisherStreamToMemberStreams.call(that, publisherStream, room),
                role: memberRole
            });

            joinRoomAndIgnoreMemberChanges.call(that, joinRoomOptions, callback, publisher, room);
        });
    }

    function joinRoomAndIgnoreMemberChanges(joinRoomOptions, callback, publisher, room) {
        var responseObject = {publisher: publisher};
        var publisherStop;
        var that = this;
        var activeRoomService = findActiveRoom.call(this, room.getRoomId());
        var handleUpdate = function(error, response) {
            if (error) {
                return callback(error);
            }

            if (response.status === 'ok' && !publisherStop) {
                publisherStop = _.bind(publisher.stop, publisher);

                publisher.stop = function() {
                    removePublisher.call(that, publisher, room);

                    var streamsAfterStop = mapNewPublisherStreamToMemberStreams.call(that, null, room);
                    var joinRoomOptionsAfterStop = _.assign({}, joinRoomOptions, {streams: streamsAfterStop});
                    var roomService = findActiveRoom.call(that, room.getRoomId());

                    publisherStop();

                    if (!roomService) {
                        return;
                    }

                    if (streamsAfterStop.length === 0) {
                        return roomService.leaveRoom(function() {});
                    }

                    updateSelf.call(that, joinRoomOptionsAfterStop, roomService, function(error) {
                        if (error) {
                            return callback(error);
                        }
                    });
                };
            }

            return callback(null, _.assign({}, responseObject, response));
        };

        if (!activeRoomService) {
            return this.joinRoom(joinRoomOptions, handleUpdate, function() {});
        }

        updateSelf.call(that, joinRoomOptions, activeRoomService, handleUpdate);
    }

    function mapNewPublisherStreamToMemberStreams(publisherStream, room) {
        var activeRoomService = findActiveRoom.call(this, room.getRoomId());
        var defaultStreams = publisherStream ? [publisherStream] : [];

        if (!activeRoomService) {
            return defaultStreams;
        }

        var self = activeRoomService.getSelf();

        if (!self) {
            return defaultStreams;
        }

        var selfStreams = _.map(self.getObservableStreams().getValue(), function(selfStream) {
            return selfStream.toJson();
        });
        var publishers = this._roomServicePublishers[room.getRoomId()] || [];
        var publisherIds = _.map(publishers, function(publisher) {
            return publisher.getStreamId();
        });

        if (!selfStreams || selfStreams.length === 0) {
            return defaultStreams;
        }

        if (publisherStream) {
            selfStreams.push(publisherStream);
        }

        return _.filter(selfStreams, function(stream) {
            return _.includes(publisherIds, parseStreamIdFromStreamUri(stream.uri));
        });
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

                    return callback(null, response);
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