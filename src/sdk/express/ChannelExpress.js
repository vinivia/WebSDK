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
    './RoomExpress',
    '../room/ChannelService',
    '../room/Channel',
    './MemberSelector',
    '../room/Stream',
    '../room/room.json',
    '../room/member.json',
    '../room/stream.json'
], function(_, assert, observable, disposable, RoomExpress, ChannelService, Channel, MemberSelector, Stream, roomEnums, memberEnums, streamEnums) {
    'use strict';

    var defaultReconnectOptions = {
        maxOfflineTime: 24 * 60 * 60 * 1000, // 1 day
        maxReconnectFrequency: 60 * 1000 // 60 seconds
    };

    function ChannelExpress(options) {
        assert.isObject(options, 'options');

        if (options.roomExpress) {
            assert.isObject(options.roomExpress, 'options.roomExpress');
        } else {
            assert.isStringNotEmpty(options.backendUri, 'options.backendUri');
            assert.isObject(options.authenticationData, 'options.authenticationData');
        }

        var channelExpressOptions = _.assign({reconnectOptions: defaultReconnectOptions}, options);

        this._roomExpress = options.roomExpress || new RoomExpress(channelExpressOptions);
        this._shouldDisposeOfRoomExpress = !options.roomExpress;
        this._logger = this._roomExpress.getPCastExpress().getPCast().getLogger();
    }

    ChannelExpress.prototype.dispose = function dispose() {
        if (this._shouldDisposeOfRoomExpress) {
            this._roomExpress.dispose();
        }

        this._logger.info('Disposed Channel Express Instance');
    };

    ChannelExpress.prototype.getRoomExpress = function getPCastExpress() {
        return this._roomExpress;
    };

    ChannelExpress.prototype.getPCastExpress = function getPCastExpress() {
        return this._roomExpress.getPCastExpress();
    };

    ChannelExpress.prototype.createChannel = function createChannel(options, callback) {
        assert.isObject(options, 'options');
        assert.isObject(options.channel, 'options.channel');

        var createRoomOptions = _.assign({room: options.channel}, options);

        createRoomOptions.room.type = roomEnums.types.channel.name;

        delete createRoomOptions.channel;

        this._roomExpress.createRoom(createRoomOptions, _.bind(wrapResponseWithChannelPrefixesAndContinue, null, callback));
    };

    ChannelExpress.prototype.joinChannel = function joinChannel(options, joinChannelCallback, subscriberCallback) {
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

        if (channelOptions.channelId) {
            channelOptions.roomId = channelOptions.channelId;
        }

        delete channelOptions.channelId;

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
                        lastMediaStream.stop('leave-channel');
                    }

                    leaveRoom(callback);
                };
            }

            wrapResponseWithChannelPrefixesAndContinue(joinChannelCallback, error, channelResponse);
        };

        that._roomExpress.joinRoom(channelOptions, joinRoomCallback, function membersChangedCallback(members, streamErrorStatus) {
            var presenters = _.filter(members, function(member) {
                return member.getObservableRole().getValue() === memberEnums.roles.presenter.name && member.getObservableStreams().getValue().length > 0;
            });
            var forceNewMemberSelection = !!streamErrorStatus || !lastMediaStream || !lastStreamId;
            var selectedPresenter = memberSelector.getNext(presenters, forceNewMemberSelection);
            var presenterStream = selectedPresenter ? selectedPresenter.getObservableStreams().getValue()[0] : null;
            var streamId = presenterStream ? presenterStream.getPCastStreamId() : '';

            if (!selectedPresenter || !presenterStream) {
                if (presenters.length === 0) {
                    memberSelector.reset();
                    lastMediaStream = null;
                    lastStreamId = null;

                    return subscriberCallback(null, {status: 'no-stream-playing'});
                }

                if (streamErrorStatus) {
                    that._logger.info('Unable to find a new presenter to replace stream [%s] that ended in channel [%s] with status [%s] and [%s] black-listed members',
                        lastStreamId, channelId, streamErrorStatus, memberSelector.getNumberOfBlackListedMembers());

                    if (lastStreamId && lastMediaStream) {
                        lastMediaStream.stop('presenter-failure');
                    }

                    return subscriberCallback(null, {status: streamErrorStatus || 'unable-to-recover'});
                }

                return subscriberCallback(null, {status: 'no-stream-playing'});
            }

            if (!checkifStreamingIsAvailable(presenterStream.getUri()) && _.includes(options.capabilities, 'streaming')) {
                that._logger.warn('Streaming is not available for stream [%].', streamId);

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

                    if (lastStreamId && lastMediaStream) {
                        lastMediaStream.stop('same-presenter-failure');
                    }

                    return subscriberCallback(null, {status: streamErrorStatus || 'unable-to-recover'});
                }

                return;
            } else if (lastStreamId && lastMediaStream) {
                lastMediaStream.stop('change-presenter');
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
                    that._logger.info('[%s] Issue with stream [%s]. Trying next member', mediaStreamId, response ? response.status : '', error);

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

            that._roomExpress.subscribeToMemberStream(presenterStream, subscribeOptions, _.bind(mediaStreamCallback, this, streamId));
        });
    };

    ChannelExpress.prototype.publishToChannel = function publishToChannel(options, callback) {
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');

        var channelOptions = _.assign({
            memberRole: memberEnums.roles.presenter.name,
            streamType: streamEnums.types.presentation.name,
            room: options.channel
        }, options);

        channelOptions.room.type = roomEnums.types.channel.name;

        delete channelOptions.channel;

        this._roomExpress.publishToRoom(channelOptions, _.bind(wrapResponseWithChannelPrefixesAndContinue, null, callback));
    };

    ChannelExpress.prototype.publishScreenToChannel = function publishScreenToChannel(options, callback) {
        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');

        var channelOptions = _.assign({
            memberRole: memberEnums.roles.presenter.name,
            streamType: streamEnums.types.presentation.name,
            room: options.channel
        }, options);

        channelOptions.room.type = roomEnums.types.channel.name;

        delete channelOptions.channel;

        this._roomExpress.publishScreenToRoom(channelOptions, _.bind(wrapResponseWithChannelPrefixesAndContinue, null, callback));
    };

    function checkifStreamingIsAvailable(uri) {
        var deferToCreateToken = true;
        var streamInfo = Stream.getInfoFromStreamUri(uri);

        if (_.values(streamInfo).length === 0) {
            return deferToCreateToken;
        }

        // TODO(DY) Remove streamTokenStreaming once apps updated in prod
        return !!streamInfo.streamTokenForLiveStream || !!streamInfo.streamTokenStreaming;
    }

    function wrapResponseWithChannelPrefixesAndContinue(callback, error, response) {
        if (response && response.roomService) {
            response.channelService = new ChannelService(response.roomService);

            delete response.roomService;
        }

        if (response && response.room) {
            response.channel = new Channel(response.room);

            delete response.room;
        }

        callback(error, response);
    }

    return ChannelExpress;
});