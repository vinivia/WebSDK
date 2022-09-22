/**
 * Copyright 2022 Phenix Real Time Solutions, Inc. All Rights Reserved.
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

var phenixWebSdk = 'phenix-web-sdk';
var params = window.location.search.substring(1).split('&');

for (var i = 0; i < params.length; i++) {
    if (params[i] === 'development') {
        phenixWebSdk = './web-sdk';
    }
}

/* global requirejs */
requirejs.config({
    paths: {
        'phenix-web-sdk': phenixWebSdk,
        'jquery': 'jquery/dist/jquery.min',
        'lodash': 'lodash/lodash.min',
        'bootstrap': 'bootstrap/dist/js/bootstrap.min',
        'bootstrap-notify': 'bootstrap-notify/bootstrap-notify.min',
        'fingerprintjs2': 'fingerprintjs2/dist/fingerprint2.min',
        'webrtc-adapter': 'webrtc-adapter/out/adapter',
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
        'phenix-web-application-activity-detector': 'phenix-web-application-activity-detector/dist/phenix-web-application-activity-detector.min',
        'phenix-web-global': 'phenix-web-global/dist/phenix-web-global.min',
        'phenix-web-detect-browser': 'phenix-web-detect-browser/dist/phenix-web-detect-browser.min'
    }
});

requirejs([
    'jquery',
    'lodash',
    'phenix-web-sdk',
    'video-player',
    'app-setup'
], function($, _, sdk, Player, app) {
    var init = function init() {
        var channelExpress = null;
        var channelService = null;
        var publisher = null;
        var publisherPlayer = null;

        var createChannelExpress = function createChannelExpress() {
            if (!$('#authToken').val() || !$('#publishToken').val()) {
                stopPublisher();

                return;
            }

            try {
                channelExpress = new sdk.express.ChannelExpress({
                    authToken: $('#authToken').val(),
                    shakaLoader: function(callback) {
                        if (!app.getUrlParameter('shaka')) {
                            return callback(null);
                        }

                        requirejs(['shaka-player'], function(shaka) {
                            callback(shaka);
                        });
                    },
                    webPlayerLoader: function(callback) {
                        if (app.getUrlParameter('shaka')) {
                            return callback(null);
                        }

                        requirejs(['phenix-web-player'], function(webPlayer) {
                            callback(webPlayer);
                        });
                    },
                    onError: function() {
                        app.createNotification('danger', {
                            icon: 'glyphicon glyphicon-remove-sign',
                            title: '<strong>Unauthorized</strong>',
                            message: 'Failed to authenticate'
                        });
                        $('#publish').addClass('disabled');
                    }
                });
                $('#publish').removeClass('disabled');
            } catch (e) {
                app.createNotification('danger', {
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Invalid Token</strong>',
                    message: 'Failed to parse authToken'
                });
                $('#publish').addClass('disabled');
            }
        };

        var publish = function publish() {
            var publishOptions = {
                channel: {},
                publishToken: $('#publishToken').val(),
                mediaConstraints: {
                    video: true,
                    audio: true
                },
                videoElement: $('#localVideo')[0],
                screenName: 'primary' + _.random(1000000)
            };

            try {
                channelExpress.publishToChannel(publishOptions, publishToChannelCallback);
            } catch (e) {
                app.createNotification('danger', {
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Invalid Token</strong>',
                    message: 'Failed to parse publishToken'
                });
            }

            function publishToChannelCallback(error, response) {
                if (error) {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Publish</strong>',
                        message: 'Unable to publish to channel (' + error.message + ')'
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

                channelService = response.channelService;
                publisher = response.publisher;
                publisherPlayer = new Player('localVideo');
                publisherPlayer.start(publisher);

                publisher.addBitRateThreshold([0, .5, .75, .82, .95], function(event) {
                    app.createNotification('success', {
                        icon: 'glyphicon glyphicon-film',
                        title: '<strong>Bitrate change</strong>',
                        message: 'Bitrate changed (' + event.message + ')'
                    });
                });

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Viewing Channel</strong>',
                    message: 'Successfully published to Channel "' + channelService.getSelf().toString() + '"'
                });

                $('#stopPublisher').removeClass('disabled');
            }
        };

        var stopPublisher = function stopPublisher() {
            $('#publish').addClass('disabled');
            $('#stopPublisher').addClass('disabled');

            if (publisherPlayer) {
                publisherPlayer.stop();
                publisherPlayer = null;
            }

            if (channelService) {
                channelService.leaveChannel(function(error, response) {
                    if (error) {
                        throw error;
                    }

                    if (response.status !== 'ok') {
                        throw new Error(response.status);
                    }

                    channelService = null;
                });
            }

            if (publisher) {
                publisher.stop();
                publisher = null;
            }

            if (channelExpress) {
                channelExpress.dispose();
                channelExpress = null;
            }
        };

        // ----------------------------------------

        app.setOnReset(function() {
            createChannelExpress();
        });

        $('#authToken').change(function() {
            stopPublisher();
            createChannelExpress();
        });

        $('#publishToken').change(function() {
            stopPublisher();
            createChannelExpress();
        });

        $('#publish').click(function() {
            $('#publish').addClass('disabled');
            publish();
        });

        $('#stopPublisher').click(function() {
            stopPublisher();
            createChannelExpress();
        });
    };

    $(function() {
        app.init();
        init();
    });
});