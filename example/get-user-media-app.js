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
/* global requirejs */
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
        'shaka-player': 'shaka-player/dist/shaka-player.compiled'
    }
});

var version = '1.0.0'; // ToDo: use until sample app separated from repo

requirejs([
    'jquery',
    'lodash',
    'bootstrap-notify',
    'fingerprintjs2',
    'phenix-web-sdk',
    'shaka-player'
], function ($, _, bootstrapNotify, Fingerprint, sdk, shaka) {
    var init = function init() {
        var fingerprint = new Fingerprint();
        var localVideoEl = $('#localVideo')[0];
        var localVideoSecondaryEl = $('#localVideoSecondary')[0];
        var remoteVideoEl = $('#remoteVideo')[0];
        var remoteVideoSecondaryEl = $('#remoteVideoSecondary')[0];
        var videoTargetStreams = {};

        var userMediaStream = null;

        var getUrlParameter = function getUrlParameter(parameterName) {
            var queryParameters = window.location.search.substring(1).split('&');

            for (var i = 0; i < queryParameters.length; i++) {
                var parameter = queryParameters[i].split('=');

                if (parameter[0] === parameterName) {
                    return parameter.length > 0 ? decodeURIComponent(parameter[1]) : null;
                }
            }
        };

        var enabledSteps = ['step-1'];

        var enableSteps = function enableSteps() {
            $('.step').addClass('step-disabled');
            $('.step .server').removeClass('step-active');
            $('.step .client').removeClass('step-active');

            enabledSteps.forEach(function (step) {
                $('.' + step).removeClass('step-disabled');
            });

            $('.' + enabledSteps[enabledSteps.length - 1] + ' .server').addClass('step-active');
            $('.' + enabledSteps[enabledSteps.length - 1] + ' .client').addClass('step-active');

            $('html, body').animate({scrollTop: $('.' + enabledSteps[enabledSteps.length - 1]).offset().top - ($(window).height() / 3)}, 'slow');
        };

        var activateStep = function activateStep(step) {
            enabledSteps.push(step);
            enableSteps();
        };

        var setVideoWidthAndHeight = function setVideoWithAndHeight(video){
            video.width = video.videoWidth <= 160 ? 160 : video.videoWidth > 640 ? 640 : video.videoWidth;
            video.height = video.videoHeight <= 120 ? 120 : video.videoHeight > 480 ? 480 : video.videoHeight;
        };

        var onLoadedMetaData = function onLoadedMetaData(video) {
            console.log('Meta data, width=' + video.videoWidth + ', height=' + video.videoHeight);

            $.notify({
                icon: 'glyphicon glyphicon-film',
                title: '<strong>Video</strong>',
                message: 'The video dimensions are ' + video.videoWidth + ' x ' + video.videoHeight
            }, {
                type: 'info',
                allow_dismiss: false, // eslint-disable-line camelcase
                placement: {
                    from: 'bottom',
                    align: 'right'
                },
                delay: 5000,
                animate: {
                    enter: 'animated fadeInUp',
                    exit: 'animated fadeOutDown'
                }
            });

            setVideoWidthAndHeight(video);
        };

        remoteVideoEl.onloadedmetadata = function () {
            onLoadedMetaData(remoteVideoEl);
        };

        remoteVideoSecondaryEl.onloadedmetadata = function () {
            onLoadedMetaData(remoteVideoSecondaryEl);
        };

        $('#phenixRTCVersion').text(sdk.RTC.phenixVersion);
        $('#browser').text(sdk.RTC.browser);
        $('#browserVersion').text(sdk.RTC.browserVersion);

        if (sdk.RTC.webrtcSupported) {
            $('#webrtc').addClass('success');
        } else {
            $('#webrtc').addClass('danger');
        }

        if (sdk.RTC.isPhenixEnabled()) {
            $('#phenix').addClass('success');
        } else if (sdk.RTC.phenixSupported) {
            $('#phenix').addClass('warning');
        } else {
            $('#phenix').addClass('danger');
        }

        if (getUrlParameter('url')) {
            $('#environment').append($('<option></option>').attr('value', getUrlParameter('url')).attr('selected', 'selected').text(getUrlParameter('url')));
        }

        if (getUrlParameter('applicationId')) {
            $('#applicationId').val(getUrlParameter('applicationId'));
        }

        if (getUrlParameter('secret')) {
            $('#secret').val(getUrlParameter('secret'));
        }

        if (getUrlParameter('streamId')) {
            $('#stream').append($('<option></option>').attr('value', getUrlParameter('streamId')).attr('selected', 'selected').text(getUrlParameter('streamId')));
            $('#originStreamId').val(getUrlParameter('streamId'));
        }

        var adminBaseUri;
        var pcast;

        var createPCast = function createPCast() {
            if (pcast) {
                pcast.stop();
            }

            var uri = $('#environment option:selected').val();
            var parser = document.createElement('a');
            parser.href = uri;

            adminBaseUri = 'https://' + parser.hostname;

            if (parser.port) {
                adminBaseUri += ':' + parser.port;
            }

            fingerprint.get(function (fingerprint) {
                pcast = new sdk.PCast({
                    uri: uri,
                    deviceId: fingerprint,
                    shaka: shaka
                });

                pcast.getLogger().setApplicationVersion(version);

                setLoggerUserId();
                setLoggerEnvironment();
            });
        };

        var createAuthToken = function createAuthToken() {
            var applicationId = $('#applicationId').val();
            var secret = $('#secret').val();
            var data = {
                applicationId: applicationId,
                secret: secret
            };

            $.ajax({
                url: adminBaseUri + '/pcast/auth',
                accepts: 'application/json',
                contentType: 'application/json',
                method: 'POST',
                data: JSON.stringify(data)
            }).done(function (result) {
                $('.authToken').val(result.authenticationToken);
                activateStep('step-2');
                setTimeout(function () {
                    activateStep('step-3');
                }, 1500);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                $.notify({
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Auth</strong>',
                    message: 'Failed to create authentication token (' + (errorThrown || jqXHR.status) + ')'
                }, {
                    type: 'danger',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 5000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });
            });
        };

        var start = function start() {
            pcast.start($('#authToken').val(), function authenticateCallback(pcast, status, sessionId) {
                $('#stop').removeClass('disabled');
                $('.sessionId').val(sessionId);
            }, function onlineCallback() {
                $.notify({
                    icon: 'glyphicon glyphicon-log-in',
                    title: '<strong>Online</strong>',
                    message: 'Connected to PCast&trade;'
                }, {
                    type: 'success',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 3000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });
                activateStep('step-4');
                setTimeout(function () {
                    activateStep('step-5');
                }, 1500);
            }, function offlineCallback() {
                $.notify({
                    icon: 'glyphicon glyphicon-log-out',
                    title: '<strong>Offline</strong>',
                    message: 'Disconnected from PCast&trade;'
                }, {
                    type: 'warning',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 5000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });
            });
        };

        var stop = function stop() {
            pcast.stop();
            $('.sessionId').val('');
            $('#stop').addClass('disabled');
        };

        var updateOptions = function updateOptions() {
            $('input[name="option"]').each(function () {
                var option = $(this).val();

                $('.' + option).addClass('option-disabled');
            });

            var option = $('input[name="option"]:checked').val();

            $('.' + option).removeClass('option-disabled');
        };

        var getUserMedia = function getUserMedia() {
            var userMediaCallback = function userMediaCallback(pcast, status, stream, e) {
                if (status !== 'ok') {
                    $.notify({
                        icon: 'glyphicon glyphicon-facetime-video',
                        title: '<strong>User Media</strong>',
                        message: 'Failed to get user media (' + e + ')'
                    }, {
                        type: 'danger',
                        allow_dismiss: false, // eslint-disable-line camelcase
                        placement: {
                            from: 'bottom',
                            align: 'right'
                        },
                        delay: 5000,
                        animate: {
                            enter: 'animated fadeInUp',
                            exit: 'animated fadeOutDown'
                        }
                    });
                    $('#userMediaInfo').text('Failed: ' + e.message);
                } else {
                    console.log('Got user media stream');
                    $.notify({
                        icon: 'glyphicon glyphicon-facetime-video',
                        title: '<strong>User Media</strong>',
                        message: 'Acquired user media stream'
                    }, {
                        type: 'info',
                        allow_dismiss: false, // eslint-disable-line camelcase
                        placement: {
                            from: 'bottom',
                            align: 'right'
                        },
                        delay: 3000,
                        animate: {
                            enter: 'animated fadeInUp',
                            exit: 'animated fadeOutDown'
                        }
                    });

                    // **********
                    // IMPORTANT: update reference to element as some RTC implementation will replace the element in the DOM
                    // **********

                    userMediaStream = stream;
                    $('#stopUserMedia').removeClass('disabled');

                    $('#userMediaInfo').html('User Media Stream is running with ' + stream.getTracks().length + ' tracks');
                    activateStep('step-5-2');

                    var primaryStream = new MediaStream();
                    var secondaryStream = new MediaStream();

                    _.forEach(userMediaStream.getTracks(), function (track) {
                        var trackCount = _.filter(primaryStream.getTracks(), function(primaryStreamTrack) {
                            return primaryStreamTrack.kind === track.kind;
                        }).length;

                        if (trackCount === 1) {
                            return secondaryStream.addTrack(track);
                        }

                        return primaryStream.addTrack(track);
                    });

                    localVideoEl = sdk.RTC.attachMediaStream(localVideoEl, primaryStream);

                    displayVideoElementAndControlsWhileStreamIsActive(primaryStream, localVideoEl, function setOnEnded(callback) {
                        primaryStream.getTracks()[0].onended = callback;
                    });

                    if (secondaryStream.getTracks().length > 0) {
                        localVideoSecondaryEl = sdk.RTC.attachMediaStream(localVideoSecondaryEl, secondaryStream);

                        displayVideoElementAndControlsWhileStreamIsActive(secondaryStream, localVideoSecondaryEl, function setOnEnded(callback) {
                            secondaryStream.getTracks()[0].onended = callback;
                        });
                    }
                }
            };

            if (!userMediaStream || userMediaStream.ended) {
                var source = $('#gum-source option:selected').val();
                var quality = $('#gum-quality option:selected').val();
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
                            {minHeight: quality}
                        ]
                    };

                    break;
                case 'cameraAndMicrophone':
                    userMediaOptions.audio = true;
                    userMediaOptions.video = {
                        optional: [
                            {minHeight: quality}
                        ]
                    };

                    break;
                case 'cameraMicrophoneAndScreen':
                    userMediaOptions.screen = true;
                    userMediaOptions.audio = true;
                    userMediaOptions.video = {
                        optional: [
                            {minHeight: quality}
                        ]
                    };

                    break;
                default:
                    throw new Error('Unsupported User Media Options');
                }

                pcast.getUserMedia(userMediaOptions, userMediaCallback);
            }
        };

        var stopUserMedia = function () {
            if (userMediaStream) {
                var tracks = userMediaStream.getTracks();

                for (var i = 0; i < tracks.length; i++) {
                    tracks[i].stop();
                }

                userMediaStream = null;

                $('#stopUserMedia').addClass('disabled');
            }
        };

        var publisher;

        var publish = function publish() {
            if (!userMediaStream) {
                $.notify({
                    icon: 'glyphicon glyphicon-facetime-video',
                    title: '<strong>User Media</strong>',
                    message: 'Please acquire the user media before publishing'
                }, {
                    type: 'danger',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 8000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });

                return;
            }

            var streamToken = $('#streamTokenForPublishing').val();

            if (!streamToken) {
                $.notify({
                    icon: 'glyphicon glyphicon-facetime-video',
                    title: '<strong>Stream Token</strong>',
                    message: 'Please create a stream token before publishing'
                }, {
                    type: 'danger',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 8000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });

                return;
            }

            var tags = ['my-stream-id'];

            var publishCallback = function publishCallback(pcast, status, phenixPublisher) {
                if (status !== 'ok') {
                    $.notify({
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Publish</strong>',
                        message: 'Failed to publish stream (' + status + ')'
                    }, {
                        type: 'danger',
                        allow_dismiss: false, // eslint-disable-line camelcase
                        placement: {
                            from: 'bottom',
                            align: 'right'
                        },
                        delay: 5000,
                        animate: {
                            enter: 'animated fadeInUp',
                            exit: 'animated fadeOutDown'
                        }
                    });

                    return;
                }

                publisher = phenixPublisher;
                $('#stopPublisher').removeClass('disabled');

                publisher.setDataQualityChangedCallback(function (publisher, status, reason) {
                    $.notify({
                        icon: 'glyphicon glyphicon-film',
                        title: '<strong>Publish</strong>',
                        message: 'Data quality update: sending ' + status + ' with limitation ' + reason
                    }, {
                        type: 'info',
                        allow_dismiss: false, // eslint-disable-line camelcase
                        placement: {
                            from: 'bottom',
                            align: 'right'
                        },
                        delay: 5000,
                        animate: {
                            enter: 'animated fadeInUp',
                            exit: 'animated fadeOutDown'
                        }
                    });
                });

                publisher.setPublisherEndedCallback(function (publisher, reason) {
                    $.notify({
                        icon: 'glyphicon glyphicon-film',
                        title: '<strong>Publish</strong>',
                        message: 'The published stream ended for reason "' + reason + '"'
                    }, {
                        type: 'info',
                        allow_dismiss: false, // eslint-disable-line camelcase
                        placement: {
                            from: 'bottom',
                            align: 'right'
                        },
                        delay: 5000,
                        animate: {
                            enter: 'animated fadeInUp',
                            exit: 'animated fadeOutDown'
                        }
                    });
                });

                var limit = publisher.limitBandwidth(400000);

                setTimeout(function () {
                    limit.dispose();
                }, 10000);

                $.notify({
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Publish</strong>',
                    message: 'Started publishing stream "' + publisher.getStreamId() + '"'
                }, {
                    type: 'success',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 3000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });

                $('.streamIdForPublishing').val(publisher.getStreamId());
                $('#originStreamId').val(publisher.getStreamId());
                activateStep('step-5-5');
                setTimeout(function () {
                    activateStep('step-6');
                }, 1500);
            };

            pcast.publish(streamToken, userMediaStream, publishCallback, tags);
        };

        var stopPublisher = function () {
            if (publisher) {
                publisher.stop();
                publisher = null;
                $('#stopPublisher').addClass('disabled');
                $('.streamIdForPublishing').val('');
            }
        };

        var onStreamSelected = function onStreamSelected() {
            var streamId = $('#stream option:selected').text();

            if (streamId) {
                $('#originStreamId').val(streamId);
                activateStep('step-6');
            }
        };

        var listStreams = function listStreams() {
            var applicationId = $('#applicationId').val();
            var secret = $('#secret').val();

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
                url: adminBaseUri + '/pcast/streams',
                accepts: 'application/json',
                contentType: 'application/json',
                method: 'PUT',
                data: JSON.stringify(data)
            }).done(function (result) {
                $('#stream').find('option').remove().end();

                if (result.streams.length > 0) {
                    $('#stream').append($('<option></option>').attr('value', '').text('Please select a stream'));

                    _.forEach(result.streams, function (stream) {
                        $('#stream').append($('<option></option>').attr('value', stream.streamId).text(stream.streamId));
                    });
                } else {
                    $('#stream').append($('<option></option>').attr('value', '').text('No stream available - Please publish a stream'));
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                $.notify({
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Streams</strong>',
                    message: 'Failed to list streams (' + (errorThrown || jqXHR.status) + ')'
                }, {
                    type: 'danger',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 5000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });
            });
        };

        var createStreamToken = function createStreamToken(targetElementSelector, applicationId, secret, sessionId, originStreamId, capabilities, callback) {
            var data = {
                applicationId: applicationId,
                secret: secret,
                sessionId: sessionId,
                originStreamId: originStreamId,
                capabilities: capabilities
            };

            $.ajax({
                url: adminBaseUri + '/pcast/stream',
                accepts: 'application/json',
                contentType: 'application/json',
                method: 'POST',
                data: JSON.stringify(data)
            }).done(function (result) {
                $(targetElementSelector).val(result.streamToken);
                $.notify({
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Stream</strong>',
                    message: 'Created token for stream "' + originStreamId + '"'
                }, {
                    type: 'success',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 3000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });
                callback(result.streamToken);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                $.notify({
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Stream</strong>',
                    message: 'Failed to create stream token (' + (errorThrown || jqXHR.status) + ')'
                }, {
                    type: 'danger',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 5000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });
            });
        };

        var createStreamTokenForPublishing = function createStreamTokenForPublishing() {
            var applicationId = $('#applicationId').val();
            var secret = $('#secret').val();
            var sessionId = $('#sessionIdForPublishing').val();
            var originStreamId = '';
            var capabilities = [];

            $('#publish-capabilities option:selected').each(function () {
                capabilities.push($(this).val());
            });

            capabilities.push($('#publish-quality option:selected').val());

            return createStreamToken('.streamTokenForPublishing', applicationId, secret, sessionId, originStreamId, capabilities, function () {
                activateStep('step-5-3');
                setTimeout(function () {
                    activateStep('step-5-4');
                }, 1500);
            });
        };

        var createStreamTokenForViewing = function createStreamTokenForViewing() {
            var applicationId = $('#applicationId').val();
            var secret = $('#secret').val();
            var sessionId = $('#sessionIdForViewing').val();
            var originStreamId = $('#originStreamId').val();
            var capabilities = [];

            capabilities.push($('#subscriber-mode option:selected').val());

            $('#subscriber-drm-capabilities option:selected').each(function () {
                capabilities.push($(this).val());
            });

            return createStreamToken('.streamTokenForViewing', applicationId, secret, sessionId, originStreamId, capabilities, function () {
                activateStep('step-7');
                setTimeout(function () {
                    activateStep('step-8');
                }, 1500);
            });
        };

        var subscriberMediaStream = null;

        var subscribe = function subscribe() {
            var streamToken = $('#streamTokenForViewing').val();

            pcast.subscribe(streamToken, function subscribeCallback(pcast, status, mediaStream) {
                if (status !== 'ok') {
                    $.notify({
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Subscribe</strong>',
                        message: 'Failed to subscribe to stream (' + status + ')'
                    }, {
                        type: 'danger',
                        allow_dismiss: false, // eslint-disable-line camelcase
                        placement: {
                            from: 'bottom',
                            align: 'right'
                        },
                        delay: 5000,
                        animate: {
                            enter: 'animated fadeInUp',
                            exit: 'animated fadeOutDown'
                        }
                    });

                    return;
                }

                mediaStream.monitor({}, monitorStream);

                var primaryMediaStream = mediaStream;

                if (mediaStream.getStream() && mediaStream.getStream().getTracks().length > 2) {
                    primaryMediaStream = mediaStream.select(function (track, index) {
                        return (track.kind === 'video' || track.kind === 'audio') && index < 2;
                    });
                }

                var primaryStream = primaryMediaStream.getStream();

                displayVideoElementAndControlsWhileStreamIsActive(primaryStream, remoteVideoEl, _.bind(primaryMediaStream.setStreamEndedCallback, primaryMediaStream));
                attachMediaStreamToVideoElement(primaryMediaStream, remoteVideoEl);

                if (mediaStream.getStream() && mediaStream.getStream().getTracks().length > 2) {
                    var secondaryMediaStream = mediaStream.select(function(track, index) {
                        return track.kind === 'video' && index === 2;
                    });

                    var secondaryStream = secondaryMediaStream.getStream();

                    displayVideoElementAndControlsWhileStreamIsActive(secondaryStream, remoteVideoSecondaryEl, _.bind(secondaryMediaStream.setStreamEndedCallback, secondaryMediaStream));
                    attachMediaStreamToVideoElement(secondaryMediaStream, remoteVideoSecondaryEl);
                }

                $.notify({
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Stream</strong>',
                    message: 'Starting stream'
                }, {
                    type: 'success',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 3000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });

                subscriberMediaStream = mediaStream;
                $('#stopSubscriber').removeClass('disabled');
            });
        };

        var stopSubscriber = function (reason) {
            if (subscriberMediaStream) {
                subscriberMediaStream.stop(reason);
                subscriberMediaStream = null;
                $('#stopSubscriber').addClass('disabled');
            }
        };

        var monitorStream = function monitorStream(stream, reason) {
            switch (reason) {
            case 'client-side-failure':
                $.notify({
                    icon: 'glyphicon glyphicon-remove-sign',
                    title: '<strong>Monitor</strong>',
                    message: 'Stream Failure'
                }, {
                    type: 'danger',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 3000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });

                // Handle failure event, redo stream
                break;
            default:
                $.notify({
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Monitor</strong>',
                    message: 'Stream Healthy'
                }, {
                    type: 'success',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 3000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });

                    // No failure has occurred, handle monitor event
                break;
            }
        };

        var displayVideoElementAndControlsWhileStreamIsActive = function displayVideoElementWhileStreamIsActive(stream, videoElement, onEnd) {
            var video = $(videoElement);
            var videoControls = $('[data-video-target=' + videoElement.id + ']');
            var shouldVideoBeHidden = video.hasClass('hidden');

            if (shouldVideoBeHidden) {
                video.removeClass('hidden');
            }

            videoControls.removeClass('hidden');

            if (stream) {
                videoTargetStreams[videoElement.id] = stream;

                setAudioMuteClass(!isMediaStreamTrackEnabled(stream, true), $(videoControls.selector + '.mute'));
                setVideoMuteClass(!isMediaStreamTrackEnabled(stream, false), $(videoControls.selector + '.mute-video'));
            } else {
                $(videoControls.selector + '.mute').addClass('hidden');
                $(videoControls.selector + '.mute-video').addClass('hidden');
            }

            onEnd(function() {
                if (shouldVideoBeHidden) {
                    video.addClass('hidden');
                }

                videoControls.addClass('hidden');

                delete videoTargetStreams[videoElement.dataset.target];
            });
        };

        var attachMediaStreamToVideoElement = function attachMediaStreamToVideoElement(mediaStream, element) {
            var renderer = mediaStream.createRenderer();

            renderer.setDataQualityChangedCallback(function (renderer, status, reason) {
                $.notify({
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Publish</strong>',
                    message: 'Data quality update: receiving ' + status + ' with limitation ' + reason
                }, {
                    type: 'info',
                    allow_dismiss: false, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 5000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });
            });

            element = renderer.start(element);

            renderer.setVideoDisplayDimensionsChangedCallback(function (renderer, dimensions) {
                $.notify({
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Video Dimensions Changed</strong>',
                    message: 'Video dimensions changed: new width = ' + dimensions.width + ', new height = ' + dimensions.height
                }, {
                    type: 'info',
                    allow_dismiss: true, // eslint-disable-line camelcase
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    },
                    delay: 3000,
                    animate: {
                        enter: 'animated fadeInUp',
                        exit: 'animated fadeOutDown'
                    }
                });

                setVideoWidthAndHeight(element);
            });
        };

        var handleFullscreenButtonClick = function handleFullscreenButtonClick() {
            if (!this.dataset.videoTarget) {
                throw new Error('Button Must Have Target');
            }

            var video = $('#' + this.dataset.videoTarget)[0];

            requestFullscreen(video);
        };

        var requestFullscreen = function requestFullScreen(element) {
            if (!element) {
                throw new Error('Element required to request full screen');
            }

            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        };

        var handleMuteButtonClick = function handleMuteButtonClick() {
            if (!this.dataset.videoTarget) {
                throw new Error('Button Must Have Target');
            }

            var stream = videoTargetStreams[this.dataset.videoTarget];

            if (stream) {
                var isMuted = toggleMuteMediaStreamTrack(stream, true);

                setAudioMuteClass(isMuted, $(this));
            }
        };

        var handleMuteVideoButtonClick = function handleMuteVideoButtonClick() {
            if (!this.dataset.videoTarget) {
                throw new Error('Button Must Have Target');
            }

            var stream = videoTargetStreams[this.dataset.videoTarget];

            if (stream) {
                var isMuted = toggleMuteMediaStreamTrack(stream, false);

                setVideoMuteClass(isMuted, $(this));
            }
        };

        var isMediaStreamTrackEnabled = function(stream, isAudio) {
            var tracks = isAudio ? stream.getAudioTracks() : stream.getVideoTracks();

            if (!tracks || !tracks.length) {
                return false;
            }

            return tracks[0].enabled;
        };

        var toggleMuteMediaStreamTrack = function toggleAudioMuteMediaStream(stream, isAudio) {
            var tracks = isAudio ? stream.getAudioTracks() : stream.getVideoTracks();
            var isEnabled = isMediaStreamTrackEnabled(stream, isAudio);

            if (!tracks || !tracks.length) {
                return !isEnabled;
            }

            _.forEach(tracks, function(track) {
                track.enabled = !isEnabled;
            });

            return isEnabled;
        };

        var setAudioMuteClass = function setAudioMuteClass(isMuted, element) {
            if (isMuted) {
                element.removeClass('glyphicon-volume-up');
                element.addClass('glyphicon-volume-off');
            } else {
                element.addClass('glyphicon-volume-up');
                element.removeClass('glyphicon-volume-off');
            }
        };

        var setVideoMuteClass = function setVideoMuteClass(isMuted, element) {
            if (isMuted) {
                element.addClass('toggle-off');
            } else {
                element.removeClass('toggle-off');
            }
        };

        function setLoggerUserId() {
            if (!pcast) {
                return;
            }

            var logger = pcast.getLogger();

            logger.setUserId($('#applicationId').val());
        }

        function setLoggerEnvironment() {
            if (!pcast) {
                return;
            }

            var env = $('#environment').val().toLowerCase();
            var logger = pcast.getLogger();

            if(env.indexOf('local') > -1) {
                logger.setEnvironment('local');
            } else if (env.indexOf('stg')) {
                logger.setEnvironment('staging');
            } else {
                logger.setEnvironment('production');
            }
        }

        $('#environment').change(function () {
            createPCast();
            listStreams();
            setLoggerEnvironment();
        });

        $('#applicationId').change(function() {
            listStreams();
            setLoggerUserId();
        });

        $('input[type="radio"]').on('change', function () {
            updateOptions();
        });

        updateOptions();

        $('#secret').change(listStreams);
        $('#createAuthToken').click(createAuthToken);

        $('#start').click(start);
        $('#stop').click(stop);

        $('#getUserMedia').click(getUserMedia);
        $('#stopUserMedia').click(stopUserMedia);
        $('#createStreamTokenForPublishing').click(createStreamTokenForPublishing);
        $('#publish').click(publish);
        $('#stopPublisher').click(stopPublisher);
        $('#stream').change(onStreamSelected);
        $('#stream-refresh').click(listStreams);

        $('#createStreamTokenForViewing').click(createStreamTokenForViewing);

        $('#subscribe').click(subscribe);
        $('#stopSubscriber').click(_.bind(stopSubscriber, null, 'stopped-by-user'));

        $('.fullscreen').click(handleFullscreenButtonClick);
        $('.mute').click(handleMuteButtonClick);
        $('.mute-video').click(handleMuteVideoButtonClick);

        createPCast();
        enableSteps();
    };

    $(function () {
        init();

        // Plugin might load with delay
        if (sdk.RTC.phenixSupported && !sdk.RTC.isPhenixEnabled()) {
            sdk.RTC.onload = init;
        }
    });
});