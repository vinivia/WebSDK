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
requirejs.config({
    paths: {
        'phenix-web-sdk': 'web-sdk',
        'phenix-rtc': 'phenix-rtc/dist/phenix-rtc',
        'jquery': 'jquery/dist/jquery.min',
        'lodash': 'lodash/dist/lodash.min',
        'bootstrap': 'bootstrap/dist/js/bootstrap.min',
        'protobuf': 'protobuf/dist/ProtoBuf.min',
        'bootstrap-notify': 'remarkable-bootstrap-notify/dist/bootstrap-notify.min',
        'fingerprintjs2': 'fingerprintjs2/dist/fingerprint2.min',
        'Long': 'long/dist/long.min',
        'ByteBuffer': 'bytebuffer/dist/ByteBufferAB.min',
        'shaka-player': 'shaka-player/dist/shaka-player.compiled',
        'video-player': 'player',
        'app-setup': 'app-setup'
    }
});

requirejs(['jquery', 'lodash', 'phenix-web-sdk', 'shaka-player', 'video-player', 'app-setup'], function ($, _, sdk, shaka, Player, app) {
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

        var channelPublisher;
        var publisherPlayer;

        var publishLocalMediaToChannel = function publishToChannel() {
            var channelAlias = $('#channelAlias').val();
            var channelVideoEl = $('#channelVideo')[0];
            var capabilities = [];

            $('#publish-capabilities option:selected').each(function () {
                capabilities.push($(this).val());
            });

            capabilities.push($('#publish-quality option:selected').val());

            roomExpress.publishToChannel({
                mediaConstraints: getConstraints(),
                channelAlias: channelAlias,
                capabilities: capabilities,
                videoElement: channelVideoEl
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

                if (response.status !== 'ok') {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Publish</strong>',
                        message: 'Failed to join channel (' + response.status + ')'
                    });
                }

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Viewing Channel</strong>',
                    message: 'Successfully joined Channel "' + channelAlias + '"'
                });

                channelPublisher = response.publisher;
                publisherPlayer = new Player('channelVideo');

                publisherPlayer.onToggleAudio = function(enabled) {
                    return enabled ? channelPublisher.disableAudio() : channelPublisher.enableAudio();
                };

                publisherPlayer.onToggleVideo = function(enabled) {
                    return enabled ? channelPublisher.disableVideo() : channelPublisher.enableVideo();
                };

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

            if (roomExpress) {
                roomExpress.stop();
            }

            $('#stopPublisher').addClass('disabled');
        };

        app.setOnReset(function () {
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
                break;
        }

        return userMediaOptions;
    }

    $(function () {
        app.init();
        init();

        // Plugin might load with delay
        if (sdk.RTC.phenixSupported && !sdk.RTC.isPhenixEnabled()) {
            sdk.RTC.onload = function() {
                app.init();
                init();
            }
        }
    });
});
