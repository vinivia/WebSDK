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
    var pcastProto = '{"package": "pcast","messages": [{"name": "Authenticate","fields": [{"rule": "optional","type": "uint32","name": "apiVersion","id": 9,"options": {"default": 0}},{"rule": "required","type": "string","name": "clientVersion","id": 1},{"rule": "required","type": "string","name": "deviceId","id": 2},{"rule": "required","type": "string","name": "platform","id": 3},{"rule": "required","type": "string","name": "platformVersion","id": 4},{"rule": "required","type": "string","name": "authenticationToken","id": 5},{"rule": "optional","type": "string","name": "connectionId","id": 6},{"rule": "optional","type": "string","name": "connectionRouteKey","id": 10},{"rule": "optional","type": "string","name": "sessionId","id": 7},{"rule": "optional","type": "string","name": "applicationId","id": 8}]},{"name": "AuthenticateResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1},{"rule": "optional","type": "string","name": "sessionId","id": 2},{"rule": "optional","type": "string","name": "redirect","id": 3}]},{"name": "Bye","fields": [{"rule": "required","type": "string","name": "sessionId","id": 1}]},{"name": "ByeResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1}]},{"name": "SessionDescription","fields": [{"rule": "required","type": "Type","name": "type","id": 1,"options": {"default": "Offer"}},{"rule": "required","type": "string","name": "sdp","id": 2}],"enums": [{"name": "Type","values": [{"name": "Offer","id": 0},{"name": "Answer","id": 1}]}]},{"name": "CreateStream","fields": [{"rule": "required","type": "string","name": "sessionId","id": 1},{"rule": "optional","type": "string","name": "originStreamId","id": 2},{"rule": "repeated","type": "string","name": "options","id": 3},{"rule": "repeated","type": "string","name": "tags","id": 4},{"rule": "optional","type": "SetRemoteDescription","name": "setRemoteDescription","id": 5},{"rule": "optional","type": "CreateOfferDescription","name": "createOfferDescription","id": 6}]},{"name": "CreateStreamResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1},{"rule": "optional","type": "string","name": "streamId","id": 2},{"rule": "optional","type": "string","name": "instanceRouteKey","id": 5},{"rule": "optional","type": "SetRemoteDescriptionResponse","name": "setRemoteDescriptionResponse","id": 3},{"rule": "optional","type": "CreateOfferDescriptionResponse","name": "createOfferDescriptionResponse","id": 4}]},{"name": "SetRemoteDescription","fields": [{"rule": "required","type": "string","name": "streamId","id": 1},{"rule": "required","type": "SessionDescription","name": "sessionDescription","id": 2},{"rule": "optional","type": "uint32","name": "apiVersion","id": 3,"options": {"default": 0}}]},{"name": "SetRemoteDescriptionResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1},{"rule": "optional","type": "SessionDescription","name": "sessionDescription","id": 2}]},{"name": "CreateOfferDescription","fields": [{"rule": "required","type": "string","name": "streamId","id": 1},{"rule": "repeated","type": "string","name": "options","id": 2},{"rule": "optional","type": "uint32","name": "apiVersion","id": 3,"options": {"default": 0}}]},{"name": "CreateOfferDescriptionResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1},{"rule": "required","type": "SessionDescription","name": "sessionDescription","id": 2}]},{"name": "UpdateStreamState","fields": [{"rule": "required","type": "string","name": "streamId","id": 1},{"rule": "required","type": "string","name": "signalingState","id": 2},{"rule": "required","type": "string","name": "iceGatheringState","id": 3},{"rule": "required","type": "string","name": "iceConnectionState","id": 4}]},{"name": "DestroyStream","fields": [{"rule": "required","type": "string","name": "streamId","id": 1},{"rule": "optional","type": "string","name": "reason","id": 2}]},{"name": "DestroyStreamResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1}]},{"name": "StreamStarted","fields": [{"rule": "required","type": "string","name": "sessionId","id": 1},{"rule": "required","type": "string","name": "streamId","id": 2},{"rule": "repeated","type": "string","name": "tags","id": 3}]},{"name": "StreamEnded","fields": [{"rule": "required","type": "string","name": "sessionId","id": 1},{"rule": "required","type": "string","name": "streamId","id": 2},{"rule": "required","type": "string","name": "reason","id": 3}]},{"name": "SetupStream","fields": [{"rule": "required","type": "string","name": "streamToken","id": 1},{"rule": "required","type": "CreateStream","name": "createStream","id": 2}]},{"name": "SetupStreamResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1},{"rule": "optional","type": "CreateStreamResponse","name": "createStreamResponse","id": 2}]},{"name": "EndStream","fields": [{"rule": "required","type": "string","name": "streamId","id": 1},{"rule": "optional","type": "string","name": "reason","id": 2,"options": {"default": "ended"}}]},{"name": "EndStreamResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1}]}]}';

    function MQProtocol() {
        var builder = ProtoBuf.loadJson(mqProto);

        builder = ProtoBuf.loadJson(pcastProto, builder);

        this._builders = builder.build();
        this._apiVersion = 1;
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

        return builder.decode(value);
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

    return MQProtocol;
});
