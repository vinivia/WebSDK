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

    var pcastProto = {
        "package": "pcast",
        "messages": [
            {
                "name": "Authenticate",
                "fields": [
                    {
                        "rule": "optional",
                        "type": "uint32",
                        "name": "apiVersion",
                        "id": 9,
                        "options": {
                            "default": 0
                        }
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "clientVersion",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "device",
                        "id": 12
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "deviceId",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "manufacturer",
                        "id": 13
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "platform",
                        "id": 3
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "platformVersion",
                        "id": 4
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "authenticationToken",
                        "id": 5
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "connectionId",
                        "id": 6
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "connectionRouteKey",
                        "id": 10
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "remoteAddress",
                        "id": 11
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "sessionId",
                        "id": 7
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "applicationId",
                        "id": 8
                    }
                ]
            },
            {
                "name": "AuthenticateResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "sessionId",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "redirect",
                        "id": 3
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "roles",
                        "id": 4
                    }
                ]
            },
            {
                "name": "Bye",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "reason",
                        "id": 2
                    }
                ]
            },
            {
                "name": "ByeResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    }
                ]
            },
            {
                "name": "SessionDescription",
                "fields": [
                    {
                        "rule": "required",
                        "type": "Type",
                        "name": "type",
                        "id": 1,
                        "options": {
                            "default": "Offer"
                        }
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sdp",
                        "id": 2
                    }
                ],
                "enums": [
                    {
                        "name": "Type",
                        "values": [
                            {
                                "name": "Offer",
                                "id": 0
                            },
                            {
                                "name": "Answer",
                                "id": 1
                            }
                        ]
                    }
                ]
            },
            {
                "name": "CreateStream",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "originStreamId",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 3
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "connectUri",
                        "id": 8
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "connectOptions",
                        "id": 9
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "tags",
                        "id": 4
                    },
                    {
                        "rule": "optional",
                        "type": "SetRemoteDescription",
                        "name": "setRemoteDescription",
                        "id": 5
                    },
                    {
                        "rule": "optional",
                        "type": "CreateOfferDescription",
                        "name": "createOfferDescription",
                        "id": 6
                    },
                    {
                        "rule": "optional",
                        "type": "CreateAnswerDescription",
                        "name": "createAnswerDescription",
                        "id": 7
                    }
                ]
            },
            {
                "name": "CreateStreamResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "streamId",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "instanceRouteKey",
                        "id": 5
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "streamUris",
                        "id": 8
                    },
                    {
                        "rule": "optional",
                        "type": "SetRemoteDescriptionResponse",
                        "name": "setRemoteDescriptionResponse",
                        "id": 3
                    },
                    {
                        "rule": "optional",
                        "type": "CreateOfferDescriptionResponse",
                        "name": "createOfferDescriptionResponse",
                        "id": 4
                    },
                    {
                        "rule": "optional",
                        "type": "CreateAnswerDescriptionResponse",
                        "name": "createAnswerDescriptionResponse",
                        "id": 6
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 7
                    }
                ]
            },
            {
                "name": "SetLocalDescription",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "SessionDescription",
                        "name": "sessionDescription",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "uint32",
                        "name": "apiVersion",
                        "id": 3,
                        "options": {
                            "default": 0
                        }
                    }
                ]
            },
            {
                "name": "SetLocalDescriptionResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 2
                    }
                ]
            },
            {
                "name": "SetRemoteDescription",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "SessionDescription",
                        "name": "sessionDescription",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "uint32",
                        "name": "apiVersion",
                        "id": 3,
                        "options": {
                            "default": 0
                        }
                    }
                ]
            },
            {
                "name": "SetRemoteDescriptionResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "SessionDescription",
                        "name": "sessionDescription",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 3
                    }
                ]
            },
            {
                "name": "CreateOfferDescription",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 1
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "uint32",
                        "name": "apiVersion",
                        "id": 3,
                        "options": {
                            "default": 0
                        }
                    }
                ]
            },
            {
                "name": "CreateOfferDescriptionResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "SessionDescription",
                        "name": "sessionDescription",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 3
                    }
                ]
            },
            {
                "name": "CreateAnswerDescription",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 1
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "uint32",
                        "name": "apiVersion",
                        "id": 3,
                        "options": {
                            "default": 0
                        }
                    }
                ]
            },
            {
                "name": "CreateAnswerDescriptionResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "SessionDescription",
                        "name": "sessionDescription",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 3
                    }
                ]
            },
            {
                "name": "IceCandidate",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "candidate",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "uint32",
                        "name": "sdpMLineIndex",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sdpMid",
                        "id": 3
                    }
                ]
            },
            {
                "name": "AddIceCandidates",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 1
                    },
                    {
                        "rule": "repeated",
                        "type": "IceCandidate",
                        "name": "candidates",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 3
                    },
                    {
                        "rule": "optional",
                        "type": "uint32",
                        "name": "apiVersion",
                        "id": 4,
                        "options": {
                            "default": 0
                        }
                    }
                ]
            },
            {
                "name": "AddIceCandidatesResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 2
                    }
                ]
            },
            {
                "name": "UpdateStreamState",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "signalingState",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "iceGatheringState",
                        "id": 3
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "iceConnectionState",
                        "id": 4
                    },
                    {
                        "rule": "optional",
                        "type": "uint32",
                        "name": "apiVersion",
                        "id": 5,
                        "options": {
                            "default": 0
                        }
                    }
                ]
            },
            {
                "name": "UpdateStreamStateResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 2
                    }
                ]
            },
            {
                "name": "DestroyStream",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "reason",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 3
                    }
                ]
            },
            {
                "name": "DestroyStreamResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    }
                ]
            },
            {
                "name": "ArchiveStream",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 1
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 2
                    }
                ]
            },
            {
                "name": "ArchiveStreamResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "uri",
                        "id": 2
                    }
                ]
            },
            {
                "name": "ConnectionDisconnected",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "connectionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "uint32",
                        "name": "reasonCode",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "description",
                        "id": 3
                    }
                ]
            },
            {
                "name": "ConnectionDisconnectedResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    }
                ]
            },
            {
                "name": "StreamStarted",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "tags",
                        "id": 3
                    }
                ]
            },
            {
                "name": "SourceStreamStarted",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "capabilities",
                        "id": 3
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "tags",
                        "id": 4
                    }
                ]
            },
            {
                "name": "StreamEnded",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "reason",
                        "id": 3
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "tags",
                        "id": 4
                    }
                ]
            },
            {
                "name": "SourceStreamEnded",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "reason",
                        "id": 3
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "capabilities",
                        "id": 4
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "tags",
                        "id": 5
                    }
                ]
            },
            {
                "name": "StreamEndedResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    }
                ]
            },
            {
                "name": "StreamIdle",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 3
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "tags",
                        "id": 4
                    }
                ]
            },
            {
                "name": "StreamArchived",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "uri",
                        "id": 3
                    }
                ]
            },
            {
                "name": "SessionEnded",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "reason",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "float",
                        "name": "duration",
                        "id": 3
                    }
                ]
            },
            {
                "name": "ForwardToClient",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "connectionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "type",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "bytes",
                        "name": "payload",
                        "id": 3
                    }
                ]
            },
            {
                "name": "ForwardToClientResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    }
                ]
            },
            {
                "name": "SetupStream",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamToken",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "CreateStream",
                        "name": "createStream",
                        "id": 2
                    }
                ]
            },
            {
                "name": "SetupStreamResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "CreateStreamResponse",
                        "name": "createStreamResponse",
                        "id": 2
                    }
                ]
            },
            {
                "name": "SetupPlaylistStream",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamToken",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 3
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "tags",
                        "id": 4
                    }
                ]
            },
            {
                "name": "PlaylistStreamManifest",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "manifest",
                        "id": 1
                    }
                ]
            },
            {
                "name": "SetupPlaylistStreamResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "repeated",
                        "type": "PlaylistStreamManifest",
                        "name": "manifests",
                        "id": 2
                    }
                ]
            },
            {
                "name": "StreamDataQuality",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "uint64",
                        "name": "timestamp",
                        "id": 3
                    },
                    {
                        "rule": "required",
                        "type": "DataQualityStatus",
                        "name": "status",
                        "id": 4
                    },
                    {
                        "rule": "required",
                        "type": "DataQualityReason",
                        "name": "reason",
                        "id": 5
                    }
                ],
                "enums": [
                    {
                        "name": "DataQualityStatus",
                        "values": [
                            {
                                "name": "NoData",
                                "id": 0
                            },
                            {
                                "name": "AudioOnly",
                                "id": 1
                            },
                            {
                                "name": "All",
                                "id": 2
                            }
                        ]
                    },
                    {
                        "name": "DataQualityReason",
                        "values": [
                            {
                                "name": "None",
                                "id": 0
                            },
                            {
                                "name": "UploadLimited",
                                "id": 1
                            },
                            {
                                "name": "DownloadLimited",
                                "id": 2
                            },
                            {
                                "name": "PublisherLimited",
                                "id": 3
                            },
                            {
                                "name": "NetworkLimited",
                                "id": 4
                            }
                        ]
                    }
                ]
            },
            {
                "name": "StreamDataQualityResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    }
                ]
            },
            {
                "name": "CallbackEvent",
                "fields": [
                    {
                        "rule": "optional",
                        "type": "uint32",
                        "name": "apiVersion",
                        "id": 1,
                        "options": {
                            "default": 0
                        }
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "entity",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "what",
                        "id": 3
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "data",
                        "id": 4
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "sessionId",
                        "id": 5
                    }
                ]
            },
            {
                "name": "Uri",
                "fields": [
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "protocol",
                        "id": 1,
                        "options": {
                            "default": "http"
                        }
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "host",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "uint32",
                        "name": "port",
                        "id": 3,
                        "options": {
                            "default": 80
                        }
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "method",
                        "id": 4,
                        "options": {
                            "default": "POST"
                        }
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "path",
                        "id": 5,
                        "options": {
                            "default": "/"
                        }
                    }
                ]
            },
            {
                "name": "SetApplicationCallback",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "applicationId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "secret",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "Uri",
                        "name": "callback",
                        "id": 3
                    }
                ]
            },
            {
                "name": "SetApplicationCallbackResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    }
                ]
            },
            {
                "name": "IssueAuthenticationToken",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "applicationId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "secret",
                        "id": 2
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "capabilities",
                        "id": 3
                    }
                ]
            },
            {
                "name": "IssueAuthenticationTokenResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "authenticationToken",
                        "id": 2
                    }
                ]
            },
            {
                "name": "IssueStreamToken",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "applicationId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "secret",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "sessionId",
                        "id": 3
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "originStreamId",
                        "id": 4
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "capabilities",
                        "id": 5
                    }
                ]
            },
            {
                "name": "IssueStreamTokenResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "streamToken",
                        "id": 2
                    }
                ]
            },
            {
                "name": "TerminateStream",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "applicationId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "secret",
                        "id": 2
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 3
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "reason",
                        "id": 4
                    }
                ]
            },
            {
                "name": "TerminateStreamResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    }
                ]
            },
            {
                "name": "Stream",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "streamId",
                        "id": 1
                    }
                ]
            },
            {
                "name": "ListStreams",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "applicationId",
                        "id": 1
                    },
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "secret",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "start",
                        "id": 3
                    },
                    {
                        "rule": "required",
                        "type": "uint32",
                        "name": "length",
                        "id": 4
                    },
                    {
                        "rule": "repeated",
                        "type": "string",
                        "name": "options",
                        "id": 5
                    }
                ]
            },
            {
                "name": "ListStreamsResponse",
                "fields": [
                    {
                        "rule": "required",
                        "type": "string",
                        "name": "status",
                        "id": 1
                    },
                    {
                        "rule": "optional",
                        "type": "string",
                        "name": "start",
                        "id": 2
                    },
                    {
                        "rule": "optional",
                        "type": "uint32",
                        "name": "length",
                        "id": 3
                    },
                    {
                        "rule": "repeated",
                        "type": "Stream",
                        "name": "streams",
                        "id": 4
                    }
                ]
            }
        ]
    };

    return pcastProto;
});