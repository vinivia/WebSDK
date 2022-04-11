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
        'phenix-rtc': 'phenix-rtc/dist/phenix-rtc',
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
        var subscriberMediaStream = null;
        var subscriberPlayer = null;

        var createChannelExpress = function createChannelExpress() {
            if (!$('#viewingToken').val()) {
                stopSubscriber();

                return;
            }

            try {
                channelExpress = new sdk.express.ChannelExpress({
                    authToken: $('#viewingToken').val(),
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
                        $('#subscribe').addClass('disabled');
                    }
                });
                $('#subscribe').removeClass('disabled');
            } catch (e) {
                app.createNotification('danger', {
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Invalid Token</strong>',
                    message: 'Failed to parse authToken'
                });
                $('#subscribe').addClass('disabled');
            }
        };

        var subscribe = function subscribe() {
            var subscribeOptions = {
                streamToken: $('#viewingToken').val(),
                videoElement: $('#remoteVideo')[0]
            };

            try {
                channelExpress.joinChannel(subscribeOptions, joinChannelCallback, subscribeCallback);
            } catch (e) {
                app.createNotification('danger', {
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Invalid Token</strong>',
                    message: 'Failed to parse viewingToken'
                });
            }

            function joinChannelCallback(error, response) {
                if (error) {
                    $('#subscribe').removeClass('disabled');

                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Join</strong>',
                        message: 'Failed to join channel (' + error.message + ')'
                    });
                }

                if (response.status === 'room-not-found') {
                    $('#subscribe').removeClass('disabled');

                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Join</strong>',
                        message: 'Channel not found'
                    });
                }

                if (response.status !== 'ok') {
                    $('#subscribe').removeClass('disabled');

                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Join</strong>',
                        message: 'Failed to join channel (' + response.status + ')'
                    });
                }

                channelService = response.channelService;

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Join</strong>',
                    message: 'Joined channel'
                });
            }

            function subscribeCallback(error, response) {
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

                if (response.status === 'ended') {
                    stopSubscriber();
                    createChannelExpress();

                    return app.createNotification('success', {
                        icon: 'glyphicon glyphicon-film',
                        title: '<strong>Subscribing to Channel</strong>',
                        message: 'Ended'
                    });
                }

                if (response.status === 'no-stream-playing') {
                    stopSubscriber();
                    createChannelExpress();

                    return app.createNotification('info', {
                        icon: 'glyphicon glyphicon-film',
                        title: '<strong>Subscribing to Channel</strong>',
                        message: 'No Stream Playing'
                    });
                }

                if (response.status !== 'ok') {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Subscribe</strong>',
                        message: 'Failed to subscribe to stream (' + response.status + ')'
                    });
                }

                subscriberMediaStream = response.mediaStream;
                subscriberPlayer = new Player('remoteVideo');
                subscriberPlayer.start(subscriberMediaStream, response.renderer);

                subscriberMediaStream.addBitRateThreshold([0, .2, .4, .6, .8], function(event) {
                    app.createNotification(event.isIncreasing ? 'success' : 'danger', {
                        icon: 'glyphicon glyphicon-film',
                        title: '<strong>Subscriber BitRate</strong>',
                        message: event.message
                    });
                });

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Stream</strong>',
                    message: 'Starting stream'
                });

                $('#subscribe').addClass('disabled');
                $('#stopSubscriber').removeClass('disabled');
            }
        };

        var stopSubscriber = function stopSubscriber(reason) {
            $('#subscribe').addClass('disabled');
            $('#stopSubscriber').addClass('disabled');

            if (subscriberPlayer) {
                subscriberPlayer.stop();
                subscriberPlayer = null;
            }

            if (subscriberMediaStream) {
                subscriberMediaStream.stop(reason);
                subscriberMediaStream = null;
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

            if (channelExpress) {
                channelExpress.dispose();
                channelExpress = null;
            }
        };

        // ----------------------------------------

        app.setOnReset(function() {
            createChannelExpress();
        });

        $('#viewingToken').change(function() {
            stopSubscriber('stopped-by-user');
            createChannelExpress();
        });

        $('#subscribe').click(function() {
            $('#subscribe').addClass('disabled');
            subscribe();
        });

        $('#stopSubscriber').click(function() {
            stopSubscriber('stopped-by-user');
            createChannelExpress();
        });
    };

    $(function() {
        app.init();
        init();
    });
});