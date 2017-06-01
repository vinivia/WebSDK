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
        var pcastExpress;

        var createPCastExpress = function createPCastExpress() {
            pcastExpress = new sdk.express.PCastExpress({
                backendUri: app.getBaseUri(),
                authenticationData: app.getAuthData(),
                uri: app.getUri(),
                shaka: shaka
            });
        };

        var publisher;
        var publisherPlayer;

        var publish = function publish() {
            var localVideoEl = $('#localVideo')[0];
            var capabilities = [];

            $('#publish-capabilities option:selected').each(function () {
                capabilities.push($(this).val());
            });

            capabilities.push($('#publish-quality option:selected').val());

            pcastExpress.publish({
                mediaConstraints: getConstraints(),
                capabilities: capabilities,
                videoElement: localVideoEl
            }, function publishCallback(error, response) {
                if (error) {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Publish</strong>',
                        message: 'Failed to publish stream (' + error.messaage + ')'
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
                        message: 'Failed to publish stream (' + response.status + ')'
                    });
                }

                publisher = response.publisher;
                publisherPlayer = new Player('localVideo');

                publisherPlayer.onToggleAudio = function(enabled) {
                    return enabled ? publisher.disableAudio() : publisher.enableAudio();
                };

                publisherPlayer.onToggleVideo = function(enabled) {
                    return enabled ? publisher.disableVideo() : publisher.enableVideo();
                };

                publisherPlayer.start(publisher);

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Publish</strong>',
                    message: 'Started publishing stream "' + publisher.getStreamId() + '"'
                });

                $('#stopPublisher').removeClass('disabled');

                $('.streamIdForPublishing').val(publisher.getStreamId());
                $('#originStreamId').val(publisher.getStreamId());

                app.activateStep('step-2');
            });
        };

        var stopPublisher = function () {
            if (publisher) {
                publisher.stop();
                publisher = null;
                $('#stopPublisher').addClass('disabled');
            }

            if (publisherPlayer) {
                publisherPlayer.stop();
            }
        };

        var subscriberMediaStream = null;
        var subscriberPlayer = null;

        var subscribe = function subscribe() {
            var streamId = $('.streamIdForPublishing').val();
            var remoteVideoEl = $('#remoteVideo')[0];
            var capabilities = [];

            capabilities.push($('#subscriber-mode option:selected').val());

            pcastExpress.subscribe({
                streamId: streamId,
                capabilities: capabilities,
                videoElement: remoteVideoEl
            }, function subscribeCallback(error, response) {
                if (error) {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Subscribe</strong>',
                        message: 'Failed to subscribe to stream (' + error.message + ')'
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
                        title: '<strong>Subscribe</strong>',
                        message: 'Failed to subscribe to stream (' + response.status + ')'
                    });
                }

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Stream</strong>',
                    message: 'Starting stream'
                });

                subscriberMediaStream = response.mediaStream;
                subscriberPlayer = new Player('remoteVideo');

                subscriberPlayer.onToggleAudio = function(enabled) {
                    return enabled ? subscriberMediaStream.disableAudio() : subscriberMediaStream.enableAudio();
                };

                subscriberPlayer.onToggleVideo = function(enabled) {
                    return enabled ? subscriberMediaStream.disableVideo() : subscriberMediaStream.enableVideo();
                };

                subscriberPlayer.start(subscriberMediaStream);

                $('#stopSubscriber').removeClass('disabled');
            });
        };

        var stopSubscriber = function (reason) {
            if (subscriberMediaStream) {
                subscriberMediaStream.stop(reason);
                subscriberMediaStream = null;
                $('#stopSubscriber').addClass('disabled');
            }

            if (subscriberPlayer) {
                subscriberPlayer.stop();
            }
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

        app.setOnReset(function () {
            createPCastExpress();
        });

        $('#publish').click(publish);
        $('#stopPublisher').click(stopPublisher);
        $('#subscribe').click(subscribe);
        $('#stopSubscriber').click(_.bind(stopSubscriber, null, 'stopped-by-user'));

        createPCastExpress();
    };

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
