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
        var pcastExpress = null;
        var publisher = null;
        var subscriberMediaStream = null;
        var subscriberPlayer = null;

        var createPCastExpress = function createPCastExpress() {
            if (!$('#applicationId').val() || !$('#secret').val()) {
                stopPublisher();

                return;
            }

            var adminApiProxyClient = new sdk.net.AdminApiProxyClient();

            adminApiProxyClient.setBackendUri(app.getBaseUri() + '/pcast');
            adminApiProxyClient.setAuthenticationData(app.getAuthData());

            var pcastOptions = {
                adminApiProxyClient: adminApiProxyClient,
                uri: app.getUri(),
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
                }
            };

            pcastExpress = new sdk.express.PCastExpress(pcastOptions);
        };

        function onMonitorEvent(error, response) {
            if (error) {
                return app.createNotification('danger', {
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Monitor Event</strong>',
                    message: 'Monitor Event triggered for (' + error.message + ')'
                });
            }

            if (response.status === 'ended' || response.status === 'stream-ended') {
                if (response.description !== 'stopped-by-user') {
                    listStreams();
                }

                stopSubscriber();

                app.createNotification('info', {
                    icon: 'glyphicon glyphicon-stop',
                    title: '<strong>Monitor Event</strong>',
                    message: 'Monitor Event triggered ( Stream Ended )'
                });

                return;
            }

            if (response.status !== 'ok') {
                app.createNotification('danger', {
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Monitor Event</strong>',
                    message: 'Monitor Event triggered (' + response.status + ')'
                });
            }

            if (response.retry) {
                response.retry();
            }
        }

        var publish = function publish() {
            var streamId = $('#originStreamId').val();
            var externalUri = $('#externalUri').val();
            var capabilities = [];

            createPCastExpress();

            pcastExpress.publishStreamToExternal({
                externalUri: externalUri,
                streamId: streamId,
                capabilities: capabilities,
                monitor: {callback: onMonitorEvent}
            }, function publishCallback(error, response) {
                if (error) {
                    return app.createNotification('danger', {
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Publish External</strong>',
                        message: 'Failed to publish to external (' + error.message + ')'
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
                        title: '<strong>Publish External</strong>',
                        message: 'Failed to publisher to external (' + response.status + ')'
                    });
                }

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Publish External</strong>',
                    message: 'Starting publish to external'
                });

                publisher = response.publisher;

                $('#publish').addClass('disabled');
                $('#stopPublisher').removeClass('disabled');
                app.activateStep('step-3');
            });
        };

        var stopPublisher = function(reason) {
            stopSubscriber();

            if (publisher) {
                publisher.stop(reason);
                publisher = null;
            }

            if (pcastExpress) {
                pcastExpress.dispose();
                pcastExpress = null;
            }

            $('#publish').removeClass('disabled');
            $('#stopPublisher').addClass('disabled');

            listStreams();
        };

        var subscribe = function subscribe() {
            var streamId = $('#originStreamId').val();
            var remoteVideo = $('#remoteVideo')[0];
            var capabilities = [];
            var subscriberOptions = {disableAudioIfNoOutputFound: true};

            $('#subscriber-mode button.clicked').each(function() {
                capabilities.push($(this).val());
            });

            $('#subscriber-drm-capabilities button.clicked').each(function() {
                capabilities.push($(this).val());
            });

            pcastExpress.subscribe({
                streamId: streamId,
                capabilities: capabilities,
                videoElement: remoteVideo,
                monitor: {callback: onMonitorEvent},
                subscriberOptions: subscriberOptions
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

                subscriberMediaStream = response.mediaStream;
                subscriberPlayer = new Player('remoteVideo');
                subscriberPlayer.start(subscriberMediaStream, response.renderer);

                app.createNotification('success', {
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Stream</strong>',
                    message: 'Starting stream'
                });

                $('#subscribe').addClass('disabled');
                $('#stopSubscriber').removeClass('disabled');
            });
        };

        var stopSubscriber = function(reason) {
            if (subscriberMediaStream) {
                subscriberMediaStream.stop(reason);
                subscriberMediaStream = null;
            }

            if (subscriberPlayer) {
                subscriberPlayer.stop();
                subscriberPlayer = null;
            }

            $('#subscribe').removeClass('disabled');
            $('#stopSubscriber').addClass('disabled');
        };

        var onStreamSelected = function onStreamSelected() {
            var streamId = $('#stream option:selected').text();

            if (streamId) {
                $('#originStreamId').val(streamId);
                app.activateStep('step-2');
            }
        };

        var listStreams = function listStreams() {
            var applicationId = $('#applicationId').val();
            var secret = $('#secret').val();

            app.resetToStep('step-1');

            if (applicationId === '' || secret === '') {
                return;
            }

            var data = {
                applicationId: applicationId,
                secret: secret,
                length: 256,
                options: ['global']
            };

            $.ajax({
                url: app.getBaseUri() + '/pcast/streams',
                accepts: 'application/json',
                contentType: 'application/json',
                method: 'PUT',
                data: JSON.stringify(data)
            }).done(function(result) {
                $('#stream').find('option').remove().end();

                if (result.streams.length > 0) {
                    $('#stream').append($('<option></option>').attr('value', '').text('Please select a stream'));

                    _.forEach(result.streams, function(stream) {
                        $('#stream').append($('<option></option>').attr('value', stream.streamId).text(stream.streamId));
                    });
                } else {
                    $('#stream').append($('<option></option>').attr('value', '').text('No stream available - Please publish a stream'));
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                app.createNotification('danger', {
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Streams</strong>',
                    message: 'Failed to list streams (' + (errorThrown || jqXHR.status) + ')'
                });
            });
        };

        // ----------------------------------------

        app.setOnReset(function() {
            stopPublisher();
        });

        $('#applicationId').change(function() {
            stopPublisher();
        });

        $('#secret').change(function() {
            stopPublisher();
        });

        $('#publish').click(publish);
        $('#stopPublisher').click(_.bind(stopPublisher, null, 'stopped-by-user'));

        $('#subscribe').click(subscribe);
        $('#stopSubscriber').click(_.bind(stopSubscriber, null, 'stopped-by-user'));

        $('#stream-refresh').click(function() {
            stopPublisher();
        });

        $('#stream').change(onStreamSelected);

        listStreams();
    };

    $(function() {
        app.init();
        init();
    });
});