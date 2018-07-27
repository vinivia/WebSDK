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
/* global requirejs */
requirejs.config({
    paths: {
        'phenix-web-sdk': 'web-sdk',
        'phenix-rtc': 'phenix-rtc/dist/phenix-rtc-bundled',
        'jquery': 'jquery/dist/jquery.min',
        'lodash': 'lodash/lodash.min',
        'bootstrap': 'bootstrap/dist/js/bootstrap.min',
        'protobuf': 'protobuf/dist/ProtoBuf.min',
        'bootstrap-notify': 'bootstrap-notify/bootstrap-notify.min',
        'fingerprintjs2': 'fingerprintjs2/dist/fingerprint2.min',
        'Long': 'long/dist/long.min',
        'ByteBuffer': 'bytebuffer/dist/ByteBufferAB.min',
        'shaka-player': 'shaka-player/dist/shaka-player.compiled',
        'video-player': 'player',
        'app-setup': 'app-setup',
        'phenix-web-lodash-light': 'phenix-web-lodash-light/dist/phenix-web-lodash-light.min',
        'phenix-web-assert': 'phenix-web-assert/dist/phenix-web-assert.min',
        'phenix-web-http': 'phenix-web-http/dist/phenix-web-http.min',
        'phenix-web-logging': 'phenix-web-logging/dist/phenix-web-logging.min',
        'phenix-web-observable': 'phenix-web-observable/dist/phenix-web-observable',
        'phenix-web-reconnecting-websocket': 'phenix-web-reconnecting-websocket/dist/phenix-web-reconnecting-websocket.min',
        'phenix-web-network-connection-monitor': 'phenix-web-network-connection-monitor/dist/phenix-web-network-connection-monitor.min',
        'phenix-web-proto': 'phenix-web-proto/dist/phenix-web-proto.min',
        'phenix-web-event': 'phenix-web-event/dist/phenix-web-event.min',
        'phenix-web-disposable': 'phenix-web-disposable/dist/phenix-web-disposable.min',
        'phenix-web-closest-endpoint-resolver': 'phenix-web-closest-endpoint-resolver/dist/phenix-web-closest-endpoint-resolver.min',
        'phenix-web-player': 'phenix-web-player/dist/phenix-web-player-bundled.min',
        'phenix-web-application-activity-detector': 'phenix-web-application-activity-detector/dist/phenix-web-application-activity-detector.min'
    }
});

requirejs([
    'jquery',
    'lodash',
    'phenix-web-sdk',
    'shaka-player',
    'video-player',
    'app-setup'
], function($, _, sdk, shaka, Player, app) {
    var publishAndJoinRoomButton = document.getElementById('publishAndJoinRoomButton');
    var stopButton = document.getElementById('stopButton');
    var publishScreenShareButton = document.getElementById('publishScreenButton');
    var stopScreenShareButton = document.getElementById('stopPublishScreenButton');
    var videoList = document.getElementById('videoList');
    var selfVideoList = document.getElementById('selfVideoList');
    var publisher = null;
    var screenPublisher = null;
    var lowQualityPublisher = null;
    var roomService = null;
    var screenName = 'ScreenName' + Math.floor(Math.random() * 10000) + 1; // Helpful if unique but we don't enforce this. You might set this to be an email or a nickname, or both. Then parse it when joining the room.
    var memberRole = 'Participant';
    var membersStore = [];
    var memberSubscriptions = {};
    var videoSources = [];
    var audioSources = [];

    var init = function init() {
        var roomExpress;

        var createRoomExpress = function createPCastExpress() {
            roomExpress = new sdk.express.RoomExpress({
                backendUri: app.getBaseUri() + '/pcast',
                authenticationData: app.getAuthData(),
                uri: app.getUri(),
                shaka: shaka
            });
        };

        sdk.utils.rtc.getSources(function(sources) {
            videoSources = sources.filter(function(source) {
                return source.kind === 'video';
            });
            audioSources = sources.filter(function(source) {
                return source.kind === 'audio';
            });
        });

        function publishVideoAndCameraAtTwoQualitiesAndJoinRoom() {
            if (videoSources.length === 0 || audioSources.length === 0) {
                return setUserMessage('Sources not available yet');
            }

            hideElement(publishAndJoinRoomButton);
            displayElement(stopButton);

            var roomAlias = $('#alias').val();
            var videoElement = createVideo();
            var publishOptions = {
                capabilities: ['fhd', 'prefer-h264'], // Add other capabilities if you like. Prefer-h264 allows publishing/viewing on Safari/IOS 11
                room: {
                    alias: roomAlias,
                    name: roomAlias,
                    type: 'MultiPartyChat'
                }, // Set alias so that you can always uniquely identify room without accessing the return value
                mediaConstraints: {
                    audio: {deviceId: audioSources[0].id},
                    video: {deviceId: videoSources[0].id}
                }, // Use the same deviceIds for both
                screenName: screenName,
                streamType: 'User',
                memberRole: memberRole
            };

            var highQualityOptions = Object.assign({}, publishOptions, {
                videoElement: videoElement, // Bind local user media to this element (no delay)
                resolution: 720,
                frameRate: 15,
                streamInfo: {quality: 'high'} // Pass custom info here
            });
            var lowQualityOptions = Object.assign({}, publishOptions, {
                resolution: 180,
                frameRate: 15,
                streamInfo: {quality: 'low'} // Pass custom info here
            });

            videoElement.setAttribute('muted', true); // Don't want to hear yourself

            return publishAndHandleErrors(highQualityOptions, function(response) {
                publisher = {
                    publisher: response.publisher,
                    videoElement: videoElement
                };

                selfVideoList.append(videoElement);

                if (!roomService) {
                    roomService = response.roomService;

                    joinRoom();
                }

                if (app.getUrlParameter('mq') || app.getUrlParameter('multipleQualities')) {
                    publishAndHandleErrors(lowQualityOptions, function(response) {
                        lowQualityPublisher = {publisher: response.publisher};
                    });
                }
            });
        }

        function publishAndHandleErrors(options, callback) {
            return roomExpress.publishToRoom(options, function(error, response) {
                if (error) {
                    setUserMessage('Unable to publish to Room: ' + error.message);

                    throw error;
                }

                if (response.status !== 'ok' && response.status !== 'ended') {
                    setUserMessage('New Status: ' + response.status);

                    throw new Error(response.status);
                }

                if (response.status === 'ok') {
                    callback(response);
                }
            });
        }

        function joinRoom() {
            var roomAlias = $('#alias').val();

            roomExpress.joinRoom({
                alias: roomAlias,
                role: 'Participant' // Set your role for yourself. Participant will view and interact with other members (must have streams)
            }, function joinRoomCallback(error, response) {
                if (error) {
                    setUserMessage('Unable to publish to Room: ' + error.message);
                    leaveRoomAndStopPublisher();

                    throw error;
                }

                if (response.status !== 'ok' && response.status !== 'ended') {
                    setUserMessage('New Status: ' + response.status);

                    throw new Error(response.status);
                }

                displayElement(publishScreenShareButton);
            }, function membersChangedCallback(members) { // This is triggered every time a member joins or leaves
                if (roomService) { // Else left room
                    console.log('addNewMembers');
                    removeOldMembers(members);
                    addNewMembers(members);
                }
            });
        }

        function removeOldMembers(members) {
            var membersThatLeft = membersStore.filter(function(member) {
                return !members.includes(member);
            });

            membersThatLeft.forEach(function(memberThatLeft) {
                var memberSubscription = memberSubscriptions[memberThatLeft.getSessionId()];

                if (memberSubscription) {
                    memberSubscription.forEach(function(subscription) {
                        removeMemberStream(subscription.memberStream, memberThatLeft.getSessionId());
                    });
                }

                delete memberSubscriptions[memberThatLeft.getSessionId()];
            });

            membersStore = membersStore.filter(function(member) {
                return !membersThatLeft.includes(member);
            });
        }

        function removeMemberStream(memberStream, memberSessionId) {
            var memberSubscriptionToRemove = memberSubscriptions[memberSessionId].find(function(memberSubscription) {
                return memberStream.getPCastStreamId() === memberSubscription.memberStream.getPCastStreamId();
            });

            memberSubscriptions[memberSessionId] = memberSubscriptions[memberSessionId].filter(function(memberSubscription) {
                return memberStream.getPCastStreamId() !== memberSubscription.memberStream.getPCastStreamId();
            });

            if (memberSubscriptionToRemove) {
                memberSubscriptionToRemove.mediaStream.stop();
                memberSubscriptionToRemove.videoElement.remove();
            }
        }

        function addNewMembers(members) {
            var membersThatJoined = members.filter(function(member) {
                return !membersStore.includes(member);
            });

            membersThatJoined.forEach(function(newMember) {
                var memberSessionId = newMember.getSessionId();

                memberSubscriptions[memberSessionId] = [];

                // Listen for changes to member streams. This will happen when the publisher fails and it recovers, or when adding or removing a screen share
                var memberStreamSubscription = newMember.getObservableStreams().subscribe(function(memberStreams) {
                    if (!memberSubscriptions[memberSessionId]) {
                        return memberStreamSubscription.dispose();
                    }

                    // Remove old streams
                    memberSubscriptions[memberSessionId].forEach(function(memberSubscription) {
                        var shouldRemoveMember = !memberStreams.find(function(stream) {
                            return stream.getPCastStreamId() === memberSubscription.memberStream.getPCastStreamId();
                        });

                        if (shouldRemoveMember) {
                            removeMemberStream(memberSubscription.memberStream, memberSessionId);
                        }
                    });

                    // Subscribe to new streams
                    memberStreams.filter(function(memberStream) {
                        return !memberSubscriptions[memberSessionId].find(function(memberSubscription) {
                            return memberStream.getPCastStreamId() === memberSubscription.memberStream.getPCastStreamId();
                        });
                    }).forEach(function(memberStream) {
                        subscribeToMemberStream(memberStream, memberSessionId);
                    });
                });

                newMember.getObservableStreams().getValue().forEach(function(memberStream) {
                    subscribeToMemberStream(memberStream, memberSessionId);
                });
            });

            membersStore = members;
        }

        function subscribeToMemberStream(memberStream, sessionId) {
            var videoElement = createVideo();
            var isSelf = sessionId === roomService.getSelf().getSessionId(); // Check if is yourself!
            var streamInfo = memberStream.getInfo(); // Access the custom stream info params that you passed when publishing

            if (app.getUrlParameter('mq') || app.getUrlParameter('multipleQualities')) {
                videoElement.classList.add(streamInfo.quality);
            }

            if (isSelf) {
                return; // Ignore self
            }

            var subscribeOptions = {
                videoElement: videoElement,
                monitor: {callback: onMonitorEvent}
            };
            var handleSubscribe = function(error, response) {
                if (!response || !response.mediaStream) {
                    return;
                }

                memberSubscriptions[sessionId].push({
                    mediaStream: response.mediaStream,
                    videoElement: videoElement,
                    isSelf: isSelf,
                    memberStream: memberStream
                });

                videoList.append(videoElement);
            };

            roomExpress.subscribeToMemberStream(memberStream, subscribeOptions, handleSubscribe);
        }

        function setUserMessage(message) {
            var userMessageElement = document.getElementById('userMessage');

            userMessageElement.innerText = message;
        }

        // This will get called when the stream fails to recover from an issue
        function onMonitorEvent(error, response) {
            if (error) {
                return; // May want to display something indicating failure for member
            }

            if (response.status !== 'ok') {
                console.log('Member stream subscription failed [%s]', response.status); // May want to display something indicating failure for member
            }

            // You may have the option to automatically retry
            if (response.retry) {
                console.log('Attempting to redo member stream subscription after failure'); // May want to display something indicating failure for member

                response.retry();
            }
        }

        function createVideo() {
            var videoElement = document.createElement('video');

            videoElement.setAttribute('playsline', ''); // For Safari and IOS
            videoElement.setAttribute('autoplay', ''); // For Safari and IOS + Mobile

            // To resolve unintended pauses
            videoElement.onpause = function() {
                setTimeout(function() {
                    videoElement.play();
                }, 10);
            };

            return videoElement;
        }

        function publishScreen() {
            hideElement(publishScreenShareButton);
            displayElement(stopScreenShareButton);

            var roomAlias = $('#alias').val();
            var videoElement = createVideo();
            var publishOptions = {
                capabilities: ['fhd', 'prefer-h264'], // Add other capabilities if you like. Prefer-h264 allows publishing/viewing on Safari/IOS 11
                room: {
                    alias: roomAlias,
                    name: roomAlias,
                    type: 'MultiPartyChat'
                }, // Set alias so that you can always uniquely identify room without accessing the return value
                screenName: screenName,
                streamType: 'Presentation', // Distinguish from normal publisher
                memberRole: memberRole,
                videoElement: videoElement,
                monitor: {callback: onMonitorEvent}
            };

            videoElement.setAttribute('muted', true); // Don't want to hear yourself

            return roomExpress.publishScreenToRoom(publishOptions, function(error, response) {
                if (error) {
                    setUserMessage('Unable to publish to Room: ' + error.message);

                    throw error;
                }

                if (response.status !== 'ok' && response.status !== 'ended') {
                    setUserMessage('New Status: ' + response.status);

                    throw new Error(response.status);
                }

                if (response.status === 'ok') {
                    screenPublisher = {
                        publisher: response.publisher,
                        videoElement: videoElement
                    };

                    selfVideoList.append(videoElement);
                }
            });
        }

        function stopPublishScreen() {
            displayElement(publishScreenShareButton);
            hideElement(stopScreenShareButton);

            if (screenPublisher) {
                screenPublisher.publisher.stop();
                screenPublisher.videoElement.remove();

                screenPublisher = null;
            }
        }

        publishAndJoinRoomButton.onclick = publishVideoAndCameraAtTwoQualitiesAndJoinRoom;
        stopButton.onclick = leaveRoomAndStopPublisher;
        publishScreenShareButton.onclick = publishScreen;
        stopScreenShareButton.onclick = stopPublishScreen;

        app.setOnReset(function() {
            createRoomExpress();
        });

        createRoomExpress();
    };

    function leaveRoomAndStopPublisher() {
        if (publisher) {
            publisher.publisher.stop();
            publisher.videoElement.remove();

            publisher = null;
        }

        if (lowQualityPublisher) {
            lowQualityPublisher.publisher.stop();

            lowQualityPublisher = null;
        }

        if (screenPublisher) {
            screenPublisher.publisher.stop();
            screenPublisher.videoElement.remove();

            screenPublisher = null;
        }

        if (roomService) {
            roomService.leaveRoom(function(error, response) {
                if (error) {
                    throw error;
                }

                if (response.status !== 'ok') {
                    throw new Error(response.status);
                }

                roomService = null;
            });
        }

        membersStore = [];
        memberSubscriptions = {};
        videoSources = [];
        audioSources = [];

        hideElement(stopButton);
        displayElement(publishAndJoinRoomButton);
    }

    function displayElement(element) {
        element.className = element.className.substring(0, element.className.indexOf(' hide'));
    }

    function hideElement(element) {
        if (element.className.indexOf('hide') === -1) {
            element.className += ' hide';
        }
    }

    $('#applicationId').change(function() {
        leaveRoomAndStopPublisher();
        init();
    });

    $('#secret').change(function() {
        leaveRoomAndStopPublisher();
        init();
    });

    $(function() {
        app.init();
        init();

        // Plugin might load with delay
        if (sdk.utils.rtc.phenixSupported && !sdk.utils.rtc.isPhenixEnabled()) {
            sdk.utils.rtc.onload = function() {
                app.init();
                init();
            };
        }
    });
});