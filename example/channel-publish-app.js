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
        'protobuf': 'protobuf/dist/ProtoBuf.min',
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
    'app-setup'
], function($, _, sdk, app) {
    var channelExpress;
    var channelPublisher;
    var authToken;
    var publishToken;

    var mediaConstraints = {
        video: true, // Include camera
        audio: true // Include microphone
    };

    var init = function init() {
        if (app.getUrlParameter('authToken')) {
            authToken = $('#authToken').val() || app.getUrlParameter('authToken');
        }

        if (app.getUrlParameter('publishToken')) {
            publishToken = $('#publishToken').val() || app.getUrlParameter('publishToken');
        }

        var createChannelExpress = function createPCastExpress() {
            var expressOptions = {authToken: authToken};

            channelExpress = new sdk.express.ChannelExpress(expressOptions);
        };

        var publishToChannel = function publishToChannel() {
            var videoElement = $('#channelVideo')[0];

            var publishOptions = {
                publishToken: publishToken,
                channel: {},
                mediaConstraints: mediaConstraints,
                videoElement: videoElement
            };

            if (!authToken || !publishToken) {
                return;
            }

            channelExpress.publishToChannel(publishOptions, function publishToChannelCallback(error, response) {
                if (error) {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Subscribe</strong>',
                        message: 'Unable to join Channel (' + error.message + ')'
                    });
                }

                if (response.status === 'ended') {
                    return;
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
                    message: 'Successfully published to Channel'
                });

                channelPublisher = response.publisher;

                $('#leaveChannel').removeClass('disabled');
            });
        };

        app.setOnReset(function() {
            createChannelExpress();
        });

        $('#publishToChannel').click(publishToChannel);
        $('#leaveChannel').click(leaveChannel);
        //
        createChannelExpress();
    };

    var leaveChannel = function leaveChannel() {
        if (channelPublisher) {
            channelPublisher.stop();
            channelPublisher = null;
            $('#leaveChannel').addClass('disabled');
        }
    };

    $('#authToken').change(function() {
        leaveChannel();
        init();
    });

    $('#publishToken').change(function() {
        leaveChannel();
        init();
    });

    $(function() {
        app.init();
        init();
    });
});