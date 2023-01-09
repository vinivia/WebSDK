/**
 * Copyright 2023 Phenix Real Time Solutions, Inc. All Rights Reserved.
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
    'phenix-web-observable',
    'phenix-web-disposable',
    './PCastExpress',
    '../room/RoomService',
    './MemberSelector',
    '../room/Stream',
    '../room/room.json',
    '../room/member.json',
    '../room/stream.json',
    '../room/track.json'
], function(_, assert, observable, disposable, PCastExpress, RoomService, MemberSelector, Stream, roomEnums, memberEnums, memberStreamEnums, trackEnums) {
    'use strict';

    function RoomExpress(options) {
        assert.isObject(options, 'options');

        if (options.pcastExpress) {
            assert.isObject(options.pcastExpress, 'options.pcastExpress');
        }

        if ('enableWildcardCapability' in options) {
            throw new Error('"options.enableWildcardCapability" is no longer supported.');
        }

        this._pcastExpress = options.pcastExpress || new PCastExpress(options);
        this._shouldDisposeOfPCastExpress = !options.pcastExpress;
        this._roomServices = {};
        this._externalPublishers = [];
        this._roomServicePublishers = {};
        this._activeRoomServices = [];
        this._publisherDisposables = {};
        this._logger = this._pcastExpress.getPCast().getLogger();
        this._disposables = new disposable.DisposableList();
        this._disposed = false;
        this._isHandlingTrackChange = false;
        this._handleStateChangeTimeOut = null;

        var that = this;

        this._pcastExpress.getPCastObservable().subscribe(function(pcast) {
            if (!pcast) {
                return;
            }

            that._logger.info('Resetting Room Express after change in pcast.');

            that._pcastExpress.waitForOnline(function() {
                var currentPCast = that._pcastExpress.getPCastObservable().getValue();

                if (currentPCast !== pcast) {
                    return;
                }

                _.forOwn(that._roomServices, function(roomService) {
                    roomService.setPCast(pcast);
                });
            });
        });
    }

    RoomExpress.prototype.dispose = function dispose() {
        this._disposed = true;

        disposeOfRoomServices.call(this);

        if (this._shouldDisposeOfPCastExpress) {
            this._pcastExpress.dispose();
        }

        this._disposables.dispose();

        this._logger.info('Disposed Room Express Instance');
    };

    RoomExpress.prototype.getPCastExpress = function getPCastExpress() {
        return this._pcastExpress;
    };

    RoomExpress.prototype.joinRoom = function joinRoom(options, joinRoomCallback, membersChangedCallback) {
        assert.isObject(options, 'options');
        assert.isFunction(joinRoomCallback, 'joinRoomCallback');
        assert.isStringNotEmpty(options.role, 'options.role');

        if ('streamToken' in options) {
            throw new Error('"options.streamToken" is no longer supported. Please use "options.token" instead.');
        }

        if (!options.token) {
            throw new Error('Cannot join room. Please use "options.token".');
        }

        if ('roomId' in options) {
            throw new Error('"options.roomId" is no longer supported. Please use "options.token" instead.');
        }

        if ('alias' in options) {
            throw new Error('"options.alias" is no longer supported. Please use "options.token" instead.');
        }

        if (membersChangedCallback) {
            assert.isFunction(membersChangedCallback, 'membersChangedCallback');
        }

        if (options.screenName) {
            assert.isStringNotEmpty(options.screenName, 'options.screenName');
        }

        if (options.streams) {
            assert.isArray(options.streams, 'options.streams');
        }

        assert.isStringNotEmpty(options.token, 'options.token');

        var roomId = this._pcastExpress.parseRoomOrChannelIdFromToken(options.token);
        var alias = this._pcastExpress.parseRoomOrChannelAliasFromToken(options.token);

        if (roomId) {
            options.roomId = roomId;
            this._logger.info('Room ID is set to [%s] from token [%s]', roomId, options.token);
        }

        if (alias) {
            options.alias = alias;
            this._logger.info('Alias is set to [%s] from token [%s]', alias, options.token);
        }

        var that = this;
        var joinRoomWithPCast = function(pcast) {
            if (!pcast) {
                return;
            }

            joinRoomWithOptions.call(that, options, function(error, response) {
                var joinRoomResponse = response;

                if (joinRoomResponse && joinRoomResponse.roomService) {
                    var leaveRoom = joinRoomResponse.roomService.leaveRoom;

                    joinRoomResponse.roomService.leaveRoom = function(callback, isForceLeaveRoom) {
                        if (subscription && pcast.getObservableStatus() !== 'offline') {
                            subscription.dispose();
                        }

                        leaveRoom(callback, isForceLeaveRoom);
                    };
                }

                joinRoomCallback(error, response);
            }, membersChangedCallback);
        };

        if (this._pcastExpress.getPCastObservable()) {
            return joinRoomWithPCast(this._pcastExpress.getPCastObservable());
        }

        var subscription = this._pcastExpress.getPCastObservable().subscribe(joinRoomWithPCast);
    };

    RoomExpress.prototype.publishToRoom = function publishToRoom(options, callback) {
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');

        if ('room' in options) {
            throw new Error('"options.room" is no longer supported.');
        }

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

        if (options.tags) {
            assert.isArray(options.tags, 'options.tags');
        }

        if (options.streamInfo) {
            assert.isObject(options.streamInfo, 'options.streamInfo');
        }

        if ('streamToken' in options) {
            throw new Error('"options.streamToken" is no longer supported. Please use "options.token" instead.');
        }

        if (!options.token) {
            throw new Error('Cannot publish. Please use "options.token".');
        }

        if (options.token && options.capabilities) {
            throw new Error('Do not pass `options.capabilities` with `options.token`. `options.token` should include capabilities in the token.');
        }

        if (options.viewerStreamSelectionStrategy) {
            assert.isStringNotEmpty(options.viewerStreamSelectionStrategy, 'options.viewerStreamSelectionStrategy');
        }

        if (options.capabilities) {
            assert.isArray(options.capabilities, 'options.capabilities');
        }

        assert.isValidType(options.streamType, memberStreamEnums.types, 'options.streamType');
        assert.isValidType(options.memberRole, memberEnums.roles, 'options.memberRole');

        var that = this;
        var screenName = options.screenName || _.uniqueId();
        var roomId = this._pcastExpress.parseRoomOrChannelIdFromToken(options.token);
        var alias = this._pcastExpress.parseRoomOrChannelAliasFromToken(options.token);

        this._logger.info('[%s] [%s] RoomId and Alias read from token [%s]', roomId, alias, options.token);

        var activeRoomService = findActiveRoom.call(that, roomId, alias);

        var publishToActiveRoom = function publishToActiveRoom(room, joinRoomResponse) {
            var publishOptions = _.assign({
                monitor: {
                    callback: _.bind(monitorSubsciberOrPublisher, that, callback),
                    options: {conditionCountForNotificationThreshold: 8}
                },
                streamInfo: {}
            }, options);

            if (room.getObservableType().getValue() === roomEnums.types.channel.name) {
                publishOptions.tags = ['channelId:' + room.getRoomId(), 'channelAlias:' + room.getObservableAlias().getValue()].concat(publishOptions.tags || []);
            } else {
                publishOptions.tags = ['roomId:' + room.getRoomId(), 'roomAlias:' + room.getObservableAlias().getValue()].concat(publishOptions.tags || []);
            }

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

                var callbackWithNoRoomService = function(error, response) {
                    callback(error, response ? _.assign({roomService: null}, response) : response);
                };

                return that._pcastExpress.publishRemote(remoteOptions, callbackWithNoRoomService);
            }

            var callbackWithRoomService = function(error, response) {
                callback(error, response ? _.assign({roomService: joinRoomResponse.roomService}, response) : response);
            };

            publishAndUpdateSelf.call(that, publishOptions, room, callbackWithRoomService);
        };

        if (activeRoomService) {
            var activeRoom = activeRoomService.getObservableActiveRoom().getValue();

            publishToActiveRoom(activeRoom, {roomService: activeRoomService});

            return;
        }

        var joinRoomAsPresenterOptions = _.assign({}, options, {
            role: memberEnums.roles.audience.name,
            roomId: roomId,
            alias: alias
        });

        joinRoomWithOptions.call(this, joinRoomAsPresenterOptions, function joinRoomCallback(error, joinRoomWithOptionsResponse) {
            if (error) {
                return callback(error);
            }

            if (joinRoomWithOptionsResponse.status !== 'ok') {
                return callback(null, joinRoomWithOptionsResponse);
            }

            var activeRoom = joinRoomWithOptionsResponse.roomService.getObservableActiveRoom().getValue();
            publishToActiveRoom(activeRoom, joinRoomWithOptionsResponse);
        }, function membersChangedCallback() {
            return null;
        });
    };

    RoomExpress.prototype.publishScreenToRoom = function publishScreenToRoom(options, callback) {
        var publishScreenOptions = _.assign({mediaConstraints: {screen: true}}, options);

        this.publishToRoom(publishScreenOptions, callback);
    };

    RoomExpress.prototype.subscribeToMemberStream = function(memberStream, options, callback) {
        var capabilitiesFromToken = [];
        var that = this;

        assert.isObject(memberStream, 'memberStream');
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');

        if (options.capabilities) {
            throw new Error('subscribeToMemberStream options.capabilities is deprecated. Please use the constructor features option');
        }

        capabilitiesFromToken = getCapabilitiesFromTokenIfAble.call(that, options.token);

        if (!capabilitiesFromToken) {
            that._logger.warn('Failed to parse the `token` [%s]', options.token);

            return callback(new Error('Bad `token`'), {status: 'bad-token'});
        }

        var streamId = memberStream.getPCastStreamId();

        if (!streamId) {
            this._logger.error('Invalid Member Stream. Unable to parse streamId from uri');

            throw new Error('Invalid Member Stream. Unable to parse streamId from uri');
        }

        var featureAndCapability = that._pcastExpress.getPCast().getSupportedFeatureAndCapabilityFromCapabilities(capabilitiesFromToken);

        if (featureAndCapability.status !== 'ok') {
            that._logger.warn('[%s] Subscribing to member stream failed: [%s].', streamId, featureAndCapability.status);

            return callback(null, {status: featureAndCapability.status});
        }

        var subscriberCapabilities = featureAndCapability.capability !== '' ? [featureAndCapability.capability] : [];

        this._logger.info('Subscribing to member stream with feature [%s] and token [%s]', featureAndCapability.feature, !!options.token);

        var subscribeOptions = _.assign({}, {
            streamId: streamId,
            token: options.token,
            capabilities: subscriberCapabilities
        }, options);
        var streamInfo = memberStream.getInfo();
        var isScreen = _.get(streamInfo, ['isScreen'], false);
        var disposables = new disposable.DisposableList();

        subscribeToMemberStream.call(this, subscribeOptions, isScreen, function(error, response) {
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

            if (error && parseInt(error.category) === 6) {
                return callback(error, {status: 'device-insecure'});
            }

            var responseWithOriginStreamId = _.assign({originStreamId: streamId}, response);

            callback(error, responseWithOriginStreamId);
        });
    };

    function getCapabilitiesFromTokenIfAble(token) {
        var that = this;

        try {
            var capabilitiesFromToken = that._pcastExpress.parseCapabilitiesFromToken(token);

            return capabilitiesFromToken;
        } catch (e) {
            return;
        }
    }

    function disposeOfRoomServices() {
        _.forOwn(this._roomServicePublishers, function(publishers) {
            _.forEach(publishers, function(publisher) {
                publisher.stop('dispose');
            });
        });
        _.forOwn(this._roomServices, function(roomService) {
            roomService.stop('dispose');
        });

        this._roomServicePublishers = {};
        this._externalPublishers = [];
        this._roomServices = {};
        this._activeRoomServices = [];
    }

    function createRoomService(roomId, alias, callback) {
        var that = this;
        var uniqueId = _.uniqueId();

        this._pcastExpress.waitForOnline(function(error) {
            if (error) {
                return callback(error);
            }

            var activeRoomService = findActiveRoom.call(that, roomId, alias);

            if (activeRoomService) {
                that._logger.info('Reusing room service for room [%s]/[%s]', roomId, alias);

                return callback(null, {
                    status: 'ok',
                    roomService: activeRoomService
                });
            }

            that._roomServices[uniqueId] = new RoomService(that._pcastExpress.getPCast());

            var expressRoomService = createExpressRoomService.call(that, that._roomServices[uniqueId], uniqueId);

            that._logger.info('Creating room service for room [%s]/[%s]', roomId, alias);

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
            roomServiceStop.apply(roomService, arguments);

            delete that._roomServices[uniqueId];
        };

        roomService.leaveRoom = function leaveRoom(callback, isForceLeaveRoom) {
            var room = roomService.getObservableActiveRoom().getValue();

            roomServiceLeaveRoom.call(roomService, function(error, response) {
                if (error) {
                    roomService.stop('leave-room-failure');

                    return callback(error);
                }

                if (response.status !== 'ok' && response.status !== 'not-in-room') {
                    return callback(null, response);
                }

                that._logger.info('Successfully disposed Express Room Service [%s]', room ? room.getRoomId() : 'Uninitialized');

                roomService.stop('leave-room');

                return callback(null, response);
            }, isForceLeaveRoom);
        };

        return roomService;
    }

    function joinRoomWithOptions(options, joinRoomCallback, membersChangedCallback) {
        var that = this;
        var role = options.role;
        var screenName = options.screenName || _.uniqueId();

        createRoomService.call(that, options.roomId, options.alias, function(error, roomServiceResponse) {
            if (error) {
                return joinRoomCallback(error);
            }

            if (roomServiceResponse.status !== 'ok') {
                return joinRoomCallback(null, roomServiceResponse);
            }

            var roomService = roomServiceResponse.roomService;
            var activeRoomObservable = roomService.getObservableActiveRoom();
            var activeRoom = activeRoomObservable.getValue();
            var membersSubscription = null;
            var setupMembersSubscription = function setupMembersSubscription() {
                var room = activeRoomObservable.getValue();

                if (!room) {
                    that._logger.warn('Unable to setup members subscription. Not in room.');

                    return;
                }

                that._logger.info('Setup member subscription for room [%s]', room.getRoomId());

                membersSubscription = room.getObservableMembers().subscribe(membersChangedCallback, {initial: 'notify'});

                that._disposables.add(activeRoomObservable.subscribe(function(newRoom) {
                    if (membersSubscription) {
                        membersChangedCallback([]);
                        membersSubscription.dispose();
                        membersSubscription = null;
                    }

                    if (!newRoom) {
                        return;
                    }

                    membersSubscription = newRoom.getObservableMembers().subscribe(membersChangedCallback, {initial: 'notify'});
                }));
            };

            if (!activeRoom) {
                roomService.start(role, screenName);
            }

            if (options.streams && options.streams.length > 0) {
                if (!_.includes(options.streams[0].uri, Stream.getPCastPrefix())) {
                    options.streams[0].uri = Stream.getPCastPrefix() + options.streams[0].uri;
                    that._externalPublishers.push(options.streams[0].uri);
                }

                var roleToJoin = options.role;

                updateSelfStreamsAndRole.call(that, options.streams, roleToJoin, roomService, function(error) {
                    if (error) {
                        return joinRoomCallback(error);
                    }
                });
            }

            if (activeRoom) {
                joinRoomCallback(null, {
                    status: 'ok',
                    roomService: roomService
                });

                if (membersChangedCallback) {
                    setupMembersSubscription();
                }

                return;
            }

            roomService.enterRoom(options.roomId, options.alias, function(error, roomResponse) {
                if (error) {
                    roomService.stop('enter-room-failure');

                    return joinRoomCallback(error);
                }

                if (roomResponse.status === 'not-found') {
                    roomService.stop('enter-room-failure');

                    return joinRoomCallback(null, {status: 'room-not-found'});
                }

                if (roomResponse.status !== 'ok' && roomResponse.status !== 'already-in-room') {
                    roomService.stop('enter-room-failure');

                    return joinRoomCallback(null, roomResponse);
                }

                that._activeRoomServices.push(roomService);

                joinRoomCallback(null, {
                    status: 'ok',
                    roomService: roomService
                });

                if (membersChangedCallback) {
                    return setupMembersSubscription();
                }
            });
        });
    }

    function subscribeToMemberStream(subscribeOptions, isScreen, callback) {
        var that = this;

        var count = 0;
        var handleSubscribe = function(error, response) {
            if (error) {
                return callback(error);
            }

            if (response.status !== 'ok' && response.status !== 'streaming-not-ready') {
                return callback(null, response);
            }

            count++;

            if (response.status === 'streaming-not-ready' && count < 3) {
                var retryTimeout = count * count * 1000;

                that._logger.info('Waiting for [%s] ms before retrying after [streaming-not-ready] status.', retryTimeout);

                var timeoutId = setTimeout(response.retry, retryTimeout);

                that._disposables.add(new disposable.Disposable(function() {
                    clearTimeout(timeoutId);
                }));

                return;
            } else if (response.status === 'streaming-not-ready' && count >= 3) {
                return callback(null, {status: response.status});
            }

            var subscribeResponse = _.assign({}, response, {status: 'ok'});

            if (count > 1) {
                subscribeResponse.reason = 'stream-failure-recovered';

                return callback(null, subscribeResponse);
            }

            callback(null, subscribeResponse);
        };

        if (isScreen) {
            return that._pcastExpress.subscribeToScreen(subscribeOptions, handleSubscribe);
        }

        return that._pcastExpress.subscribe(subscribeOptions, handleSubscribe);
    }

    function publishAndUpdateSelf(options, room, callback) {
        var that = this;
        var publisher;
        var refreshTokenIntervalId;
        var callbackWithPublisher = function(error, response) {
            callback(error, response ? _.assign({publisher: publisher}, response) : response);
        };

        var handlePublish = function(error, response) {
            if (refreshTokenIntervalId && publisher) {
                clearInterval(refreshTokenIntervalId);
            }

            if (error) {
                return callbackWithPublisher(error);
            }

            if (response.status !== 'ok') {
                return callbackWithPublisher(null, response);
            }

            addPublisher.call(that, response.publisher, room);
            removePublisher.call(that, publisher, room);

            publisher = response.publisher;

            that._publisherDisposables[publisher.getStreamId()] = new disposable.DisposableList();

            var publisherStop = _.bind(publisher.stop, publisher);

            publisher.stop = function() {
                clearInterval(refreshTokenIntervalId);

                removePublisher.call(that, publisher, room);

                var streamsAfterStop = mapNewPublisherStreamToMemberStreams.call(that, null, room);
                var roomService = findActiveRoom.call(that, room.getRoomId());
                var publisherDisposable = that._publisherDisposables[publisher.getStreamId()];

                if (publisherDisposable) {
                    publisherDisposable.dispose();

                    delete that._publisherDisposables[publisher.getStreamId()];
                }

                publisherStop.apply(publisher, arguments);

                if (!roomService) {
                    return;
                }

                updateSelfStreamsAndRoleAndEnterRoomIfNecessary.call(that, streamsAfterStop, streamsAfterStop.length === 0 ? memberEnums.roles.audience.name : options.memberRole, roomService, room, options, function(error) {
                    if (error) {
                        return callbackWithPublisher(error);
                    }
                });
            };

            listenForTrackStateChange.call(that, publisher, room, callbackWithPublisher);

            updateSelf.call(that, options, response.publisher, room, callbackWithPublisher);
        };

        if (_.get(options, ['mediaConstraints', 'screen'], false)) {
            _.set(options, ['streamInfo', 'isScreen'], true);

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

    function updateSelf(options, publisher, room, callback) {
        var that = this;
        var streamType = options.streamType;
        var streamInfo = options.streamInfo;
        var capabilities = [];

        var capabilitiesFromToken = getCapabilitiesFromTokenIfAble.call(that, options.token);

        if (!capabilitiesFromToken) {
            return callback(new Error('Bad `token`'), {status: 'bad-token'});
        }

        capabilities = capabilitiesFromToken;

        var publisherStream = mapStreamToMemberStream(publisher, streamType, streamInfo, capabilities);

        var activeRoomService = findActiveRoom.call(this, room.getRoomId(), room.getObservableAlias().getValue());
        var updateSelfOptions = _.assign({}, options, {streams: mapNewPublisherStreamToMemberStreams.call(this, publisherStream, room)});

        return updateSelfStreamsAndRoleAndEnterRoomIfNecessary.call(this, updateSelfOptions.streams, updateSelfOptions.memberRole, activeRoomService, room, updateSelfOptions, callback);
    }

    function addStreamInfo(stream, name, value) {
        var indexOfQueryParam = stream.uri.indexOf('?');
        var prefix = indexOfQueryParam > -1 ? '&' : '?';
        var indexOfHashAfterQueryParam = stream.uri.indexOf('#', indexOfQueryParam === -1 ? stream.uri.length : indexOfQueryParam);
        var uriBeforeHashIfQueryParamPresent = indexOfHashAfterQueryParam === -1 ? stream.uri : stream.uri.substring(0, indexOfHashAfterQueryParam);
        var uriHash = indexOfHashAfterQueryParam === -1 ? '' : stream.uri.substring(indexOfHashAfterQueryParam);

        stream.uri = uriBeforeHashIfQueryParamPresent + prefix + name + '=' + value + uriHash;

        return stream;
    }

    function mapNewPublisherStreamToMemberStreams(publisherStream, room) {
        var that = this;
        var activeRoomService = findActiveRoom.call(this, room.getRoomId(), room.getObservableAlias().getValue());
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
                var isTheSameWithoutQueryParams = publisherStream.uri.split('?')[0] === stream.uri.split('?')[0];
                var hasSameType = stream.type === publisherStream.type;

                return (!hasSameUri && !hasSamePCastStreamId && !isTheSameWithoutQueryParams) || !hasSameType;
            });

            selfStreams.push(publisherStream);
        }

        return _.filter(selfStreams, function(stream) {
            return !Stream.parsePCastStreamIdFromStreamUri(stream.uri)
                || _.includes(publisherIds, Stream.parsePCastStreamIdFromStreamUri(stream.uri) || stream.uri)
                || _.includes(that._externalPublishers, stream.uri.split('?')[0]);
        });
    }

    function updateSelfStreamsAndRole(streams, role, roomService, callback) {
        var activeRoom = roomService ? roomService.getObservableActiveRoom().getValue() : null;

        if (streams && roomService) {
            roomService.getSelf().setStreams(streams);
        }

        if (role && roomService) {
            roomService.getSelf().getObservableRole().setValue(streams.length === 0 ? memberEnums.roles.audience.name : role);
        }

        if (activeRoom && roomService.getSelf()) {
            return updateSelfWithRetry.call(this, roomService.getSelf(), callback);
        }
    }

    function updateSelfStreamsAndRoleAndEnterRoomIfNecessary(streams, role, roomService, room, options, callback) {
        var activeRoomService = findActiveRoom.call(this, room.getRoomId(), room.getObservableAlias().getValue());
        var activeRoom = roomService ? roomService.getObservableActiveRoom().getValue() : null;
        var shouldJoinRoom = !activeRoom && !activeRoomService;
        var that = this;

        if (that._disposed) {
            return that._logger.warn('Unable to update self after express room service disposal.');
        }

        if (streams && activeRoomService) {
            that._logger.debug('Preparing member streams for update in room [%s].', room.getRoomId());

            activeRoomService.getSelf().setStreams(streams);
        }

        if (role && activeRoomService && activeRoomService.getSelf().getObservableRole().getValue() !== role) {
            that._logger.debug('Preparing member role for update in room [%s].', room.getRoomId());

            activeRoomService.getSelf().getObservableRole().setValue(role);
        }

        if (activeRoom && activeRoomService.getSelf()) {
            return updateSelfWithRetry.call(this, activeRoomService.getSelf(), callback);
        }

        if (shouldJoinRoom) {
            that._logger.info('Joining room with member [%s].', room.getRoomId());

            var joinRoomAsPresenterOptions = _.assign({
                role: role,
                alias: _.get(options, ['room', 'alias']),
                roomId: _.get(options, ['room', 'roomId'])
            }, options);

            joinRoomWithOptions.call(that, joinRoomAsPresenterOptions, function(error, response) {
                if (error) {
                    return callback(error);
                }

                if (response.status !== 'ok' && response.status !== 'already-in-room') {
                    return callback(null, response);
                }

                callback(error, response);
            });
        }
    }

    function updateSelfWithRetry(self, callback) {
        var updateSelfErrors = 0;
        var that = this;
        var maxUpdateSelfRetries = 5;

        try {
            self.commitChanges(function handleUpdateSelf(error, response) {
                if (error || !response) {
                    updateSelfErrors++;
                }

                var roomService = self.getRoomService();
                var room = roomService ? roomService.getObservableActiveRoom().getValue() : null;

                if (response && response.status === 'ok' || (!room && response.status === 'not-found')) {
                    updateSelfErrors = 0;
                    that._isHandlingTrackChange = false;

                    return !callback || callback(null, response);
                }

                if (response && response.status !== 'ok') {
                    updateSelfErrors++;
                }

                if (updateSelfErrors >= maxUpdateSelfRetries) {
                    that._logger.warn('Unable to update self after [%s] attempts.', maxUpdateSelfRetries);

                    if (_.isNumber(response.lastUpdate)) {
                        that._logger.warn('Updating self last update from [%s] to [%s] to prevent permanent failure state. Our awareness of self does not match up with the server anymore.',
                            self.getObservableLastUpdate().getValue(), response.lastUpdate);

                        self.getObservableLastUpdate().setValue(response.lastUpdate);
                    }

                    that._isHandlingTrackChange = false;

                    return callback(new Error('Unable to update self'));
                }

                if (updateSelfErrors > 0 && updateSelfErrors < maxUpdateSelfRetries) {
                    that._logger.info('Unable to update self after [%s] attempts. Retrying.', updateSelfErrors);

                    return self.commitChanges(handleUpdateSelf);
                }
            });
        } catch (error) {
            callback(error);
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

    function mapStreamToMemberStream(publisher, type, streamInfo, capabilities, viewerStreamToken, viewerStreamTokenForBroadcastStream, viewerStreamTokenForLiveStream, drmStreamTokens) {
        var mediaStream = publisher.getStream();
        var audioTracks = mediaStream ? mediaStream.getAudioTracks() : null;
        var videoTracks = mediaStream ? mediaStream.getVideoTracks() : null;
        var audioTrackEnabled = audioTracks.length > 0 && audioTracks[0].enabled;
        var videoTrackEnabled = videoTracks.length > 0 && videoTracks[0].enabled;

        if (capabilities.includes('audio-only')) {
            videoTrackEnabled = false;
        }

        if (capabilities.includes('video-only')) {
            audioTrackEnabled = false;
        }

        var publishedStream = {
            uri: Stream.getPCastPrefix() + publisher.getStreamId(),
            type: type,
            audioState: audioTrackEnabled ? trackEnums.states.trackEnabled.name : trackEnums.states.trackDisabled.name,
            videoState: videoTrackEnabled ? trackEnums.states.trackEnabled.name : trackEnums.states.trackDisabled.name
        };

        var infoToAppend = _.assign({}, streamInfo, {
            streamToken: viewerStreamToken,
            streamTokenForBroadcastStream: viewerStreamTokenForBroadcastStream,
            streamTokenForLiveStream: viewerStreamTokenForLiveStream
        });

        if (!viewerStreamToken) {
            delete infoToAppend.streamToken;
        }

        if (!viewerStreamTokenForBroadcastStream) {
            delete infoToAppend.streamTokenForBroadcastStream;
        }

        if (!viewerStreamTokenForLiveStream) {
            delete infoToAppend.streamTokenForLiveStream;
        }

        if (drmStreamTokens) {
            assert.isArray(drmStreamTokens, 'drmStreamTokens');

            infoToAppend.streamTokenForLiveStreamWithDrmOpenAccess = drmStreamTokens[0];
            infoToAppend.streamTokenForLiveStreamWithDrmHollywood = drmStreamTokens[1];
        }

        var queryParamString = _.reduce(infoToAppend, function(queryParamString, currentValue, currentKey) {
            var currentPrefix = queryParamString ? '&' : '?';

            return queryParamString + currentPrefix + currentKey + '=' + currentValue;
        }, '');

        if (queryParamString.length > 0) {
            publishedStream.uri = publishedStream.uri + queryParamString;
        }

        publishedStream = addStreamInfo(publishedStream, 'capabilities', capabilities.join(','));

        return publishedStream;
    }

    function listenForTrackStateChange(publisher, room, callbackWithPublisher) {
        var that = this;
        var stream = publisher.getStream();

        if (!stream) {
            return;
        }

        var tracks = stream.getTracks();

        _.forEach(tracks, function(track) {
            var handleStateChange = function handleStateChange() {
                that._isHandlingTrackChange = true;

                var state = track.enabled ? trackEnums.states.trackEnabled.name : trackEnums.states.trackDisabled.name;
                var activeRoomService = findActiveRoom.call(that, room.getRoomId());

                if (!activeRoomService || !activeRoomService.getSelf()) {
                    return;
                }

                var selfStreams = activeRoomService.getSelf().getObservableStreams().getValue();
                var memberStream = _.find(selfStreams, function(selfStream) {
                    return selfStream.getPCastStreamId() === publisher.getStreamId();
                });
                var self = getSelfAssociatedWithStream.call(that, memberStream);

                if (!memberStream) {
                    return that._logger.warn('[%s] [%s] Unable to update member state change after track state change [%s]. Member stream no longer exists on member model.', stream.id, track.id, track.enabled);
                }

                that._logger.info('[%s] [%s] Track state changed to [%s], updating room member stream state [%s]', stream.id, track.id, track.enabled, state);

                if (track.kind === 'video') {
                    memberStream.getObservableVideoState().setValue(state);
                } else {
                    memberStream.getObservableAudioState().setValue(state);
                }

                if (self) {
                    updateSelfWithRetry.call(that, self, callbackWithPublisher);
                }
            };

            var handleStateChangeIfPossible = function handleStateChangeIfPossible() {
                if (that._handleStateChangeTimeOut) {
                    clearTimeout(that._handleStateChangeTimeOut);
                    that._handleStateChangeTimeOut = null;
                }

                if (!that._isHandlingTrackChange) {
                    handleStateChange();

                    return;
                }

                that._handleStateChangeTimeOut = setTimeout(function() {
                    handleStateChangeIfPossible();
                });
            };

            track.updateState = function(enabled) {
                this.enabled = enabled;
                handleStateChangeIfPossible();
            };
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