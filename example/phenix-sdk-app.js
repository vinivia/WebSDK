/**
 * Copyright 2016 PhenixP2P Inc. All Rights Reserved.
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
        'phenix-web-sdk': 'phenix-web-sdk',
        'phenix-rtc': '/phenix-rtc/dist/phenix-rtc.min',
        'jquery': '/jquery/dist/jquery.min',
        'lodash': '/lodash/dist/lodash.min',
        'bootstrap': '/bootstrap/dist/js/bootstrap.min',
        'protobuf': '/protobuf/dist/ProtoBuf.min',
        'Long': '/long/dist/long.min',
        'ByteBuffer': '/bytebuffer/dist/ByteBufferAB.min'
    }
});

requirejs(['jquery', 'lodash', 'phenix-rtc', 'phenix-web-sdk'], function ($, _, rtc, sdk) {
    var init = function init() {
        var remoteVideoEl = $('#remoteVideo')[0];

        var onLoadedMetaData = function onLoadedMetaData(video) {
            console.log('Meta data, width=' + video.videoWidth + ', height=' + video.videoHeight);

            video.width = video.videoWidth;
            video.height = video.videoHeight;
        };

        remoteVideoEl.onloadedmetadata = function () {
            onLoadedMetaData(remoteVideoEl);
        };

        $('#phenixRTCVersion').text(rtc.phenixVersion);
        $('#browser').text(rtc.browser);
        $('#browserVersion').text(rtc.browserVersion);
        if (rtc.webrtcSupported) {
            $('#webrtc').addClass('success');
        } else {
            $('#webrtc').addClass('danger');
        }
        if (rtc.isPhenixEnabled()) {
            $('#phenix').addClass('success');
        } else if (rtc.phenixSupported) {
            $('#phenix').addClass('warning');
        } else {
            $('#phenix').addClass('danger');
        }

        var url;
        var pcast;

        var createPCast = function createPCast() {
            if (pcast) {
                pcast.stop();
            }

            url = $('#environment option:selected').val();
            pcast = new sdk.PCast('wss://' + url + '/ws');
        };

        createPCast();

        var onStreamSelected = function onStreamSelected() {
            var streamId = $('#stream option:selected').text();

            $('#originStreamId').val(streamId);
        };

        var listStreams = function listStreams() {
            var applicationId = $('#applicationId').val();
            var secret = $('#secret').val();
            var data = {
                applicationId: applicationId,
                secret: secret,
                length: 256
            };

            $.ajax({
                url: 'https://' + url + '/pcast/streams',
                accepts: 'application/json',
                contentType: 'application/json',
                method: 'PUT',
                data: JSON.stringify(data)
            }).done(function (result) {
                $('#stream').find('option').remove().end();
                _.forEach(result.streams, function (stream) {
                    $('#stream').append('<option value="' + stream.streamId + '">' + stream.streamId + '</option>');
                });
                if (result.streams.length > 0) {
                    $('#stream').val(result.streams[0].streamId);
                    onStreamSelected();
                }
            });
        };

        $('#environment').change(function () {
            createPCast();
            listStreams();
        });
        $('#applicationId').change(listStreams);
        $('#secret').change(listStreams);
        $('#stream').change(onStreamSelected);
        $('#stream-refresh').click(listStreams);

        var start = function start() {
            pcast.start($('#authToken').val(), function authenticateCallback(pcast, status, sessionId) {
                $('#sessionId').val(sessionId);
            }, function onlineCallback(pcast) {

            }, function offlineCallback(pcast) {

            });
        };

        var stop = function stop() {
            pcast.stop();
        };

        var subscribe = function subscribe() {
            pcast.subscribe($('#streamToken').val(), function subscribeCallback(pcast, status, mediaStream) {
                if (status !== 'ok') {
                    alert('Failed: ' + status);
                    return;
                }

                mediaStream.setStreamEndedCallback(function (reason) {
                    alert('Stream ended (reason="' + reason + '")');
                });

                var renderer = mediaStream.createRenderer();

                remoteVideoEl = renderer.start(remoteVideoEl);

                setTimeout(function () {
                    mediaStream.stop();
                }, 30000);
            });
        };

        $('#start').click(start);
        $('#stop').click(stop);
        $('#subscribe').click(subscribe);

        var createAuthToken = function createAuthToken() {
            var applicationId = $('#applicationId').val();
            var secret = $('#secret').val();
            var data = {
                applicationId: applicationId,
                secret: secret
            };

            $.ajax({
                url: 'https://' + url + '/pcast/auth',
                accepts: 'application/json',
                contentType: 'application/json',
                method: 'POST',
                data: JSON.stringify(data)
            }).done(function (result) {
                $('#authToken').val(result.authenticationToken);
            });
        };

        var createStreamToken = function createStreamToken() {
            var applicationId = $('#applicationId').val();
            var secret = $('#secret').val();
            var sessionId = $('#sessionId').val();
            var originStreamId = $('#originStreamId').val();

            var data = {
                applicationId: applicationId,
                secret: secret,
                sessionId: sessionId,
                originStreamId: originStreamId
            };

            $.ajax({
                url: 'https://' + url + '/pcast/stream',
                accepts: 'application/json',
                contentType: 'application/json',
                method: 'POST',
                data: JSON.stringify(data)
            }).done(function (result) {
                $('#streamToken').val(result.streamToken);
            });
        };

        $('#createAuthToken').click(createAuthToken);
        $('#createStreamToken').click(createStreamToken);
    };

    $(function () {
        init();

        // Plugin might load with delay
        if (rtc.phenixSupported && !rtc.isPhenixEnabled()) {
            rtc.onload = init;
        }
    });
});
