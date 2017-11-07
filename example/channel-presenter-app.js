/**
 * Copyright 2018 Phenix Inc. All Rights Reserved.
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
        'phenix-web-observable': 'phenix-web-observable/dist/phenix-web-observable.min',
        'phenix-web-reconnecting-websocket': 'phenix-web-reconnecting-websocket/dist/phenix-web-reconnecting-websocket.min',
        'phenix-web-network-connection-monitor': 'phenix-web-network-connection-monitor/dist/phenix-web-network-connection-monitor.min',
        'phenix-web-proto': 'phenix-web-proto/dist/phenix-web-proto.min',
        'phenix-web-event': 'phenix-web-event/dist/phenix-web-event.min',
        'phenix-web-disposable': 'phenix-web-disposable/dist/phenix-web-disposable.min',
        'phenix-web-closest-endpoint-resolver': 'phenix-web-closest-endpoint-resolver/dist/phenix-web-closest-endpoint-resolver.min',
        'phenix-web-player': 'phenix-web-player/dist/phenix-web-player-bundled.min'
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
    var init = function init() {
        var roomExpress;

        var createRoomExpress = function createPCastExpress() {
            roomExpress = new sdk.express.RoomExpress({
                backendUri: app.getBaseUri() + '/pcast',
                authenticationData: app.getAuthData(),
                uri: app.getUri(),
                shaka: app.getUrlParameter('shaka') ? shaka : null
            });
        };

        var channelPublisher;
        var publisherPlayer;
        var roomService;

        var publishLocalMediaToChannel = function publishToChannel() {
            var channelAlias = $('#alias').val();
            var channelVideoEl = $('#channelVideo')[0];
            var capabilities = [];
            var streamSelectionStrategy = app.getUrlParameter('strategy') || 'high-availability';

            $('#publish-capabilities option:selected').each(function() {
                capabilities.push($(this).val());
            });

            capabilities.push($('#publish-quality option:selected').val());

            roomExpress.publishToChannel({
                mediaConstraints: getConstraints(),
                room: {
                    alias: channelAlias,
                    name: channelAlias
                },
                capabilities: capabilities,
                videoElement: channelVideoEl,
                viewerStreamSelectionStrategy: streamSelectionStrategy,
                screenName: 'primary' + _.random(1000000)
            }, function publishToChannelCallback(error, response) {
                if (error) {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Publish</strong>',
                        message: 'Unable to join Channel (' + error.message + ')'
                    });
                }

                if (response.status === 'offline') {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Offline</strong>',
                        message: 'Disconnected from PCast'
                    });
                }

                if (response.status === 'ended') {
                    return app.createNotification('success', {
                        icon: 'glyphicon glyphicon-film',
                        title: '<strong>Publishing to Channel</strong>',
                        message: 'Ended'
                    });
                }

                if (response.status !== 'ok') {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Publish</strong>',
                        message: 'Failed to publish to channel (' + response.status + ')'
                    });
                }

                if (publisherPlayer) {
                    publisherPlayer.stop();
                }

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Publishing to Channel</strong>',
                    message: 'Successfully published to Channel "' + channelAlias + '"'
                });

                roomService = response.roomService;
                channelPublisher = response.publisher;
                publisherPlayer = new Player('channelVideo');

                publisherPlayer.start(channelPublisher);

                $('#stopPublisher').removeClass('disabled');
            });
        };

        var stopPublisher = function stopPublisher() {
            if (channelPublisher) {
                channelPublisher.stop();
                channelPublisher = null;
            }

            if (publisherPlayer) {
                publisherPlayer.stop();
                publisherPlayer = null;
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

            $('#stopPublisher').addClass('disabled');
        };

        app.setOnReset(function() {
            createRoomExpress();
        });

        $('#publish').click(publishLocalMediaToChannel);
        $('#stopPublisher').click(stopPublisher);

        createRoomExpress();
    };

    function getConstraints() {
        var source = $('#gum-source option:selected').val();
        var userMediaOptions = {};

        switch (source) {
        case 'screen':
            userMediaOptions.screen = true;

            break;
        case 'microphone':
            userMediaOptions.audio = true;
            userMediaOptions.video = false;

            break;
        case 'camera':
            userMediaOptions.audio = false;
            userMediaOptions.video = {
                optional: [
                    {minHeight: 720}
                ]
            };

            break;
        case 'cameraAndMicrophone':
            userMediaOptions.audio = true;
            userMediaOptions.video = {
                optional: [
                    {minHeight: 720}
                ]
            };

            break;
        case 'cameraMicrophoneAndScreen':
            userMediaOptions.screen = true;
            userMediaOptions.audio = true;
            userMediaOptions.video = {
                optional: [
                    {minHeight: 720}
                ]
            };

            break;
        default:
            throw new Error('Unsupported User Media Options');
        }

        return userMediaOptions;
    }

    $(function() {
        app.init();
        init();

        // Plugin might load with delay
        if (sdk.RTC.phenixSupported && !sdk.RTC.isPhenixEnabled()) {
            sdk.RTC.onload = function() {
                app.init();
                init();
            };
        }
    });
});