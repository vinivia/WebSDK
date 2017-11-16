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
    'phenix-web-disposable',
    '../AdminAPI',
    './PCastExpress',
    '../room/RoomService',
    './MemberSelector',
    '../room/Stream',
    '../room/room.json',
    '../room/member.json',
    '../room/stream.json',
    '../room/track.json'
], function (_, assert, disposable, AdminAPI, PCastExpress, RoomService, MemberSelector, Stream, roomEnums, memberEnums, streamEnums, trackEnums) {
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
        _.forOwn(this._membersSubscriptions, function (membersSubscription) {
            membersSubscription.dispose();
        });
        _.forOwn(this._roomServicePublishers, function (publisher) {
            publisher.stop();
        });
        _.forOwn(this._roomServices, function (roomService) {
            roomService.stop();
        });

        this._membersSubscriptions = {};
        this._roomServicePublishers = {};
        this._roomServices = {};
        this._activeRoomServices = [];

        if (this._shouldDisposeOfPCastExpress) {
            this._pcastExpress.dispose();
        }
    };

    RoomExpress.prototype.getPCastExpress = function getPCastExpress() {
        return this._pcastExpress;
    };

    // Responsible for creating room. Returns immutable room
    RoomExpress.prototype.createRoom = function createRoom(options, callback) {
        assert.isFunction(callback, 'callback');
        assert.isObject(options.room, 'options.room');
        assert.isStringNotEmpty(options.room.name, 'options.room.name');
        assert.isStringNotEmpty(options.room.type, 'options.room.type');

        if (options.room.description) {
            assert.isStringNotEmpty(options.room.description, 'options.room.description');
        }

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
                    return callback(error);
                }

                // Don't return room service. Not in room. Room returned is immutable
                roomService.stop();

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
                updateSelfStreams.call(that, options.streams, roomService, function (error) {
                    if (error) {
                        return joinRoomCallback(error);
                    }
                });
            }

            if (activeRoom && membersChangedCallback) {
                joinRoomCallback(null, {
                    status: 'ok',
                    roomService: roomService
                });

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

                that._activeRoomServices.push(roomService);

                joinRoomCallback(null, {
                    status: 'ok',
                    roomService: roomService
                });

                that._membersSubscriptions[room.getRoomId()] = room.getObservableMembers().subscribe(membersChangedCallback, {initial: 'notify'});
            });
        });
    };

    // TODO (dcy) Refactor channel related methods into separate class
    RoomExpress.prototype.joinChannel = function joinChannel(options, joinChannelCallback, subscriberCallback) {
        assert.isObject(options, 'options');
        assert.isFunction(joinChannelCallback, 'joinChannelCallback');
        assert.isFunction(subscriberCallback, 'subscriberCallback');

        if (options.videoElement) {
            assert.isObject(options.videoElement, 'options.videoElement');
        }

        if (options.streamSelectionStrategy) {
            assert.isStringNotEmpty(options.streamSelectionStrategy, 'options.streamSelectionStrategy');
        }

        var channelOptions = _.assign({
            type: roomEnums.types.channel.name,
            role: memberEnums.roles.audience.name
        }, options);
        var memberSelector = new MemberSelector(options.streamSelectionStrategy, this._logger);
        var lastMediaStream;
        var lastStreamId;
        var channelRoomService;
        var channelId = '';
        var that = this;

        var joinRoomCallback = function(error, response) {
            var channelResponse = !response || _.assign({}, response);

            if (response && response.roomService) {
                var leaveRoom = response.roomService.leaveRoom;
                var room = response.roomService.getObservableActiveRoom().getValue();

                channelRoomService = response.roomService;
                channelId = room ? room.getRoomId() : '';

                that._logger.info('Joined channel [%s] with [%s] selection strategy', channelId, memberSelector.getStrategy());

                channelResponse.roomService.leaveRoom = function(callback) {
                    if (lastMediaStream) {
                        lastMediaStream.stop();
                    }

                    leaveRoom(callback);
                };
            }

            joinChannelCallback(error, channelResponse);
        };

        this.joinRoom(channelOptions, joinRoomCallback, function membersChangedCallback(members, streamErrorStatus) {
            var presenters = _.filter(members, function(member) {
                return member.getObservableRole().getValue() === memberEnums.roles.presenter.name;
            });
            var forceNewMemberSelection = !!streamErrorStatus || !lastMediaStream || !lastStreamId;
            var selectedPresenter = memberSelector.getNext(presenters, forceNewMemberSelection);
            var presenterStream = selectedPresenter ? selectedPresenter.getObservableStreams().getValue()[0] : null;
            var streamId = presenterStream ? presenterStream.getPCastStreamId() : '';

            if (!selectedPresenter || !presenterStream) {
                if (presenters.length === 0) {
                    return subscriberCallback(null, {status: 'no-stream-playing'});
                }

                if (streamErrorStatus) {
                    that._logger.info('Unable to find a new presenter to replace stream [%s] that ended in channel [%s] with status [%s] and [%s] black-listed members',
                        lastStreamId, channelId, streamErrorStatus, memberSelector.getNumberOfBlackListedMembers());

                    return subscriberCallback(null, {status: streamErrorStatus || 'unable-to-recover'});
                }

                return subscriberCallback(null, {status: 'no-stream-playing'});
            }

            if (!checkifStreamingIsAvailable(presenterStream.getUri()) && _.includes(options.capabilities, 'streaming')) {
                return subscriberCallback(null, {status: 'streaming-not-available'});
            }

            if (!streamId) {
                that._logger.info('Channel [%s] presenter has no stream', channelId);

                return subscriberCallback(null, {status: 'no-stream-playing'});
            }

            if (streamId === lastStreamId) {
                if (streamErrorStatus) {
                    that._logger.info('Unable to find a new presenter to replace stream [%s] that ended in channel [%s] with status [%s]',
                        lastStreamId, channelId, streamErrorStatus);

                    return subscriberCallback(null, {status: streamErrorStatus || 'unable-to-recover'});
                }

                return;
            } else if (lastStreamId) {
                lastMediaStream.stop();
            }

            var tryNextMember = function(streamStatus) {
                var room = channelRoomService ? channelRoomService.getObservableActiveRoom().getValue() : null;
                var members = room ? room.getObservableMembers().getValue() : [];

                if (!room) {
                    return; // No longer in room.
                }

                return membersChangedCallback(members, streamStatus);
            };

            function monitorChannelSubsciber(mediaStreamId, error, response) {
                if (lastStreamId !== mediaStreamId) {
                    return; // Ignore old streams
                }

                if (error) {
                    return tryNextMember('unable-to-subscribe');
                }

                // Don't continue - Tell client
                if (response.reason === 'app-background') {
                    return subscriberCallback(error, response);
                }

                if (response.retry && memberSelector.getStrategy() !== 'high-availability') {
                    return response.retry();
                }

                if (response.status !== 'ok') {
                    return tryNextMember(response.status);
                }
            }

            var subscribeOptions = _.assign({}, {
                monitor: {
                    callback: _.bind(monitorChannelSubsciber, this, streamId),
                    options: {conditionCountForNotificationThreshold: 8}
                }
            }, options);
            var hadPreviousStreamReason = streamErrorStatus ? 'recovered-from-failure' : 'stream-override';
            var successReason = lastStreamId ? hadPreviousStreamReason : 'stream-started';

            lastStreamId = streamId;

            var mediaStreamCallback = function mediaStreamCallback(mediaStreamId, error, response) {
                if (lastStreamId !== mediaStreamId) {
                    return; // Ignore old streams
                }

                if (response && response.status === 'ok') {
                    response.reason = successReason;
                }

                if (error || (response && response.status !== 'ok')) {
                    that._logger.info('[%s] Issue with stream. Trying next member', mediaStreamId, response ? response.status : '', error);

                    return tryNextMember(response ? response.status : '');
                }

                if (response && response.mediaStream) {
                    lastMediaStream = response.mediaStream;
                } else {
                    lastStreamId = null;
                    lastMediaStream = null;
                }

                subscriberCallback(error, response);
            };

            that.subscribeToMemberStream(presenterStream, subscribeOptions, _.bind(mediaStreamCallback, this, streamId));
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

            var room = createRoomResponse.room;
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

    RoomExpress.prototype.subscribeToMemberStream = function (memberStream, options, callback) {
        assert.isObject(memberStream, 'memberStream');
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');

        var streamUri = memberStream.getUri();
        var streamId = memberStream.getPCastStreamId();
        var streamToken = parseStreamTokenFromStreamUri(streamUri, options.capabilities);

        if (!streamId) {
            this._logger.error('Invalid Member Stream. Unable to parse streamId from uri');

            throw new Error('Invalid Member Stream. Unable to parse streamId from uri');
        }

        var subscribeOptions = _.assign({}, {
            streamId: streamId,
            streamToken: streamToken
        }, options);
        var disposables = new disposable.DisposableList();

        subscribeToMemberStream.call(this, subscribeOptions, function(error, response) {
            disposables.dispose();

            if (response && response.status === 'ok' && response.mediaStream && response.mediaStream.getStream()) {
                disposables.add(memberStream.getObservableAudioState().subscribe(function(state) {
                    var monitor = response.mediaStream.getMonitor();
                    var tracks = response.mediaStream.getStream().getAudioTracks();

                    if (monitor && tracks.length === 1) {
                        monitor.setMonitorTrackState(tracks[0], state === trackEnums.states.trackEnabled.name);
                    }
                }, {initial: 'notify'}));
                disposables.add(memberStream.getObservableVideoState().subscribe(function(state) {
                    var monitor = response.mediaStream.getMonitor();
                    var tracks = response.mediaStream.getStream().getVideoTracks();

                    if (monitor && tracks.length === 1) {
                        monitor.setMonitorTrackState(tracks[0], state === trackEnums.states.trackEnabled.name);
                    }
                }, {initial: 'notify'}));
            }

            callback(error, response);
        });
    };

    function createRoomService(roomId, alias, callback) {
        var that = this;
        var uniqueId = _.uniqueId();

        this._pcastExpress.waitForOnline(function() {
            var activeRoomService = findActiveRoom.call(that, roomId, alias);

            if (activeRoomService) {
                return callback(null, {
                    status: 'ok',
                    roomService: activeRoomService
                });
            }

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
        var roomServiceLeaveRoom = roomService.leaveRoom;

        roomService.stop = function() {
            roomServiceStop.call(roomService);
            delete that._roomServices[uniqueId];
        };

        roomService.leaveRoom = function leaveRoom(callback) {
            var room = roomService.getObservableActiveRoom().getValue();

            roomServiceLeaveRoom.call(roomService, function(error, response) {
                if (error) {
                    roomService.stop();

                    return callback(error);
                }

                if (response.status !== 'ok' && response.status !== 'not-in-room') {
                    return callback(null, response);
                }

                if (room && that._membersSubscriptions[room.getRoomId()]) {
                    that._membersSubscriptions[room.getRoomId()].dispose();

                    delete that._membersSubscriptions[room.getRoomId()];
                }

                that._logger.info('Successfully disposed of Express Room Service [%s]', room ? room.getRoomId() : 'Uninitialized');

                roomService.stop();
            });
        };

        return roomService;
    }

    function subscribeToMemberStream(subscribeOptions, callback) {
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

            var subscribeResponse = _.assign({}, response, {status: 'ok'});

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
                    createViewerStreamTokenAndJoinRoom.call(that, options, publisher, room, function ignoreSuccess(error, response) {
                        if (error || response.status !== 'ok') {
                            callback(error, response);
                        }
                    });
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

            if (response.status === 'ok') {
                activeRoomService = findActiveRoom.call(that, room.getRoomId());

                var selfStreams = activeRoomService.getSelf().getObservableStreams().getValue();
                var publishedSelfStream = _.find(selfStreams, function(selfStream) {
                    return selfStream.getPCastStreamId() === publisher.getStreamId();
                });

                listenForTrackStateChange.call(that, publisher.getStream(), publishedSelfStream);
            }

            if (response.status === 'ok' && !publisherStop) {
                publisherStop = _.bind(publisher.stop, publisher);

                publisher.stop = function() {
                    removePublisher.call(that, publisher, room);

                    var streamsAfterStop = mapNewPublisherStreamToMemberStreams.call(that, null, room);
                    var roomService = findActiveRoom.call(that, room.getRoomId());

                    publisherStop();

                    if (!roomService) {
                        return;
                    }

                    if (streamsAfterStop.length === 0) {
                        return roomService.leaveRoom(function() {});
                    }

                    updateSelfStreams.call(that, streamsAfterStop, roomService, function(error) {
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

        updateSelfStreams.call(that, joinRoomOptions.streams, activeRoomService, handleUpdate);
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
            selfStreams = _.filter(selfStreams, function(stream) {
                var hasSameUri = stream.uri === publisherStream.uri;
                var pcastStreamId = Stream.parsePCastStreamIdFromStreamUri(stream.uri);
                var isPCastStream = !!pcastStreamId;
                var hasSamePCastStreamId = isPCastStream && pcastStreamId === Stream.parsePCastStreamIdFromStreamUri(publisherStream.uri);
                var hasSameType = stream.type === publisherStream.type;

                return (!hasSameUri && !hasSamePCastStreamId) || !hasSameType;
            });

            selfStreams.push(publisherStream);
        }

        return _.filter(selfStreams, function(stream) {
            return _.includes(publisherIds, Stream.parsePCastStreamIdFromStreamUri(stream.uri) || stream.uri);
        });
    }

    function updateSelfStreams(streams, roomService, callback) {
        var activeRoom = roomService.getObservableActiveRoom().getValue();

        if (streams) {
            var self = roomService.getSelf();

            self.setStreams(streams);
        }

        if (activeRoom && roomService.getSelf()) {
            updateSelfWithRetry.call(this, roomService.getSelf(), callback);
        }
    }

    function updateSelfWithRetry(self, callback) {
        var updateSelfErrors = 0;
        var that = this;

        self.commitChanges(function handleUpdateSelf(error, response) {
            if (error) {
                updateSelfErrors++;
            }

            if (response && response.status === 'conflict') {
                return self.commitChanges(handleUpdateSelf);
            }

            if (response && response.status !== 'ok') {
                updateSelfErrors++;
            }

            if (response && response.status === 'ok') {
                updateSelfErrors = 0;

                return !callback || callback(null, response);
            }

            if (updateSelfErrors > 3) {
                that._logger.warn('Unable to update self after 3 attempts.');

                return callback(new Error('Unable to update self'));
            }

            if (updateSelfErrors > 0 && updateSelfErrors < 3) {
                that._logger.warn('Unable to update self after [%s] attempts. Retrying.', updateSelfErrors);

                return self.commitChanges(handleUpdateSelf);
            }
        });
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

    function checkifStreamingIsAvailable(uri) {
        var deferToCreateToken = true;
        var streamInfo = Stream.parsePCastStreamInfoFromStreamUri(uri);

        if (_.values(streamInfo).length === 0) {
            return deferToCreateToken;
        }

        return !!streamInfo.streamTokenStreaming;
    }

    function parseStreamTokenFromStreamUri(uri, capabilities) {
        var streamInfo = Stream.parsePCastStreamInfoFromStreamUri(uri);

        if (streamInfo.streamTokenStreaming && _.includes(capabilities, 'streaming')) {
            return streamInfo.streamTokenStreaming;
        }

        return streamInfo.streamToken;
    }

    function mapStreamToMemberStream(publisher, type, viewerStreamToken, viewerStreamTokenStreaming) {
        var mediaStream = publisher.getStream();
        var audioTracks = mediaStream ? mediaStream.getAudioTracks() : null;
        var videoTracks = mediaStream ? mediaStream.getVideoTracks() : null;
        var audioTrackEnabled = audioTracks.length > 0 && audioTracks[0].enabled;
        var videoTrackEnabled = videoTracks.length > 0 && videoTracks[0].enabled;

        var publishedStream = {
            uri: Stream.getPCastPrefix() + publisher.getStreamId(),
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

    function listenForTrackStateChange(stream, memberStream) {
        var tracks = stream.getTracks();
        var that = this;

        _.forEach(tracks, function(track) {
            _.addEventListener(track, 'StateChange', function() {
                var state = track.enabled ? trackEnums.states.trackEnabled.name : trackEnums.states.trackDisabled.name;
                var self = getSelfAssociatedWithStream.call(that, memberStream);

                that._logger.info('[%s] [%s] Track state changed to [%s], updating room member stream state [%s]', stream.id, track.id, track.enabled, state);

                if (track.kind === 'video') {
                    memberStream.getObservableVideoState().setValue(state);
                } else {
                    memberStream.getObservableAudioState().setValue(state);
                }

                if (self) {
                    updateSelfWithRetry.call(that, self);
                }
            });
        });
    }

    function getSelfAssociatedWithStream(memberStream) {
        var roomService = _.find(this._activeRoomServices, function(roomService) {
            var self = roomService.getSelf();
            var selfStreams = self ? self.getObservableStreams().getValue() : [];

            return _.find(selfStreams, function(selfStream) {
                return memberStream === selfStream;
            });
        });

        return roomService ? roomService.getSelf() : null;
    }

    return RoomExpress;
});