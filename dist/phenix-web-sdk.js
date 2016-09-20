/**
 * Copyright 2016 PhenixP2P Inc. All Rights Reserved.
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
define('sdk/MQProtocol', [
        'protobuf'
    ], function (ProtoBuf) {
    'use strict';

    var log = function () {
            console.log.apply(console, arguments);
        } || function () {
        };
    var logError = function () {
            console.error.apply(console, arguments);
        } || log;

    var mqProto = '{"package":"mq","messages":[{"name":"Request","fields":[{"rule":"optional","type":"string","name":"sessionId","id":1},{"rule":"optional","type":"string","name":"requestId","id":2},{"rule":"required","type":"string","name":"type","id":3},{"rule":"optional","type":"string","name":"encoding","id":4},{"rule":"required","type":"bytes","name":"payload","id":5}]},{"name":"Response","fields":[{"rule":"optional","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"requestId","id":2},{"rule":"required","type":"string","name":"type","id":3},{"rule":"optional","type":"string","name":"encoding","id":4},{"rule":"required","type":"bytes","name":"payload","id":5},{"rule":"repeated","type":"double","name":"wallTime","id":6}]},{"name":"Error","fields":[{"rule":"required","type":"string","name":"reason","id":1}]},{"name":"PingPong","fields":[{"rule":"required","type":"uint64","name":"originTimestamp","id":1},{"rule":"optional","type":"uint64","name":"count","id":2}]}]}';
    var pcastProto = '{"package":"pcast","messages":[{"name":"Authenticate","fields":[{"rule":"optional","type":"uint32","name":"apiVersion","id":9,"options":{"default":0}},{"rule":"required","type":"string","name":"clientVersion","id":1},{"rule":"optional","type":"string","name":"device","id":12},{"rule":"required","type":"string","name":"deviceId","id":2},{"rule":"optional","type":"string","name":"manufacturer","id":13},{"rule":"required","type":"string","name":"platform","id":3},{"rule":"required","type":"string","name":"platformVersion","id":4},{"rule":"required","type":"string","name":"authenticationToken","id":5},{"rule":"optional","type":"string","name":"connectionId","id":6},{"rule":"optional","type":"string","name":"connectionRouteKey","id":10},{"rule":"optional","type":"string","name":"remoteAddress","id":11},{"rule":"optional","type":"string","name":"sessionId","id":7},{"rule":"optional","type":"string","name":"applicationId","id":8}]},{"name":"AuthenticateResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"sessionId","id":2},{"rule":"optional","type":"string","name":"redirect","id":3}]},{"name":"Bye","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"reason","id":2}]},{"name":"ByeResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"SessionDescription","fields":[{"rule":"required","type":"Type","name":"type","id":1,"options":{"default":"Offer"}},{"rule":"required","type":"string","name":"sdp","id":2}],"enums":[{"name":"Type","values":[{"name":"Offer","id":0},{"name":"Answer","id":1}]}]},{"name":"CreateStream","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"optional","type":"string","name":"originStreamId","id":2},{"rule":"repeated","type":"string","name":"options","id":3},{"rule":"repeated","type":"string","name":"tags","id":4},{"rule":"optional","type":"SetRemoteDescription","name":"setRemoteDescription","id":5},{"rule":"optional","type":"CreateOfferDescription","name":"createOfferDescription","id":6},{"rule":"optional","type":"CreateAnswerDescription","name":"createAnswerDescription","id":7}]},{"name":"CreateStreamResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"streamId","id":2},{"rule":"optional","type":"string","name":"instanceRouteKey","id":5},{"rule":"optional","type":"SetRemoteDescriptionResponse","name":"setRemoteDescriptionResponse","id":3},{"rule":"optional","type":"CreateOfferDescriptionResponse","name":"createOfferDescriptionResponse","id":4},{"rule":"optional","type":"CreateAnswerDescriptionResponse","name":"createAnswerDescriptionResponse","id":6}]},{"name":"SetLocalDescription","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"required","type":"SessionDescription","name":"sessionDescription","id":2},{"rule":"optional","type":"uint32","name":"apiVersion","id":3,"options":{"default":0}}]},{"name":"SetLocalDescriptionResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"SetRemoteDescription","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"required","type":"SessionDescription","name":"sessionDescription","id":2},{"rule":"optional","type":"uint32","name":"apiVersion","id":3,"options":{"default":0}}]},{"name":"SetRemoteDescriptionResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"SessionDescription","name":"sessionDescription","id":2}]},{"name":"CreateOfferDescription","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"repeated","type":"string","name":"options","id":2},{"rule":"optional","type":"uint32","name":"apiVersion","id":3,"options":{"default":0}}]},{"name":"CreateOfferDescriptionResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"SessionDescription","name":"sessionDescription","id":2}]},{"name":"CreateAnswerDescription","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"repeated","type":"string","name":"options","id":2},{"rule":"optional","type":"uint32","name":"apiVersion","id":3,"options":{"default":0}}]},{"name":"CreateAnswerDescriptionResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"SessionDescription","name":"sessionDescription","id":2}]},{"name":"UpdateStreamState","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"required","type":"string","name":"signalingState","id":2},{"rule":"required","type":"string","name":"iceGatheringState","id":3},{"rule":"required","type":"string","name":"iceConnectionState","id":4}]},{"name":"DestroyStream","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"optional","type":"string","name":"reason","id":2}]},{"name":"DestroyStreamResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"StreamStarted","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"streamId","id":2},{"rule":"repeated","type":"string","name":"tags","id":3}]},{"name":"StreamEnded","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"streamId","id":2},{"rule":"required","type":"string","name":"reason","id":3}]},{"name":"StreamEndedResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"StreamArchived","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"streamId","id":2},{"rule":"required","type":"string","name":"uri","id":3}]},{"name":"SessionEnded","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"reason","id":2},{"rule":"required","type":"float","name":"duration","id":3}]},{"name":"IssueAuthenticationToken","fields":[{"rule":"required","type":"string","name":"applicationId","id":1},{"rule":"required","type":"string","name":"secret","id":2},{"rule":"repeated","type":"string","name":"capabilities","id":3}]},{"name":"IssueAuthenticationTokenResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"authenticationToken","id":2}]},{"name":"IssueStreamToken","fields":[{"rule":"required","type":"string","name":"applicationId","id":1},{"rule":"required","type":"string","name":"secret","id":2},{"rule":"required","type":"string","name":"sessionId","id":3},{"rule":"optional","type":"string","name":"originStreamId","id":4},{"rule":"repeated","type":"string","name":"capabilities","id":5}]},{"name":"IssueStreamTokenResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"streamToken","id":2}]},{"name":"Stream","fields":[{"rule":"required","type":"string","name":"streamId","id":1}]},{"name":"ListStreams","fields":[{"rule":"required","type":"string","name":"applicationId","id":1},{"rule":"required","type":"string","name":"secret","id":2},{"rule":"optional","type":"string","name":"start","id":3},{"rule":"required","type":"uint32","name":"length","id":4}]},{"name":"ListStreamsResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"start","id":2},{"rule":"optional","type":"uint32","name":"length","id":3},{"rule":"repeated","type":"Stream","name":"streams","id":4}]},{"name":"TerminateStream","fields":[{"rule":"required","type":"string","name":"applicationId","id":1},{"rule":"required","type":"string","name":"secret","id":2},{"rule":"required","type":"string","name":"streamId","id":3},{"rule":"optional","type":"string","name":"reason","id":4}]},{"name":"TerminateStreamResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"SetupStream","fields":[{"rule":"required","type":"string","name":"streamToken","id":1},{"rule":"required","type":"CreateStream","name":"createStream","id":2}]},{"name":"SetupStreamResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"CreateStreamResponse","name":"createStreamResponse","id":2}]},{"name":"EndStream","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"optional","type":"string","name":"reason","id":2,"options":{"default":"ended"}}]},{"name":"EndStreamResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"StreamDataQuality","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"streamId","id":2},{"rule":"required","type":"uint64","name":"timestamp","id":3},{"rule":"required","type":"DataQualityStatus","name":"status","id":4},{"rule":"required","type":"DataQualityReason","name":"reason","id":5}],"enums":[{"name":"DataQualityStatus","values":[{"name":"NoData","id":0},{"name":"AudioOnly","id":1},{"name":"All","id":2}]},{"name":"DataQualityReason","values":[{"name":"None","id":0},{"name":"UploadLimited","id":1},{"name":"DownloadLimited","id":2},{"name":"PublisherLimited","id":3},{"name":"NetworkLimited","id":4}]}]},{"name":"StreamDataQualityResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]}]}';
    var chatProto = '{"package":"chat","messages":[{"name":"Room","fields":[{"rule":"optional","type":"string","name":"roomId","id":1},{"rule":"required","type":"string","name":"name","id":2},{"rule":"required","type":"string","name":"description","id":3},{"rule":"required","type":"RoomType","name":"type","id":4},{"rule":"repeated","type":"string","name":"options","id":5}]},{"name":"Stream","fields":[{"rule":"required","type":"StreamType","name":"type","id":1},{"rule":"required","type":"string","name":"uri","id":2},{"rule":"required","type":"TrackState","name":"audioState","id":3},{"rule":"required","type":"TrackState","name":"videoState","id":4}]},{"name":"Member","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"screenName","id":2},{"rule":"required","type":"MemberRole","name":"role","id":3},{"rule":"repeated","type":"Stream","name":"streams","id":4},{"rule":"required","type":"uint64","name":"lastUpdate","id":7}]},{"name":"CreateRoom","fields":[{"rule":"required","type":"Room","name":"room","id":1}]},{"name":"CreateRoomResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"roomId","id":2}]},{"name":"JoinRoom","fields":[{"rule":"required","type":"string","name":"roomId","id":1},{"rule":"required","type":"string","name":"sessionId","id":2},{"rule":"required","type":"Member","name":"member","id":3},{"rule":"repeated","type":"string","name":"options","id":4},{"rule":"required","type":"uint64","name":"timestamp","id":5}]},{"name":"JoinRoomResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"Room","name":"room","id":2},{"rule":"repeated","type":"Member","name":"members","id":3},{"rule":"repeated","type":"string","name":"options","id":4}]},{"name":"UpdateRoom","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"Room","name":"room","id":2},{"rule":"required","type":"uint64","name":"timestamp","id":3}]},{"name":"UpdateRoomResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"UpdateMember","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"Member","name":"member","id":2},{"rule":"repeated","type":"string","name":"options","id":3},{"rule":"required","type":"uint64","name":"timestamp","id":4}]},{"name":"UpdateMemberResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"LeaveRoom","fields":[{"rule":"required","type":"string","name":"roomId","id":1},{"rule":"required","type":"string","name":"sessionId","id":2},{"rule":"required","type":"uint64","name":"timestamp","id":3}]},{"name":"LeaveRoomResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"DestroyRoom","fields":[{"rule":"required","type":"string","name":"roomId","id":1}]},{"name":"DestroyRoomResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"RoomEvent","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"roomId","id":2},{"rule":"required","type":"RoomEventType","name":"eventType","id":3},{"rule":"repeated","type":"Member","name":"members","id":4},{"rule":"optional","type":"Room","name":"room","id":5},{"rule":"repeated","type":"string","name":"options","id":6},{"rule":"required","type":"uint64","name":"timestamp","id":7}]}],"enums":[{"name":"RoomType","values":[{"name":"DirectChat","id":0},{"name":"MultiPartyChat","id":1},{"name":"ModeratedChat","id":2},{"name":"TownHall","id":3}]},{"name":"MemberRole","values":[{"name":"Participant","id":0},{"name":"Moderator","id":1},{"name":"Presenter","id":2},{"name":"Audience","id":3}]},{"name":"RoomEventType","values":[{"name":"MemberJoined","id":0},{"name":"MemberLeft","id":1},{"name":"MemberUpdated","id":2},{"name":"Updated","id":3},{"name":"Ended","id":4}]},{"name":"TrackState","values":[{"name":"Enabled","id":0},{"name":"Disabled","id":1},{"name":"Ended","id":2}]},{"name":"StreamType","values":[{"name":"User","id":0},{"name":"Presentation","id":1}]}]}';

    function MQProtocol() {
        var builder = ProtoBuf.loadJson(mqProto);

        builder = ProtoBuf.loadJson(pcastProto, builder);
        builder = ProtoBuf.loadJson(chatProto, builder);

        this._builders = builder.build();
        this._apiVersion = 2;
    }

    MQProtocol.prototype.getApiVersion = function () {
        return this._apiVersion;
    };

    MQProtocol.prototype.encode = function (type, data) {
        if (typeof type !== 'string') {
            throw new Error("'type' must be a string");
        }
        if (typeof data !== 'object') {
            throw new Error("'data' must be an object");
        }

        var builder = getBuilder.call(this, type);

        return builder.encode(data);
    };

    MQProtocol.prototype.decode = function (type, value) {
        if (typeof type !== 'string') {
            throw new Error("'type' must be a string");
        }

        var builder = getBuilder.call(this, type);

        return stringifyEnums(builder.decode(value));
    };

    function getBuilder(type) {
        var fragments = type.split('.');
        var builder = this._builders;

        for (var i = 0; i < fragments.length - 1; i++) {
            builder = builder[fragments[i]];

            if (!builder) {
                throw new Error('Unsupported type "' + type + '"');
            }
        }

        builder = builder[fragments[fragments.length - 1]];

        if (typeof builder !== 'function') {
            throw new Error('Unsupported type "' + type + '"');
        }

        return builder;
    }

    function stringifyEnums(message) {
        if (message && message.$type && message.$type.children) {
            for (var key in message.$type.children) {
                var child = message.$type.children[key];
                var value = message[child.name];
                var type = child && child.element ? child.element.resolvedType : null;

                if (type && type.className === 'Message' && type.children) {
                    message[child.name] = stringifyEnums(value);
                } else if (type && type.className === 'Enum' && type.children) {
                    var metaValue = null;

                    for (var i = 0; i < type.children.length; i++) {
                        if (type.children[i].id === value) {
                            metaValue = type.children[i];
                            break;
                        }
                    }

                    if (metaValue && metaValue.name) {
                        message[child.name] = metaValue.name;
                    }
                }
            }
        }

        return message;
    }

    return MQProtocol;
});

define('sdk/PhenixPCast', [
        'sdk/PhenixProtocol',
        'phenix-rtc'
    ], function (PhenixProtocol, phenixRTC) {
    'use strict';

    var log = function () {
            console.log.apply(console, arguments);
        } || function () {
        };
    var logError = function () {
            console.error.apply(console, arguments);
        } || log;

    var peerConnectionConfig = {
        'iceServers': [
            {
                url: 'stun:stun.l.google.com:19302'
            }, {
                url: 'stun:stun1.l.google.com:19302'
            }, {
                url: 'stun:stun2.l.google.com:19302'
            }, {
                url: 'stun:stun3.l.google.com:19302'
            }, {
                url: 'stun:stun4.l.google.com:19302'
            }
        ]
    };
    var peerConnectionConstraints = {
        'optional': [
            {
                DtlsSrtpKeyAgreement: false
            }, {
                RtpDataChannels: false
            }
        ]
    };
    var sendingConstraints = {
        mandatory: {
            OfferToReceiveVideo: false,
            OfferToReceiveAudio: false
        }
    };
    var receivingConstraints = {
        mandatory: {
            OfferToReceiveVideo: true,
            OfferToReceiveAudio: true
        }
    };
    var defaultPCastUri = 'https://pcast.phenixp2p.com';
    var defaultChromePCastScreenSharingExtensionId = 'icngjadgidcmifnehjcielbmiapkhjpn';
    var defaultFirefoxPCastScreenSharingAddOn = {
        url: 'https://addons.mozilla.org/firefox/downloads/file/474686/pcast_screen_sharing-1.0.3-an+fx.xpi',
        iconUrl: 'https://phenixp2p.com/public/images/phenix-logo-unicolor-64x64.png',
        hash: 'sha256:4972e9718ea7f7c896abc12d1a9e664d5f3efe498539b082ab7694f9d7af4f3b'
    };
    var firefoxInstallationCheckInterval = 100;
    var firefoxMaxInstallationChecks = 450;

    function PhenixPCast(options) {
        options = options || {};
        this._baseUri = options.uri || defaultPCastUri;
        this._deviceId = options.deviceId || undefined;
        this._screenSharingExtensionId = options.screenSharingExtensionId || defaultChromePCastScreenSharingExtensionId;
        this._screenSharingAddOn = options.screenSharingAddOn || defaultFirefoxPCastScreenSharingAddOn;
        this._screenSharingEnabled = false;
        this._status = 'offline';

        if (phenixRTC.browser === 'Chrome' && this._screenSharingExtensionId) {
            addLinkHeaderElement.call(this);
        }

        phenixRTC.addEventListener(window, 'unload', function (pcast) {
            return function () {
                pcast.stop();
            }
        }(this));
    }

    PhenixPCast.prototype.getBaseUri = function () {
        return this._baseUri;
    };

    PhenixPCast.prototype.getStatus = function () {
        return this._status;
    };

    PhenixPCast.prototype.start = function (authToken, authenticationCallback, onlineCallback, offlineCallback) {
        if (typeof authToken !== 'string') {
            throw new Error('"authToken" must be a string');
        }
        if (typeof authenticationCallback !== 'function') {
            throw new Error('"authenticationCallback" must be a function');
        }
        if (typeof onlineCallback !== 'function') {
            throw new Error('"onlineCallback" must be a function');
        }
        if (typeof offlineCallback !== 'function') {
            throw new Error('"offlineCallback" must be a function');
        }

        if (this._started) {
            throw new Error('"Already started"');
        }

        this._stopped = false;
        this._started = true;
        this._authToken = authToken;
        this._authenticationCallback = authenticationCallback;
        this._onlineCallback = onlineCallback;
        this._offlineCallback = offlineCallback;
        this._status = 'connecting';

        this._peerConnections = {};
        this._mediaStreams = {};
        this._renderer = {};
        this._publishers = {};
        this._gumStreams = [];

        var that = this;

        checkForScreenSharingCapability.call(that, function (screenSharingEnabled) {
            that._screenSharingEnabled = screenSharingEnabled;

            resolveUri.call(that, that._baseUri, function (err, uri) {
                if (err) {
                    logError('Failed to connect to ' + that._baseUri, err);

                    transitionToStatus.call(that, 'offline');
                    that._authenticationCallback.call(that, that, 'unauthorized', '');

                    that._stopped = true;
                    that._started = false;

                    return;
                }

                log('Discovered end point "' + uri + '"');

                that._protocol = new PhenixProtocol(uri, that._deviceId);

                that._protocol.on('connected', connected.bind(that));
                that._protocol.on('disconnected', disconnected.bind(that));
                that._protocol.on('streamEnded', streamEnded.bind(that));
                that._protocol.on('dataQuality', dataQuality.bind(that));
            });
        });
    };

    PhenixPCast.prototype.stop = function () {
        if (!this._started) {
            return;
        }

        this._stopped = true;
        this._started = false;

        delete this._authenticationCallback;

        try {
            var reason = '';

            for (var streamId in this._mediaStreams) {
                if (this._mediaStreams.hasOwnProperty(streamId)) {
                    var mediaStream = this._mediaStreams[streamId];

                    endStream.call(this, streamId, reason);

                    mediaStream.stop(reason);
                }
            }

            for (var streamId in this._renderer) {
                if (this._renderer.hasOwnProperty(streamId)) {
                    var renderer = this._renderer[streamId];

                    renderer.stop(reason);
                }
            }

            for (var streamId in this._publishers) {
                if (this._publishers.hasOwnProperty(streamId)) {
                    var publisher = this._publishers[streamId];

                    endStream.call(this, streamId, reason);

                    publisher.stop(reason);
                }
            }

            for (var streamId in this._peerConnections) {
                if (this._peerConnections.hasOwnProperty(streamId)) {
                    endStream.call(this, streamId, reason);
                }
            }

            for (var i = 0; i < this._gumStreams.length; i++) {
                var tracks = this._gumStreams[i].getTracks();

                for (var j = 0; j < tracks.length; j++) {
                    tracks[j].stop();
                }
            }
        } finally {
            if (this._protocol) {
                this._protocol.disconnect();
            }
        }
    };

    PhenixPCast.prototype.getUserMedia = function (options, callback) {
        if (typeof options !== 'object') {
            throw new Error('"options" must be an object');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        return getUserMedia.call(this, options, callback);
    };

    PhenixPCast.prototype.publish = function (streamToken, mediaStreamToPublish, callback, tags) {
        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }
        if (typeof mediaStreamToPublish !== 'object') {
            throw new Error('"mediaStreamToPublish" must be an object');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }
        tags = tags || [];
        if (!Array.isArray(tags)) {
            throw new Error('"tags" must be an array');
        }

        var that = this;

        this._protocol.createUploader(streamToken, function (response, error) {
            if (error) {
                logError('Failed to create uploader: ' + JSON.stringify(error));

                switch (error.status) {
                    case 'capacity':
                        return callback.call(that, that, error.status);
                    default:
                        return callback.call(that, that, 'failed');
                }
            } else {
                var streamId = response.createStreamResponse.streamId;
                var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;

                createPublisherPeerConnection.call(that, mediaStreamToPublish, streamId, offerSdp, function (phenixPublisher, error) {
                    if (error) {
                        callback.call(that, that, 'failed', null);
                    } else {
                        callback.call(that, that, 'ok', phenixPublisher);
                    }
                });
            }
        })
    };

    PhenixPCast.prototype.subscribe = function (streamToken, callback) {
        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var that = this;

        this._protocol.createDownloader(streamToken, function (response, error) {
            if (error) {
                logError('Failed to create downloader: ' + JSON.stringify(error));

                switch (error.status) {
                    case 'capacity':
                    case 'stream-ended':
                    case 'origin-stream-ended':
                        return callback.call(that, that, error.status);
                    default:
                        return callback.call(that, that, 'failed');
                }
            } else {
                var streamId = response.createStreamResponse.streamId;
                var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;

                createViewerPeerConnection.call(that, streamId, offerSdp, function (phenixMediaStream, error) {
                    if (error) {
                        callback.call(that, that, 'failed', null);
                    } else {
                        callback.call(that, that, 'ok', phenixMediaStream);
                    }
                });
            }
        });
    };

    PhenixPCast.prototype.toString = function () {
        return 'PhenixPCast[' + this._sessionId + ',' + this._protocol.toString() + ']';
    };

    function checkForScreenSharingCapability(callback) {
        var that = this;

        if (phenixRTC.browser === 'Chrome' && that._screenSharingExtensionId) {
            try {
                chrome.runtime.sendMessage(that._screenSharingExtensionId, {type: 'version'}, function (response) {
                    if (response && response.status === 'ok') {
                        log('Screen sharing enabled using version "' + response.version + '"');
                        callback(true);
                    } else {
                        log('Screen sharing NOT available');
                        callback(false);
                    }
                });
            } catch (e) {
                if (e.message) {
                    logError(e.message);
                }

                callback(false);
            }
        } else if (phenixRTC.browser === 'Firefox' && typeof window.PCastScreenSharing === 'object') {
            callback(true);
        } else {
            callback(false);
        }
    }

    function getChromeWebStoreLink() {
        return 'https://chrome.google.com/webstore/detail/' + this._screenSharingExtensionId;
    }

    function addLinkHeaderElement() {
        var chromeWebStoreUrl = getChromeWebStoreLink.call(this);

        var links = document.getElementsByTagName('link');

        for (var i = 0; i < links.length; i++) {
            if (links[i].href === chromeWebStoreUrl) {
                // Link already present
                return;
            }
        }

        log('Adding Chrome Web Store link "' + chromeWebStoreUrl + '"');

        var link = document.createElement('link');

        link.rel = 'chrome-webstore-item';
        link.href = chromeWebStoreUrl;

        document.getElementsByTagName('head')[0].appendChild(link);
    }

    function tryInstallChromeScreenSharingExtension(callback) {
        var chromeWebStoreUrl = getChromeWebStoreLink.call(this);

        try {
            chrome.webstore.install(chromeWebStoreUrl, function successCallback() {
                callback('ok');
            }, function failureCallback(reason) {
                if (reason) {
                    logError(reason);
                }

                callback('failed', new Error(reason || 'failed'));
            });
        } catch (e) {
            if (e.message) {
                logError(e.message);
            }

            callback('failed', e);
        }
    }

    function tryInstallFirefoxScreenSharingExtension(callback) {
        try {
            var params = {
                "PCast Screen Sharing": {
                    URL: this._screenSharingAddOn.url,
                    IconURL: this._screenSharingAddOn.iconUrl,
                    Hash: this._screenSharingAddOn.hash,
                    toString: function () {
                        return this.URL;
                    }
                }
            };
            var attemptsLeft = firefoxMaxInstallationChecks;
            var intervalId;
            var success = function success() {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                callback('ok');
            };
            var failure = function failure() {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                callback('failed', new Error('failed'));
            };

            intervalId = setInterval(function () {
                if (typeof window.PCastScreenSharing === 'object') {
                    return success();
                }
                if (attemptsLeft-- < 0) {
                    return failure();
                }
            }, firefoxInstallationCheckInterval);

            InstallTrigger.install(params, function xpiInstallCallback(url, status) {
                // Callback only works for verified sites
                if (status === 0) {
                    success();
                } else {
                    failure();
                }
            });
        } catch (e) {
            if (e.message) {
                logError(e.message);
            }

            callback('failed', e);
        }
    }

    function getScreenSharingConstraints(options, callback) {
        var that = this;

        switch (phenixRTC.browser) {
            case 'Chrome':
                try {
                    chrome.runtime.sendMessage(that._screenSharingExtensionId, {type: 'get-desktop-media'}, function (response) {
                        if (response.status !== 'ok') {
                            return callback(response.status, undefined, new Error(response.status));
                        }

                        var constraints = {
                            video: {}
                        };

                        if (typeof options === 'object' && typeof options.screen === 'object') {
                            constraints.video = options.screen;
                        }

                        if (typeof constraints.video.mandatory !== 'object') {
                            constraints.video.mandatory = {};
                        }

                        constraints.video.mandatory.chromeMediaSource = 'desktop';
                        constraints.video.mandatory.chromeMediaSourceId = response.streamId;

                        callback('ok', constraints, undefined);
                    });
                } catch (e) {
                    if (e.message) {
                        logError(e.message);
                    }

                    callback('failed', undefined, e);
                }
                break;
            case 'Firefox':
                var constraints = {
                    video: {}
                };

                if (typeof options === 'object' && typeof options.screen === 'object') {
                    constraints.video = options.screen;
                }

                constraints.video.mediaSource = 'window';

                callback('ok', constraints, undefined);
                break;
            default:
                callback('not-supported', undefined, new Error('not-supported'));
                break;
        }
    }

    function getUserMediaConstraints(options, callback) {
        var that = this;

        if (options.screen) {
            if (!that._screenSharingEnabled) {
                var installCallback = function installCallback(status) {
                    if (status !== 'ok') {
                        return callback(status, undefined, new Error('screen-sharing-installation-failed'));
                    }

                    checkForScreenSharingCapability.call(that, function (screenSharingEnabled) {
                        that._screenSharingEnabled = screenSharingEnabled;

                        if (!that._screenSharingEnabled) {
                            return callback(status, undefined, new Error('screen-sharing-installation-failed'));
                        }

                        getScreenSharingConstraints.call(that, options, callback);
                    });
                };

                switch (phenixRTC.browser) {
                    case 'Chrome':
                        tryInstallChromeScreenSharingExtension.call(that, installCallback);
                        break;
                    case 'Firefox':
                        tryInstallFirefoxScreenSharingExtension.call(that, installCallback);
                        break;
                    default:
                        callback('not-supported', undefined, new Error('not-supported'));
                        break;
                }
            } else {
                getScreenSharingConstraints.call(that, options, callback);
            }
        } else {
            var constraints = {
                audio: options.audio || false,
                video: options.video || false
            };

            callback('ok', constraints, undefined);
        }
    }

    function getUserMedia(options, callback) {
        var that = this;

        var onUserMediaSuccess = function onUserMediaSuccess(stream) {
            that._gumStreams.push(stream);
            callback(this, 'ok', stream);
        };

        var onUserMediaFailure = function onUserMediaFailure(e) {
            if (e.code === 'unavailable') {
                callback(this, 'conflict', undefined, e);
            } else if (e.message === 'permission-denied') {
                callback(this, 'permission-denied', undefined, e);
            } else if (e.name === 'PermissionDeniedError') { // Chrome
                callback(this, 'permission-denied', undefined, e);
            } else if (e.name === 'InternalError' && e.message === 'Starting video failed') { // FF (old getUserMedia API)
                callback(this, 'conflict', undefined, e);
            } else if (e.name === 'SourceUnavailableError') { // FF
                callback(this, 'conflict', undefined, e);
            } else if (e.name === 'SecurityError' && e.message === 'The operation is insecure.') { // FF
                callback(this, 'permission-denied', undefined, e);
            } else {
                callback(this, 'failed', undefined, e);
            }
        };

        getUserMediaConstraints.call(that, options, function (status, constraints, error) {
            if (status !== 'ok') {
                return onUserMediaFailure(error);
            }

            try {
                phenixRTC.getUserMedia(constraints, onUserMediaSuccess, onUserMediaFailure);
            } catch (e) {
                onUserMediaFailure(e);
            }
        });
    }

    function connected() {
        var that = this;

        this._connected = true;

        if (!this._stopped) {
            this._protocol.authenticate(this._authToken, function (result, error) {
                if (that._authenticationCallback) {
                    if (error) {
                        logError('Failed to authenticate: ' + JSON.stringify(error));
                        transitionToStatus.call(that, 'offline');
                        that._authenticationCallback.call(that, that, 'unauthorized', '');
                        that.stop('unauthorized');
                    } else {
                        transitionToStatus.call(that, 'online');
                        that._authenticationCallback.call(that, that, result.status, result.sessionId);
                    }
                }
            });
        }
    }

    function disconnected() {
        this._connected = false;
        transitionToStatus.call(this, 'offline');
    }

    function getStreamEndedReason(value) {
        switch (value) {
            case '':
            case 'none':
            case 'ended':
                return 'ended';
            case 'server-error':
            case 'not-ready':
            case 'error':
                return 'failed';
            case 'censored':
                return 'censored';
            case 'maintenance':
                return 'maintenance';
            case 'capacity':
                return 'capacity';
            case 'app-background':
                return 'app-background';
            default:
                return 'custom';
        }
    }

    function streamEnded(event) {
        var streamId = event.streamId;
        var reason = event.reason;

        return endStream.call(this, streamId, reason);
    }

    function dataQuality(event) {
        var streamId = event.streamId;
        var status = event.status;
        var reason = event.reason;

        var renderer = this._renderer[streamId];

        if (renderer && typeof renderer.dataQualityChangedCallback === 'function') {
            renderer.dataQualityChangedCallback(renderer, status, reason);
        }

        var publisher = this._publishers[streamId];

        if (publisher && typeof publisher.dataQualityChangedCallback === 'function') {
            publisher.dataQualityChangedCallback(publisher, status, reason);
        }
    }

    function endStream(streamId, reason) {
        log('[' + streamId + '] Stream ended with reason [' + reason + ']');

        var mediaStream = this._mediaStreams[streamId];

        if (mediaStream && typeof mediaStream.streamEndedCallback === 'function') {
            mediaStream.streamEndedCallback(mediaStream, getStreamEndedReason(reason), reason);
        }

        delete this._mediaStreams[streamId];

        var renderer = this._renderer[streamId];

        if (renderer) {
            log('[' + streamId + '] stop media stream');
            mediaStream.stop();
        }

        delete this._renderer[streamId];

        var publisher = this._publishers[streamId];

        if (publisher && typeof publisher.publisherEndedCallback === 'function') {
            publisher.publisherEndedCallback(publisher, getStreamEndedReason(reason), reason);
        }

        delete this._publishers[streamId];

        var peerConnection = this._peerConnections[streamId];

        if (peerConnection && peerConnection.signalingState !== 'closed') {
            log('[' + streamId + '] close peer connection');
            peerConnection.close();
        }

        delete this._peerConnections[streamId];
    }

    function createPublisherPeerConnection(mediaStream, streamId, offerSdp, callback) {
        var that = this;
        var stopped = false;
        var failed = false;
        var pc = new phenixRTC.RTCPeerConnection(peerConnectionConfig, peerConnectionConstraints);

        that._peerConnections[streamId] = pc;

        pc.addStream(mediaStream);

        var onFailure = function onFailure() {
            if (failed) {
                return;
            }

            failed = true;
            stopped = true;

            delete that._peerConnections[streamId];

            if (pc.signalingState !== 'closed') {
                pc.close();
            }

            callback.call(that, undefined, 'failed');
        };

        function onSetRemoteDescriptionSuccess() {
            log('Set remote description (offer)');

            function onCreateAnswerSuccess(answerSdp) {
                log('Created answer: ' + answerSdp.sdp);

                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (response, error) {
                    if (error) {
                        logError('Failed to set answer description: ' + JSON.stringify(error));
                        return onFailure();
                    }

                    function onSetLocalDescriptionSuccess() {
                        var bandwidthAttribute = /(b=AS:([0-9]*)[\n\r]*)/gi;
                        var video = /(mid:video)([\n\r]*)/gi;

                        log('Set local description (answer)');

                        var limit = 0;
                        var bandwithAttribute = bandwidthAttribute.exec(offerSdp);

                        if (bandwithAttribute && bandwithAttribute.length >= 3) {
                            limit = bandwithAttribute[2] * 1000;
                        }

                        var publisher = {
                            getStreamId: function getStreamId() {
                                return streamId;
                            },

                            hasEnded: function hasEnded() {
                                switch (pc.iceConnectionState) {
                                    case 'new':
                                    case 'checking':
                                    case 'connected':
                                    case 'completed':
                                        return false;
                                    case 'disconnected':
                                    case 'failed':
                                    case 'closed':
                                        return true;
                                    default:
                                        return true;
                                }
                            },

                            stop: function stop(reason) {
                                if (pc.signalingState !== 'closed') {
                                    pc.close();
                                }

                                if (stopped) {
                                    return;
                                }

                                that._protocol.destroyStream(streamId, reason || '', function (value, error) {
                                    if (error) {
                                        logError('[' + streamId + '] failed to destroy stream');
                                        return;
                                    }

                                    log('[' + streamId + '] destroyed stream');
                                });

                                stopped = true;
                            },

                            setPublisherEndedCallback: function setPublisherEndedCallback(callback) {
                                if (typeof callback !== 'function') {
                                    throw new Error('"callback" must be a function');
                                }

                                this.publisherEndedCallback = callback;
                            },

                            setPublisherErrorCallback: function setPublisherErrorCallback(callback) {
                                if (typeof callback !== 'function') {
                                    throw new Error('"callback" must be a function');
                                }

                                this.publisherErrorCallback = callback;
                            },

                            setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
                                if (typeof callback !== 'function') {
                                    throw new Error('"callback" must be a function');
                                }

                                this.dataQualityChangedCallback = callback;
                            },

                            limitBandwidth: function limitBandwidth(bandwidthLimit) {
                                if (typeof bandwidthLimit !== 'number') {
                                    throw new Error('"bandwidthLimit" must be a number');
                                }

                                var newLimit = limit ? Math.min(bandwidthLimit, limit) : bandwidthLimit;
                                var remoteDescription = pc.remoteDescription;

                                log('Changing bandwidth limit to', newLimit);

                                var updatedSdp = remoteDescription.sdp.replace(bandwidthAttribute, '');

                                // Add new limit in kbps
                                updatedSdp = updatedSdp.replace(video, function (match, videoLine, lineEnding, offset, sdp) {
                                    return [videoLine, lineEnding, 'b=AS:', Math.ceil(newLimit / 1000), lineEnding].join('');
                                });

                                var updatedRemoteDescription = new phenixRTC.RTCSessionDescription({
                                    type: remoteDescription.type,
                                    sdp: updatedSdp
                                });

                                pc.setRemoteDescription(updatedRemoteDescription);

                                return {
                                    dispose: function () {
                                        pc.setRemoteDescription(remoteDescription);
                                    }
                                }
                            }
                        };

                        that._publishers[streamId] = publisher;

                        callback.call(that, publisher);
                    }

                    var sessionDescription = new phenixRTC.RTCSessionDescription({
                        type: 'answer',
                        sdp: response.sessionDescription.sdp
                    });

                    pc.setLocalDescription(sessionDescription, onSetLocalDescriptionSuccess, onFailure);
                });
            }

            pc.createAnswer(onCreateAnswerSuccess, onFailure, sendingConstraints);
        }

        var offerSessionDescription = new phenixRTC.RTCSessionDescription({type: 'offer', sdp: offerSdp});

        pc.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);

        var onIceCandidate = function onIceCandidate(event) {
            var candidate = event.candidate;

            if (candidate) {
                log('[' + streamId + '] ICE candidate (publisher): ' + candidate.sdpMid + ' ' + candidate.sdpMLineIndex + ' ' + candidate.candidate);
            } else {
                log('[' + streamId + '] ICE candidate discovery complete (publisher)');
            }
        };

        phenixRTC.addEventListener(pc, 'icecandidate', onIceCandidate);

        monitorPeerConnection.call(that, pc, streamId, function onFailure() {
            var publisher = that._publishers[streamId];

            if (publisher) {
                logError('[' + streamId + '] Publisher failed');

                if (typeof publisher.publisherEndedCallback === 'function') {
                    return publisher.publisherErrorCallback(publisher, 'client-side-failure');
                }
            }
        });
    }

    function createViewerPeerConnection(streamId, offerSdp, callback) {
        var that = this;
        var failed = false;
        var stopped = false;
        var pc = new phenixRTC.RTCPeerConnection(peerConnectionConfig, peerConnectionConstraints);

        that._peerConnections[streamId] = pc;

        var onAddStream = function onAddStream(event) {
            if (failed) {
                return;
            }

            var stream = event.stream;

            if (!stream) {
                failed = true;
                logError('[' + streamId + '] No remote stream');

                return callback.call(that, undefined, 'failed');
            }

            log('[' + streamId + '] Got a remote stream');

            var mediaStream = {
                createRenderer: function () {
                    return {
                        start: function start(elementToAttachTo) {
                            this.element = phenixRTC.attachMediaStream(elementToAttachTo, stream);

                            that._renderer[streamId] = this;

                            return this.element;
                        },
                        stop: function stop() {
                            if (this.element) {
                                this.element.pause();
                            }

                            delete that._renderer[streamId];
                        },
                        setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
                            if (typeof callback !== 'function') {
                                throw new Error('"callback" must be a function');
                            }

                            this.dataQualityChangedCallback = callback;
                        }
                    };
                },

                setStreamEndedCallback: function setStreamEndedCallback(callback) {
                    if (typeof callback !== 'function') {
                        throw new Error('"callback" must be a function');
                    }

                    this.streamEndedCallback = callback;
                },

                setStreamErrorCallback: function setStreamErrorCallback(callback) {
                    if (typeof callback !== 'function') {
                        throw new Error('"callback" must be a function');
                    }

                    this.streamErrorCallback = callback;
                },

                stop: function stop(reason) {
                    if (pc.signalingState !== 'closed') {
                        pc.close();
                    }

                    var stream = event.stream;

                    if (stream && typeof stream.getTracks === 'function') {
                        var tracks = stream.getTracks();

                        for (var i = 0; i < tracks.length; i++) {
                            var stream = tracks[i];

                            stream.stop();
                        }
                    }

                    if (stopped) {
                        return;
                    }

                    that._protocol.destroyStream(streamId, reason || '', function (value, error) {
                        if (error) {
                            logError('[' + streamId + '] failed to destroy stream');
                            return;
                        }

                        log('[' + streamId + '] destroyed stream');
                    });

                    stopped = true;
                }
            };

            that._mediaStreams[streamId] = mediaStream;

            callback.call(that, mediaStream);
        };

        var onFailure = function onFailure() {
            if (failed) {
                return;
            }

            failed = true;
            delete that._peerConnections[streamId];

            if (pc.signalingState !== 'closed') {
                pc.close();
            }

            callback.call(that, undefined, 'failed');
        };

        phenixRTC.addEventListener(pc, 'addstream', onAddStream);

        function onSetRemoteDescriptionSuccess() {
            log('Set remote description (offer)');

            function onCreateAnswerSuccess(answerSdp) {
                log('Created answer: ' + answerSdp.sdp);

                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (response, error) {
                    if (error) {
                        logError('Failed to set answer description: ' + JSON.stringify(error));
                        return onFailure();
                    }

                    function onSetLocalDescriptionSuccess() {
                        log('Set local description (answer)');
                    }

                    var sessionDescription = new phenixRTC.RTCSessionDescription({
                        type: 'answer',
                        sdp: response.sessionDescription.sdp
                    });

                    pc.setLocalDescription(sessionDescription, onSetLocalDescriptionSuccess, onFailure);
                });
            }

            pc.createAnswer(onCreateAnswerSuccess, onFailure, receivingConstraints);
        }

        var onIceCandidate = function onIceCandidate(event) {
            var candidate = event.candidate;

            if (candidate) {
                log('[' + streamId + '] ICE candidate (viewer): ' + candidate.sdpMid + ' ' + candidate.sdpMLineIndex + ' ' + candidate.candidate);
            } else {
                log('[' + streamId + '] ICE candidate discovery complete (viewer)');
            }
        };

        phenixRTC.addEventListener(pc, 'icecandidate', onIceCandidate);

        var offerSessionDescription = new phenixRTC.RTCSessionDescription({type: 'offer', sdp: offerSdp});

        pc.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);

        monitorPeerConnection.call(that, pc, streamId, function onFailure() {
            var mediaStream = that._mediaStreams[streamId];

            if (mediaStream) {
                logError('[' + streamId + '] Stream failed');

                if (typeof mediaStream.streamErrorCallback === 'function') {
                    return mediaStream.streamErrorCallback(mediaStream, 'client-side-failure');
                }
            }
        });
    }

    function transitionToStatus(newStatus) {
        if (this._status !== newStatus) {
            this._status = newStatus;

            switch (newStatus) {
                case 'connecting':
                    break;
                case 'offline':
                    this._offlineCallback.call(this);
                    break;
                case 'online':
                    this._onlineCallback.call(this);
                    break;
            }
        }
    }

    var measurementsPerEndPoint = 4;
    var maxAttempts = 3;

    function now() {
        if (!Date.now) {
            return new Date().getTime();
        }

        return Date.now();
    }

    function resolveEndPoint(endPoint, measurements, measurementCallback, completeCallback) {
        var measurement = 1;

        var nextMeasurement = function nextMeasurement(endPoint) {
            var maxAttempts = 1;
            var start = now();

            log('[' + measurement + '] Checking end point "' + endPoint + '"');

            httpGetWithRetry(endPoint, function (err, responseText) {
                var end = now();
                var time = end - start;

                log('[' + measurement + '] End point "' + endPoint + '" latency is ' + time + ' ms');

                measurement++;

                if (!err) {
                    if (measurementCallback(endPoint, time, responseText)) {
                        // done
                        return;
                    }
                }

                if (measurement <= measurements) {
                    if (err) {
                        log('Retrying after failure to resolve end point "' + endPoint + '": ' + err);
                    }

                    return nextMeasurement(endPoint);
                } else {
                    return completeCallback(endPoint);
                }
            }, maxAttempts);
        };

        nextMeasurement(endPoint);
    }

    function resolveUri(baseUri, callback) {
        var that = this;

        if (baseUri.lastIndexOf('wss:', 0) === 0) {
            // WSS - Specific web socket end point
            callback.call(that, undefined, baseUri + '/ws');
        } else if (baseUri.lastIndexOf('https:', 0) === 0) {
            // HTTP - Resolve closest end point
            httpGetWithRetry(baseUri + '/pcast/endPoints', function (err, responseText) {
                if (err) {
                    callback(new Error('Failed to resolve an end point', err));
                    return callback(err);
                }

                var endPoints = responseText.split(',');

                if (endPoints.length < 1) {
                    callback(new Error('Failed to discover end points'));
                }

                var done = false;
                var minTime = Number.MAX_VALUE;
                var minResponseText = '';

                for (var i = 0; i < endPoints.length; i++) {
                    resolveEndPoint.call(that,
                        endPoints[i],
                        measurementsPerEndPoint,
                        function measurementCallback(endPoint, time, responseText) {
                            if (time < minTime) {
                                log('Current closest end point is "' + responseText + '" with latency of ' + time + ' ms');
                                minTime = time;
                                minResponseText = responseText;
                            }

                            return done;
                        },
                        function completeCallback(endPoint) {
                            if (minResponseText && minTime < Number.MAX_VALUE) {
                                done = true;
                                return callback.call(that, undefined, minResponseText);
                            }
                        });
                }
            }, maxAttempts);
        } else {
            // Not supported
            callback.call(that, new Error('Uri not supported'));
        }
    }

    function httpGetWithRetry(url, callback, maxAttempts, attempt) {
        if (attempt === undefined) {
            attempt = 1;
        }

        var xhr = new XMLHttpRequest();

        xhr.timeout = 15000;
        xhr.open('GET', url + '?_=' + now(), true);
        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4 /* DONE */) {
                if (xhr.status === 200) {
                    callback(undefined, xhr.responseText);
                } else if (xhr.status >= 500 && xhr.status < 600 && attempt <= maxAttempts) {
                    httpGetWithRetry(url, callback, maxAttempts, attempt + 1);
                } else {
                    log('HTTP GET "' + url + '" failed with "' + xhr.status + '" "' + xhr.statusText + '"');
                    callback(new Error(xhr.status === 0 ? 'timeout' : xhr.statusText));
                }
            }
        });
        xhr.send();
    }

    var defaultMonitoringInterval = 4000;

    function monitorPeerConnection(peerConnection, streamId, failureCallback) {
        var that = this;
        var frameRate = undefined;
        var bitRate = undefined;
        var lastBytesReceived = {time: now(), value: 0};
        var frameRateFailureThreshold = 1;
        var bitRateFailureThreshold = 10000;
        var failureCount = 0;
        var failureCountThreshold = 2;

        function nextCheck() {
            var selector = null;

            getStats(peerConnection, selector, function successCallback(report) {
                var hasFrameRate = false;
                var hasBitRate = false;

                function eachStats(stats, reportId) {
                    switch (phenixRTC.browser) {
                        case 'Firefox':
                            if (stats.type === 'outboundrtp') {
                                if (stats.framerateMean !== undefined) {
                                    hasFrameRate = true;
                                    frameRate = stats.framerateMean;

                                    if (stats.bytesSent !== undefined) {
                                        var currentBytesReceived = {
                                            time: _.now(),
                                            value: stats.bytesSent
                                        };

                                        hasBitRate = true;
                                        bitRate = (8 * (currentBytesReceived.value - lastBytesReceived.value))
                                            / ((currentBytesReceived.time - lastBytesReceived.time) / 1000.0);
                                        lastBytesReceived = currentBytesReceived;
                                    }
                                }
                            }
                            if (stats.type === 'inboundrtp') {
                                if (stats.framerateMean !== undefined) {
                                    // Inbound frame rate is not calculated
                                    if (stats.bytesReceived !== undefined) {
                                        var currentBytesReceived = {
                                            time: _.now(),
                                            value: stats.bytesReceived
                                        };

                                        hasBitRate = true;
                                        bitRate = (8 * (currentBytesReceived.value - lastBytesReceived.value))
                                            / ((currentBytesReceived.time - lastBytesReceived.time) / 1000.0);
                                        lastBytesReceived = currentBytesReceived;
                                    }
                                }
                            }
                            break;
                        default:
                            if (stats.googFrameRateSent !== undefined) {
                                hasFrameRate = true;
                                frameRate = stats.googFrameRateSent;

                                if (stats.bytesSent !== undefined) {
                                    var currentBytesReceived = {
                                        time: _.now(),
                                        value: stats.bytesSent
                                    };

                                    hasBitRate = true;
                                    bitRate = (8 * (currentBytesReceived.value - lastBytesReceived.value))
                                        / ((currentBytesReceived.time - lastBytesReceived.time) / 1000.0);
                                    lastBytesReceived = currentBytesReceived;
                                }
                            } else if (stats.googFrameRateReceived !== undefined) {
                                hasFrameRate = true;
                                frameRate = stats.googFrameRateReceived;

                                if (stats.bytesReceived !== undefined) {
                                    var currentBytesReceived = {
                                        time: _.now(),
                                        value: stats.bytesReceived
                                    };

                                    hasBitRate = true;
                                    bitRate = (8 * (currentBytesReceived.value - lastBytesReceived.value))
                                        / ((currentBytesReceived.time - lastBytesReceived.time) / 1000.0);
                                    lastBytesReceived = currentBytesReceived;
                                }
                            }
                            break;
                    }
                }

                if (report.forEach) {
                    report.forEach(eachStats);
                } else {
                    for (var reportId in report) {
                        var stats = report[reportId];

                        eachStats(stats, reportId);
                    }
                }

                if (hasFrameRate) {
                    log('[' + streamId + '] Current frame rate is ' + frameRate + ' FPS');
                }
                if (hasBitRate) {
                    log('[' + streamId + '] Current bit rate is ' + Math.ceil(bitRate) + ' bps');
                }

                if (frameRate !== undefined && !hasFrameRate) {
                    failureCount++;
                } else if (hasFrameRate && frameRate <= frameRateFailureThreshold) {
                    failureCount++;
                } else if (bitRate !== undefined && !hasBitRate) {
                    failureCount++;
                } else if (hasBitRate && bitRate <= bitRateFailureThreshold) {
                    failureCount++;
                } else {
                    failureCount = 0;
                }

                if (failureCount >= failureCountThreshold) {
                    if (!failureCallback()) {
                        logError('[' + streamId + '] Stream failure detected: ' + JSON.stringify(report));
                    } else {
                        // Failure is acknowledged
                        failureCount = Number.MIN_VALUE;
                        setTimeout(nextCheck, defaultMonitoringInterval);
                    }
                } else if (that._peerConnections[streamId] === peerConnection) {
                    setTimeout(nextCheck, failureCount > 0 ? defaultMonitoringInterval / 2 : defaultMonitoringInterval);
                } else {
                    log('[' + streamId + '] Finished monitoring of peer connection');
                }
            }, function errorCallback(error) {
                if (that._peerConnections[streamId] !== peerConnection) {
                    log('[' + streamId + '] Finished monitoring of peer connection');
                    return;
                }

                if (error) {
                    logError(error.name + ': ' + error.message);
                }

                failureCallback();
            });
        }

        setTimeout(nextCheck, defaultMonitoringInterval);
    }

    function normalizeStatsReport(response) {
        if (phenixRTC.browser === 'Firefox') {
            return response;
        }

        var normalizedReport = {};

        response.result().forEach(function (report) {
            var normalizedStatistics = {
                id: report.id,
                type: report.type
            };

            report.names().forEach(function (name) {
                normalizedStatistics[name] = report.stat(name);
            });

            normalizedReport[normalizedStatistics.id] = normalizedStatistics;
        });

        return normalizedReport;
    }

    function getStats(peerConnection, selector, successCallback, failureCallback) {
        switch (phenixRTC.browser) {
            case  'Firefox':
                return peerConnection.getStats(selector)
                    .then(function (response) {
                        var report = normalizeStatsReport(response);

                        successCallback(report);
                    }).catch(function (e) {
                        failureCallback();
                    });
            default:
                return peerConnection.getStats(function (response) {
                    var report = normalizeStatsReport(response);

                    successCallback(report);
                }, selector, failureCallback);
        }
    }

    return PhenixPCast;
});

define('sdk/PhenixProtocol', [
        'sdk/MQProtocol',
        'ByteBuffer',
        'phenix-rtc'
    ], function (MQProtocol, ByteBuffer, phenixRTC) {
    'use strict';

    var log = function () {
            console.log.apply(console, arguments);
        } || function () {
        };
    var logError = function () {
            console.error.apply(console, arguments);
        } || log;

    function PhenixProtocol(uri, deviceId) {
        this._uri = uri;
        this._deviceId = deviceId || '';
        this._mqProtocol = new MQProtocol();

        log('Connecting to ' + uri);
        this._webSocket = new WebSocket(uri);
        this._webSocket.onopen = onOpen.bind(this);
        this._webSocket.onclose = onClose.bind(this);
        this._webSocket.onmessage = onMessage.bind(this);
        this._webSocket.onerror = onError.bind(this);

        this._nextRequestId = 0;
        this._events = {};
        this._requests = {};
    }

    PhenixProtocol.prototype.on = function (eventName, handler) {
        if (typeof eventName !== 'string') {
            throw new Error('"eventName" must be a string');
        }
        if (typeof handler !== 'function') {
            throw new Error('"handler" must be a function');
        }

        var handlers = getEventHandlers.call(this, eventName);

        handlers.push(handler);
    };

    PhenixProtocol.prototype.authenticate = function (authToken, callback) {
        if (typeof authToken !== 'string') {
            throw new Error('"authToken" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var authenticate = {
            apiVersion: this._mqProtocol.getApiVersion(),
            clientVersion: '2016-09-20T03:16:26Z',
            deviceId: this._deviceId,
            platform: phenixRTC.browser,
            platformVersion: phenixRTC.browserVersion.toString(),
            authenticationToken: authToken
        };

        if (this._sessionId) {
            auth.sessionId = this._sessionId;
        }

        return sendRequest.call(this, 'pcast.Authenticate', authenticate, callback);
    };

    PhenixProtocol.prototype.disconnect = function () {
        delete this._sessionId;

        return this._webSocket.close(1000, 'byebye');
    };

    PhenixProtocol.prototype.bye = function (reason, callback) {
        if (typeof reason !== 'string') {
            throw new Error('"reason" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var bye = {
            sessionId: this._sessionId,
            reason: reason
        };

        return sendRequest.call(this, 'pcast.Bye', bye, callback);
    };

    PhenixProtocol.prototype.createDownloader = function (streamToken, callback) {
        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var browser = phenixRTC.browser || 'UnknownBrowser';
        var browserWithVersion = browser + '-' + (phenixRTC.browserVersion || 0);
        var setupStream = {
            streamToken: streamToken,
            createStream: {
                sessionId: this._sessionId,
                options: ['data-quality-notifications'],
                createOfferDescription: {
                    streamId: '',
                    options: ['download', 'SRTP', browser, browserWithVersion],
                    apiVersion: this._mqProtocol.getApiVersion()
                }
            }
        };

        return sendRequest.call(this, 'pcast.SetupStream', setupStream, callback);
    };

    PhenixProtocol.prototype.createUploader = function (streamToken, callback) {
        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var browser = phenixRTC.browser || 'UnknownBrowser';
        var browserWithVersion = browser + '-' + (phenixRTC.browserVersion || 0);
        var setupStream = {
            streamToken: streamToken,
            createStream: {
                sessionId: this._sessionId,
                options: ['data-quality-notifications'],
                createOfferDescription: {
                    streamId: '',
                    options: ['upload', 'SRTP', browser, browserWithVersion],
                    apiVersion: this._mqProtocol.getApiVersion()
                }
            }
        };

        return sendRequest.call(this, 'pcast.SetupStream', setupStream, callback);
    };

    PhenixProtocol.prototype.setAnswerDescription = function (streamId, sdp, callback) {
        if (typeof streamId !== 'string') {
            throw new Error('"streamId" must be a string');
        }
        if (typeof sdp !== 'string') {
            throw new Error('"sdp" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var setRemoteDescription = {
            streamId: streamId,
            sessionDescription: {
                type: 'Answer',
                sdp: sdp
            },
            apiVersion: this._mqProtocol.getApiVersion()
        };

        return sendRequest.call(this, 'pcast.SetRemoteDescription', setRemoteDescription, callback);
    };

    PhenixProtocol.prototype.destroyStream = function (streamId, reason, callback) {
        if (typeof streamId !== 'string') {
            throw new Error('"streamId" must be a string');
        }
        if (typeof reason !== 'string') {
            throw new Error('"reason" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var destroyStream = {
            streamId: streamId,
            reason: reason
        };

        return sendRequest.call(this, 'pcast.DestroyStream', destroyStream, callback);
    };

    PhenixProtocol.prototype.toString = function () {
        return 'PhenixProtocol[' + this._uri + ',' + this._webSocket.readyState + ']';
    };

    function sendRequest(type, message, callback) {
        var requestId = (this._nextRequestId++).toString();
        var request = {
            requestId: requestId,
            type: type,
            payload: this._mqProtocol.encode(type, message)
        };

        this._requests[requestId] = callback;

        return this._webSocket.send(this._mqProtocol.encode('mq.Request', request).toString('base64'));
    }

    function getEventHandlers(eventName) {
        var handlers = this._events[eventName];

        if (!handlers) {
            this._events[eventName] = handlers = [];
        }

        return handlers;
    }

    function triggerEvent(eventName, args) {
        var handlers = this._events[eventName];

        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].apply(this, args);
            }
        }
    }

    function onOpen(evt) {
        log('Connected');
        triggerEvent.call(this, 'connected');
    }

    function onClose(evt) {
        log('Disconnected [' + evt.code + ']: ' + evt.reason);
        triggerEvent.call(this, 'disconnected', [evt.code, evt.reason]);
    }

    function onMessage(evt) {
        log('>> ' + evt.data);

        var response = this._mqProtocol.decode('mq.Response', ByteBuffer.wrap(evt.data, 'base64'));
        log('>> ' + response.type);

        var message = this._mqProtocol.decode(response.type, response.payload);

        if (response.type === 'pcast.AuthenticateResponse') {
            this._sessionId = message.sessionId;
        } else if (response.type === 'pcast.StreamEnded') {
            triggerEvent.call(this, 'streamEnded', [message]);
        } else if (response.type === 'pcast.StreamDataQuality') {
            triggerEvent.call(this, 'dataQuality', [message]);
        }

        var callback = this._requests[response.requestId];

        if (callback) {
            delete this._requests[response.requestId];

            if (response.type === 'mq.Error' || message.status !== 'ok') {
                callback(undefined, message);
            } else {
                callback(message);
            }
        }
    }

    function onError(evt) {
        logError('Error: ' + evt.data);
    }

    return PhenixProtocol;
});

'use strict';

define('phenix-web-sdk', [
    'sdk/PhenixPCast'
], function (PhenixPCast) {
    window.PhenixPCast = PhenixPCast;

    return {
        PCast: PhenixPCast
    };
});
