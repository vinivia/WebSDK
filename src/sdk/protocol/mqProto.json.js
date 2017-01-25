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
], function () {
    'use strict';

    var mqProto = {
        "package": "mq",
        "messages": [
            {
                "name": "Request",
                "fields": [
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "requestId",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "type",
                        "id": 3
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "encoding",
                        "id": 4
                    },
                    {
                        "rule": "required",
                        "type": "bytes",
                        "name": "payload",
                        "id": 5
                    }
                ]
            },
            {
                "name": "Response",
                "fields": [
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "requestId",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "type",
                        "id": 3
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "encoding",
                        "id": 4
                    },
                    {
                        "rule": "required",
                        "type": "bytes",
                        "name": "payload",
                        "id": 5
                    },
                    {
                        "rule": "repeated",
                        "type": "double",
                        "name": "wallTime",
                        "id": 6
                    }
                ]
            },
            {
                "name": "Error",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "reason",
                        "id": 1
                    }
                ]
            },
            {
                "name": "PingPong",
                "fields": [
                    {
                        "rule": "required",
                        "type": "uint64",
                        "name": "originTimestamp",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "uint64",
                        "name": "count",
                        "id": 2
                    }
                ]
            }
        ]
    };

    return mqProto;
});