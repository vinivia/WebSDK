/**
 * Copyright 2018 PhenixP2P Inc. All Rights Reserved.
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
    '../authentication/AuthenticationService',
    './Room',
    './ImmutableRoom',
    './Member',
    '../chat/RoomChatService',
    './room.json',
    './member.json'
], function(_, assert, observable, disposable, AuthenticationService, Room, ImmutableRoom, Member, RoomChatService, roomEnums, memberEnums) {
    'use strict';

    var notInRoomResponse = _.freeze({status: 'not-in-room'});
    var alreadyInRoomResponse = _.freeze({status: 'already-in-room'});
    var inAnotherRoomResponse = _.freeze({status: 'in-another-room'});

    function RoomService(pcast) {
        assert.isObject(pcast, 'pcast');
        assert.isFunction(pcast.getLogger, 'pcast.getLogger');
        assert.isFunction(pcast.getProtocol, 'pcast.getProtocol');

        this._pcast = pcast;
        this._logger = pcast.getLogger();
        this._protocol = pcast.getProtocol();

        this._self = new observable.Observable(null);
        this._activeRoom = new observable.Observable(null);
        this._cachedRoom = new observable.Observable(null);
        this._roomChatService = null;

        assert.isObject(this._logger, 'this._logger');
        assert.isObject(this._protocol, 'this._protocol');

        this._authService = new AuthenticationService(this._pcast);
    }

    RoomService.prototype.start = function start(role, screenName) {
        if (this._started) {
            return this._logger.warn('RoomService already started.');
        }

        assert.isStringNotEmpty(role, 'role');
        assert.isStringNotEmpty(screenName, 'screenName');

        var myState = memberEnums.states.passive.name;
        var mySessionId = this._authService.getPCastSessionId();
        var myScreenName = screenName;
        var myStreams = [];
        var myLastUpdate = _.now();
        var roomService = this;

        var self = new Member(roomService, myState, mySessionId, myScreenName, role, myStreams, myLastUpdate);

        this._self = new observable.Observable(self);
        this._disposables = new disposable.DisposableList();

        var disposeOfRoomEventHandler = this._protocol.onEvent('chat.RoomEvent', _.bind(onRoomEvent, this));

        this._disposables.add(disposeOfRoomEventHandler);

        setupSubscriptions.call(this);

        this._started = true;

        return self;
    };

    RoomService.prototype.getRoomInfo = function getRoomInfo(roomId, alias, callback) {
        if (roomId) {
            assert.isStringNotEmpty(roomId, 'roomId');
        } else {
            assert.isStringNotEmpty(alias, 'alias');
        }

        assert.isFunction(callback, 'callback');

        getRoomInfoRequest.call(this, roomId, alias, callback);
    };

    RoomService.prototype.createRoom = function createRoom(room, callback) {
        assert.isObject(room, 'room');
        assert.isStringNotEmpty(room.name, 'room.name');
        assert.isStringNotEmpty(room.type, 'room.type');
        assert.isString(room.description, 'room.description');
        assert.isFunction(callback, 'callback');

        createRoomRequest.call(this, room, callback);
    };

    RoomService.prototype.enterRoom = function enterRoom(roomId, alias, callback) {
        if (roomId) {
            assert.isStringNotEmpty(roomId, 'roomId');
        } else {
            assert.isStringNotEmpty(alias, 'alias');
        }

        assert.isFunction(callback, 'callback');

        enterRoomRequest.call(this, roomId, alias, callback);
    };

    RoomService.prototype.leaveRoom = function leaveRoom(callback) {
        var that = this;

        return leaveRoomRequest.call(that, callback);
    };

    RoomService.prototype.getChatService = function getChatService() {
        if (!this._roomChatService && this._activeRoom.getValue()) {
            this._roomChatService = new RoomChatService(this);
        }

        return this._roomChatService;
    };

    RoomService.prototype.getSelf = function getSelf() {
        return this._self.getValue();
    };

    RoomService.prototype.getObservableActiveRoom = function getObservableActiveRoom() {
        return this._activeRoom;
    };

    RoomService.prototype.updateSelf = function updateSelf(callback) {
        assert.isFunction(callback, 'callback');

        updateMemberRequest.call(this, this.getSelf(), callback);
    };

    RoomService.prototype.updateMember = function updateMember(member, callback) {
        assert.isFunction(callback, 'callback');
        assert.isObject(member, 'member');

        updateMemberRequest.call(this, member, callback);
    };

    RoomService.prototype.updateRoom = function updateRoom(callback) {
        assert.isFunction(callback, 'callback');

        updateRoomRequest.call(this, callback);
    };

    RoomService.prototype.revertRoomChanges = function revertRoomChanges() {
        var activeRoom = this._activeRoom.getValue();
        var cachedRoom = this._cachedRoom.getValue();

        if (!activeRoom || !cachedRoom) {
            return this._logger.warn('Unable to revert changes to room. Not currently in a room.');
        }

        activeRoom._update(cachedRoom.toJson());
    };

    RoomService.prototype.revertMemberChanges = function revertMemberChanges(member) {
        assert.isObject(member, 'member');

        var cachedMember = findMemberInObservableRoom(member.getSessionId(), this._cachedRoom);
        var activeMember = findMemberInObservableRoom(member.getSessionId(), this._activeRoom);

        if (!cachedMember || !activeMember) {
            return this._logger.warn('Unable to revert changes to member. Member is currently not in room.');
        }

        activeMember._update(cachedMember.toJson());
    };

    RoomService.prototype.isInRoom = function isInRoom() {
        return !!this._activeRoom.getValue();
    };

    RoomService.prototype.toString = function toString() {
        return 'RoomService';
    };

    RoomService.prototype.stop = function stop(reason) {
        var activeRoom = this._activeRoom.getValue();
        var that = this;

        this._logger.info('Stopping room service with reason [%s]', reason);

        if (activeRoom) {
            return this.leaveRoom(function(error, response) {
                if (error) {
                    that._logger.warn('Failure to stop room service. Unable to leave room', error);
                }

                if (response && response.status !== 'ok') {
                    that._logger.warn('Failure to stop room service. Unable to leave room. Status: [%s]', response.status);
                }

                if (response && response.status === 'ok') {
                    resetRoomModels.call(that);

                    that._started = false;
                }
            });
        }

        resetRoomModels.call(this);

        that._started = false;
    };

    function resetRoomModels() {
        this._self.setValue(null);
        this._activeRoom.setValue(null);
        this._cachedRoom.setValue(null);
        this._roomChatService = null;

        if (this._disposables) {
            this._disposables.dispose();
        }

        this._disposables = null;
    }

    function resetSelf(sessionId) {
        var self = this._self.getValue().toJson();
        var roomService = this;

        this._logger.info('Resetting self after sessionId changed to [%s]', sessionId);

        this._self.setValue(new Member(roomService, self.state, sessionId || '', self.screenName, self.role, self.streams, self.lastUpdate));
    }

    function resetRoom() {
        var that = this;

        var activeRoom = that._activeRoom.getValue();
        var selfSessionId = that._self.getValue().getSessionId();

        if (!_.isObject(activeRoom) || !selfSessionId) {
            return;
        }

        var roomId = activeRoom.getRoomId();
        var alias = activeRoom.getObservableAlias().getValue();

        that._logger.info('Leaving and re-entering room after reset of self model');

        leaveRoomRequest.call(that, function() {
            enterRoomRequest.call(that, roomId, alias, function() {
                that._logger.info('Room Reset Completed');
            });
        });
    }

    // Handle events
    function onRoomEvent(event) {
        assert.isObject(event, 'event');
        assert.isString(event.roomId, 'event.roomId');
        assert.isString(event.eventType, 'event.eventType');
        assert.isArray(event.members, 'event.members');

        _.forEach(event.members, function(member) {
            assert.isObject(member, 'member');
        });

        var that = this;

        switch (event.eventType) {
        case roomEnums.events.memberJoined.name:
            that._logger.debug('[%s] Member joined [%s]', event.roomId, event.members);

            return onMembersJoinsRoom.call(that, event.roomId, event.members);
        case roomEnums.events.memberLeft.name:
            that._logger.debug('[%s] Member left [%s]', event.roomId, event.members);

            return onMembersLeavesRoom.call(that, event.roomId, event.members);
        case roomEnums.events.memberUpdated.name:
            that._logger.debug('[%s] Member updated [%s]', event.roomId, event.members);

            return onMembersUpdated.call(that, event.roomId, event.members);
        case roomEnums.events.roomUpdated.name:
            that._logger.debug('[%s] Room updated [%s]', event.roomId, event.room);

            return onRoomUpdated.call(that, event.roomId, event.room);
        case roomEnums.events.roomEnded.name:
            that._logger.info('[%s] Room ended', event.roomId);

            break;
        default:
            that._logger.warn('Unsupported room event [%s]', event.eventType);
        }
    }

    function onMembersJoinsRoom(roomId, members) {
        var room = this._activeRoom.getValue();
        var cachedRoom = this._cachedRoom.getValue();

        if (!room || room.getRoomId() !== roomId) {
            return;
        }

        room._removeMembers(members);
        room._addMembers(members);

        cachedRoom._removeMembers(members);
        cachedRoom._addMembers(members);

        var that = this;

        var memberIsSelf = function(member) {
            return member.sessionId === that.getSelf().getSessionId();
        };

        var joinedSelf = _.find(members, memberIsSelf);

        if (joinedSelf) {
            replaceSelfInstanceInRoom.call(that, room);

            room._updateMembers([joinedSelf]);
        }

        this._logger.info('[%s] Room has now [%d] members', roomId, room.getObservableMembers().getValue().length);
    }

    function onMembersLeavesRoom(roomId, members) {
        var room = this._activeRoom.getValue();
        var cachedRoom = this._cachedRoom.getValue();

        if (!room || room.getRoomId() !== roomId) {
            return;
        }

        var that = this;

        var memberIsSelf = function(member) {
            return member.sessionId === that.getSelf().getSessionId();
        };

        var leftSelf = _.find(members, memberIsSelf);
        var self = this.getSelf();

        if (self && leftSelf) {
            self.getObservableLastUpdate().setValue(leftSelf.lastUpdate);
        }

        room._removeMembers(members);
        cachedRoom._removeMembers(members);

        this._logger.info('[%s] Room has now [%d] members', roomId, room.getObservableMembers().getValue().length);
    }

    function onMembersUpdated(roomId, members) {
        var room = this._activeRoom.getValue();
        var cachedRoom = this._cachedRoom.getValue();

        if (!room || room.getRoomId() !== roomId) {
            return;
        }

        // To help reduce conflicts when different properties are sequentially changing
        var membersWithOnlyPropertiesThatChanged = getDifferencesBetweenCachedRoomMembersAndUpdatedMembers.call(this, members);

        room._updateMembers(membersWithOnlyPropertiesThatChanged);
        cachedRoom._updateMembers(membersWithOnlyPropertiesThatChanged);

        this._logger.info('[%s] Room has [%d] updated members', roomId, members.length);
    }

    function onRoomUpdated(roomId, room) {
        var activeRoom = this._activeRoom.getValue();
        var cachedRoom = this._cachedRoom.getValue();

        if (!activeRoom || activeRoom.getRoomId() !== roomId) {
            return;
        }

        cachedRoom._update(room);
        activeRoom._update(room);
    }

    function handlePCastSessionIdChanged(sessionId) {
        if (this.getSelf() && this.getSelf().getSessionId() === (sessionId || '')) {
            return;
        }

        resetSelf.call(this, sessionId);
    }

    function findMemberInObservableRoom(sessionId, observableRoom) {
        var room = observableRoom.getValue();
        var members = room.getObservableMembers().getValue();

        return findMemberInMembers(sessionId, members);
    }

    function findMemberInMembers(sessionId, members) {
        return _.find(members, function(member) {
            return sessionId === member.getSessionId();
        });
    }

    function handlePCastStatusChange(status) {
        this._logger.info('PCast status changed to [%s]', status);

        if (status.toLowerCase() !== 'offline' && this._lastPcastStatus === 'offline') {
            // ToDo (dcy) disabled until we determine what to do when the client goes back online
            // resetRoom.call(this);
        } else if (status.toLowerCase() === 'offline' && this._lastPcastStatus !== 'offline' && !_.isNullOrUndefined(this._lastPcastStatus)) {
            // ToDo (dcy) disabled until we determine what to do when the client goes offline
        }

        this._lastPcastStatus = status;
    }

    function setupSubscriptions() {
        var selfSubscription = this._self.subscribe(_.bind(resetRoom, this));

        var pcastStatusSubscription = this._authService.getObservableStatus().subscribe(_.bind(handlePCastStatusChange, this));
        var pcastSessionIdSubscription = this._authService.getObservableSessionId().subscribe(_.bind(handlePCastSessionIdChanged, this));

        this._disposables.add(selfSubscription);
        this._disposables.add(pcastStatusSubscription);
        this._disposables.add(pcastSessionIdSubscription);
    }

    function getDifferencesBetweenCachedRoomMembersAndUpdatedMembers(members) {
        var that = this;

        return _.map(members, function(member) {
            var cachedMember = findMemberInObservableRoom(member.sessionId, that._cachedRoom);
            var placeholderMember = new Member(null, member.state, member.sessionId, member.screenName, member.role, member.streams, member.lastUpdate);
            var memberWithOnlyDifferentProperties = buildMemberForRequest(placeholderMember, cachedMember);

            memberWithOnlyDifferentProperties.lastUpdate = member.lastUpdate;

            return memberWithOnlyDifferentProperties;
        });
    }

    // Requests to server
    function buildMemberForRequest(member, memberToCompare) {
        var memberForRequest = findDifferencesInMember(member, memberToCompare);

        memberForRequest.sessionId = member.getSessionId();
        // Last valid update from server. Handles collisions.
        memberForRequest.lastUpdate = memberToCompare ? memberToCompare.getLastUpdate() : _.now();

        return memberForRequest;
    }

    function findDifferencesInMember(member, memberToCompare) {
        if (!memberToCompare) {
            return member.toJson();
        }

        var memberForRequest = {};
        var newMember = member.toJson();
        var cachedMember = memberToCompare.toJson();
        var differences = _.findDifferences(newMember, cachedMember, true);

        _.forEach(differences, function(key) {
            memberForRequest[key] = newMember[key];
        });

        return memberForRequest;
    }

    function getRoomInfoRequest(roomId, alias, callback) {
        this._authService.assertAuthorized();

        var that = this;

        this._protocol.getRoomInfo(roomId, alias,
            function handleCreateRoomResponse(error, response) {
                if (error) {
                    that._logger.error('Request to get room info failed with error [%s]', error);

                    return callback(error, null);
                }

                var result = {status: response.status};

                if (response.status !== 'ok') {
                    that._logger.warn('Request to get room info failed with status [%s]', response.status);

                    return callback(null, result);
                }

                result.room = _.freeze(createImmutableRoomFromResponse.call(this, response));

                callback(null, result);
            }
        );
    }

    function createRoomRequest(room, callback) {
        this._authService.assertAuthorized();

        var that = this;

        var validatedRoom = getValidRoomObject(room);

        this._protocol.createRoom(validatedRoom, function handleCreateRoomResponse(error, response) {
            if (error) {
                that._logger.error('Creating room failed with error [%s]', error);

                return callback(error, null);
            }

            var result = {status: response.status};

            if (response.status !== 'ok' && response.status !== 'already-exists') {
                that._logger.warn('Creating room failed with status [%s]', response.status);

                return callback(null, result);
            }

            result.room = _.freeze(createImmutableRoomFromResponse.call(this, response));

            callback(null, result);
        });
    }

    function getValidRoomObject(room) {
        var roomService = this;

        return (new Room(roomService, '', room.alias, room.name, room.description, room.type, [], room.bridgeId, room.pin)).toJson();
    }

    function enterRoomRequest(roomId, alias, callback) {
        var activeRoom = this._activeRoom.getValue();

        if (activeRoom) {
            var isSameRoom = roomId === activeRoom.getRoomId() || alias === activeRoom.getObservableAlias().getValue();

            this._logger.info('Unable to join room. Already in [%s]/[%s] room.', activeRoom.getRoomId(), activeRoom.getObservableAlias().getValue());

            return callback(null, _.assign({room: activeRoom}, isSameRoom ? alreadyInRoomResponse : inAnotherRoomResponse));
        }

        this._authService.assertAuthorized();

        var self = this._self.getValue();

        var screenName = self.getObservableScreenName().getValue();
        var role = self.getObservableRole().getValue();
        var selfForRequest = buildMemberForRequest.call(this, self, null);
        var timestamp = _.now();

        this._logger.info('Enter room [%s]/[%s] with screen name [%s] and role [%s]', roomId, alias, screenName, role);

        var that = this;

        this._protocol.enterRoom(roomId, alias, selfForRequest, timestamp,
            function handleEnterRoomResponse(error, response) {
                if (error) {
                    that._logger.error('Joining of room failed with error [%s]', error);

                    return callback(error, null);
                }

                var result = {status: response.status};

                if (response.status !== 'ok') {
                    that._logger.warn('Joining of room failed with status [%s]', response.status);

                    return callback(null, result);
                }

                result.room = initializeRoomAndBuildCache.call(that, response);

                if (response.status === 'ok' && response.self) {
                    that.getSelf()._update(response.self);
                }

                callback(null, result);
            }
        );
    }

    function leaveRoomRequest(callback) {
        if (!this._activeRoom.getValue()) {
            this._logger.info('Unable to leave room. Not currently in a room.');

            return callback(null, notInRoomResponse);
        }

        if (this._isLeavingRoom) {
            return;
        }

        this._authService.assertAuthorized();

        var roomId = this._activeRoom.getValue().getRoomId();
        var timestamp = _.now();

        this._logger.info('Leave room [%s]', roomId);

        var that = this;

        this._isLeavingRoom = true;

        this._protocol.leaveRoom(roomId, timestamp,
            function handleLeaveRoomResponse(error, response) {
                that._isLeavingRoom = false;

                if (error) {
                    that._logger.error('Leaving room failed with error [%s]', error);

                    return callback(error, null);
                }

                var result = {status: response.status};

                if (response.status !== 'ok') {
                    that._logger.warn('Leaving room failed with status [%s]', response.status);

                    return callback(null, result);
                }

                if (that._roomChatService) {
                    that._roomChatService.stop();
                }

                that._roomChatService = null;

                that._activeRoom.setValue(null);
                that._cachedRoom.setValue(null);

                callback(null, result);
            }
        );
    }

    function updateMemberRequest(member, callback) {
        if (!this._activeRoom.getValue()) {
            this._logger.warn('Not in a room. Please Enter a room before updating member.');

            return callback(null, notInRoomResponse);
        }

        this._authService.assertAuthorized();

        var activeRoom = this._activeRoom.getValue();
        var roomId = activeRoom.getRoomId();
        var memberIsSelf = member.getSessionId() === this.getSelf().getSessionId();
        var cachedMember = findMemberInObservableRoom(member.getSessionId(), this._cachedRoom);
        var memberForRequest = buildMemberForRequest.call(this, member, cachedMember);
        var timestamp = _.now();
        var wasSelfAudienceMember = memberIsSelf && !cachedMember;
        var isSelfBecomingAudience = memberIsSelf && memberForRequest.role === memberEnums.roles.audience.name;

        if (wasSelfAudienceMember) {
            memberForRequest.lastUpdate = member.getObservableLastUpdate().getValue();
        }

        this._logger.info('Updating member info for active room [%s]', roomId);

        var that = this;

        this._protocol.updateMember(roomId, memberForRequest, timestamp,
            function handleUpdateMemberResponse(error, response) {
                if (error) {
                    that._logger.error('Update of member failed with error [%s]', error);

                    return callback(error, null);
                }

                var result = {status: response.status};

                if (response.status !== 'ok') {
                    that._logger.warn('Update of member failed with status [%s]', response.status);
                }

                if (response.status === 'ok' && isSelfBecomingAudience && _.isNumber(response.lastUpdate)) {
                    that.getSelf().getObservableLastUpdate().setValue(response.lastUpdate);
                }

                callback(null, result);
            }
        );
    }

    function updateRoomRequest(callback) {
        if (!this._activeRoom.getValue()) {
            this._logger.warn('Not in a room. Please Enter a room before updating member.');

            return callback(null, notInRoomResponse);
        }

        this._authService.assertAuthorized();

        var room = this._activeRoom.getValue();
        var timestamp = _.now();

        var that = this;

        this._protocol.updateRoom(room.toJson(), timestamp,
            function handleUpdateMemberResponse(error, response) {
                if (error) {
                    that._logger.error('Update of room failed with error [%s]', error);

                    return callback(error, null);
                }

                var result = {status: response.status};

                if (response.status !== 'ok') {
                    that._logger.warn('Update of room failed with status [%s]', response.status);
                }

                callback(null, result);
            }
        );
    }

    function createImmutableRoomFromResponse(response) {
        var roomInfo = response.room;
        var members = response.members || [];
        var roomService = this;

        return new ImmutableRoom(roomService, roomInfo.roomId, roomInfo.alias, roomInfo.name, roomInfo.description, roomInfo.type, members, roomInfo.bridgeId, roomInfo.pin);
    }

    function createRoomFromResponse(response) {
        var roomInfo = response.room;
        var members = response.members;
        var roomService = this;

        return new Room(roomService, roomInfo.roomId, roomInfo.alias, roomInfo.name, roomInfo.description, roomInfo.type, members, roomInfo.bridgeId, roomInfo.pin);
    }

    function initializeRoomAndBuildCache(response) {
        var room = createRoomFromResponse.call(this, response);
        var cachedRoom = createRoomFromResponse.call(this, response);

        replaceSelfInstanceInRoom.call(this, room);

        this._activeRoom.setValue(room);
        this._cachedRoom.setValue(cachedRoom);

        return room;
    }

    function replaceSelfInstanceInRoom(room) {
        var self = this._self.getValue();
        var members = room.getObservableMembers().getValue();

        var selfIndex = _.findIndex(members, function(member) {
            return self.getSessionId() === member.getSessionId();
        });

        if (!_.isNumber(selfIndex)) {
            return this._logger.info('Self not in server room model.');
        }

        self._update(members[selfIndex].toJson());

        members[selfIndex] = self;

        room.getObservableMembers().setValue(members);
    }

    return RoomService;
});