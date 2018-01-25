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
    var init = function init() {
        var roomExpress;

        if (app.getUrlParameter('m') || app.getUrlParameter('mode')) {
            var subscriberMode = app.getModeFromAbbreviation(app.getUrlParameter('m') || app.getUrlParameter('mode'));

            $('#subscriber-mode').val(subscriberMode);
        }

        var createRoomExpress = function createPCastExpress() {
            var expressOptions = {
                backendUri: app.getBaseUri() + '/pcast',
                authenticationData: app.getAuthData(),
                uri: app.getUri(),
                shaka: app.getUrlParameter('shaka') ? shaka : null
            };

            if (app.getUrlParameter('ssmr')) {
                expressOptions.streamingSourceMapping = {
                    patternToReplace: app.getUrlParameter('ssmp') || app.getDefaultReplaceUrl(),
                    replacement: app.getUrlParameter('ssmr')
                };
            }

            roomExpress = new sdk.express.RoomExpress(expressOptions);
        };

        var channelSubscriber;
        var channelPlayer;
        var leaveChannelCallback;

        var joinChannel = function joinChannel() {
            var channelAlias = $('#alias').val();
            var channelVideoEl = $('#channelVideo')[0];
            var capabilities = [];
            var streamSelectionStrategy = app.getUrlParameter('strategy') || 'high-availability';
            var subscriberOptions = {};

            if (!channelAlias) {
                return;
            }

            if (app.getUrlParameter('minBuffer')) {
                subscriberOptions.targetMinBufferSize = parseFloat(app.getUrlParameter('minBuffer'));
            }

            if (app.getUrlParameter('targetDuration')) {
                subscriberOptions.hlsTargetDuration = parseInt(app.getUrlParameter('targetDuration'));
            }

            capabilities.push($('#subscriber-mode option:selected').val());

            $('#subscriber-drm-capabilities option:selected').each(function() {
                capabilities.push($(this).val());
            });

            roomExpress.joinChannel({
                alias: channelAlias,
                capabilities: capabilities,
                videoElement: channelVideoEl,
                streamSelectionStrategy: streamSelectionStrategy,
                subscriberOptions: subscriberOptions
            }, function joinChannelCallback(error, response) {
                if (error) {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Subscribe</strong>',
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
                        title: '<strong>Subscribe</strong>',
                        message: 'Failed to join channel (' + response.status + ')'
                    });
                }

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Viewing Channel</strong>',
                    message: 'Successfully joined Channel "' + channelAlias + '"'
                });

                leaveChannelCallback = response.roomService.stop;

                $('#leaveChannel').removeClass('disabled');
            }, function subscriberCallback(error, response) {
                if (error) {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Subscribe</strong>',
                        message: 'Error while viewing channel (' + error.message + ')'
                    });
                }

                if (response.status === 'offline') {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Offline</strong>',
                        message: 'Disconnected from PCast while viewing channel'
                    });
                }

                if (response.status !== 'ok') {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Subscribe</strong>',
                        message: 'Issue while viewing channel (' + response.status + ')'
                    });
                }

                if (channelPlayer) {
                    channelPlayer.stop();
                }

                channelSubscriber = response.mediaStream;
                channelPlayer = new Player('channelVideo', {
                    minWidth: 320,
                    minHeight: 240
                });

                channelPlayer.start(channelSubscriber, response.renderer);

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Viewing Channel</strong>',
                    message: 'Stream changed (' + response.reason + ')'
                });
            });
        };

        var leaveChannel = function leaveChannel() {
            if (channelSubscriber) {
                channelSubscriber.stop();
                channelSubscriber = null;
            }

            if (channelPlayer) {
                channelPlayer.stop();
            }

            if (leaveChannelCallback) {
                leaveChannelCallback();
                leaveChannelCallback = null;
                $('#leaveChannel').addClass('disabled');
            }
        };

        app.setOnReset(function() {
            createRoomExpress();
        });

        $('#joinChannel').click(joinChannel);
        $('#leaveChannel').click(leaveChannel);

        createRoomExpress();
        joinChannel();
    };

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