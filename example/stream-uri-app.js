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
        'phenix-rtc': '/phenix-rtc/dist/phenix-rtc',
        'jquery': '/jquery/dist/jquery.min',
        'lodash': '/lodash/dist/lodash.min',
        'bootstrap': '/bootstrap/dist/js/bootstrap.min',
        'protobuf': '/protobuf/dist/ProtoBuf.min',
        'bootstrap-notify': '/remarkable-bootstrap-notify/dist/bootstrap-notify.min',
        'fingerprintjs2': '/fingerprintjs2/dist/fingerprint2.min',
        'Long': '/long/dist/long.min',
        'ByteBuffer': '/bytebuffer/dist/ByteBufferAB.min',
        'shaka-player': '/shaka-player/dist/shaka-player.compiled',
    }
});

requirejs(['jquery', 'lodash', 'bootstrap-notify', 'fingerprintjs2', 'phenix-rtc', 'phenix-web-sdk', 'shaka-player'], function ($, _, bootstrapNotify, Fingerprint, rtc, sdk, shaka) {
    var init = function init() {
        var fingerprint = new Fingerprint();
        var remoteVideoEl = $('#remoteVideo')[0];
        var remoteVideoSecondaryEl = $('#remoteVideoSecondary')[0];

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

            $('html, body').animate({
                scrollTop: $('.' + enabledSteps[enabledSteps.length - 1]).offset().top - ($(window).height() / 3)
            }, 'slow');
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
                allow_dismiss: false,
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

        $('#phenixRTCVersion').text(rtc.phenixVersion);
        $('#browser').text(rtc.browser);
        $('#browserVersion').text(rtc.browserVersion)
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
                pcast = new sdk.PCast({uri: uri, deviceId: fingerprint, shaka: shaka});
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
                    allow_dismiss: false,
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
            }, function onlineCallback(pcast) {
                $.notify({
                    icon: 'glyphicon glyphicon-log-in',
                    title: '<strong>Online</strong>',
                    message: 'Connected to PCast&trade;'
                }, {
                    type: 'success',
                    allow_dismiss: false,
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
            }, function offlineCallback(pcast) {
                $.notify({
                    icon: 'glyphicon glyphicon-log-out',
                    title: '<strong>Offline</strong>',
                    message: 'Disconnected from PCast&trade;'
                }, {
                    type: 'warning',
                    allow_dismiss: false,
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

        var publisher;

        var parseArray = function parseArray(stringWithNewlineSeparator) {
            if (!stringWithNewlineSeparator) {
                return [];
            }

            return stringWithNewlineSeparator.split('\n');
        };

        var publish = function publish() {
            var sourceUri = $('#sourceUriForPublishing').val();
            var sourceOptions = parseArray($('#sourceOptionsForPublishing').val());

            if (!sourceUri) {
                $.notify({
                    icon: 'glyphicon glyphicon-cd',
                    title: '<strong>Source URI</strong>',
                    message: 'Please provide a source URI before publishing'
                }, {
                    type: 'danger',
                    allow_dismiss: false,
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
                    allow_dismiss: false,
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

            var tags = [];

            var publishCallback = function publishCallback(pcast, status, phenixPublisher) {
                if (status !== 'ok') {
                    $.notify({
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Publish</strong>',
                        message: 'Failed to publish stream (' + status + ')'
                    }, {
                        type: 'danger',
                        allow_dismiss: false,
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
                        allow_dismiss: false,
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

                publisher.setPublisherEndedCallback(function (publisher, reason, reasonDescription) {
                    $.notify({
                        icon: 'glyphicon glyphicon-film',
                        title: '<strong>Publish</strong>',
                        message: 'The published stream ended for reason "' + reason + '"'
                    }, {
                        type: 'info',
                        allow_dismiss: false,
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

                $.notify({
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Publish</strong>',
                    message: 'Started publishing stream "' + publisher.getStreamId() + '"'
                }, {
                    type: 'success',
                    allow_dismiss: false,
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
                activateStep('step-8');
                setTimeout(function () {
                    activateStep('step-9');
                }, 1500);
            };

            var options = {
                connectOptions: sourceOptions
            };

            pcast.publish(streamToken, sourceUri, publishCallback, tags, options);
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
                    allow_dismiss: false,
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
                    allow_dismiss: false,
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
                    allow_dismiss: false,
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

            return createStreamToken('.streamTokenForPublishing', applicationId, secret, sessionId, originStreamId, capabilities, function () {
                activateStep('step-6');
                setTimeout(function () {
                    activateStep('step-7');
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

            return createStreamToken('.streamTokenForViewing', applicationId, secret, sessionId, originStreamId, capabilities, function () {
                activateStep('step-10');
                setTimeout(function () {
                    activateStep('step-11');
                }, 1500);
            });
        };

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
                        allow_dismiss: false,
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

                mediaStream.setStreamEndedCallback(function (mediaStream, reason, reasonDescription) {
                    $.notify({
                        icon: 'glyphicon glyphicon-film',
                        title: '<strong>Stream</strong>',
                        message: 'The stream ended for reason "' + reason + '"'
                    }, {
                        type: 'info',
                        allow_dismiss: false,
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

                mediaStream.monitor({}, monitorStream);

                var primaryMediaStream = mediaStream.select(function(track, index) {
                    return (track.kind === 'video' || track.kind === 'audio') && index < 2;
                });

                displayVideoElementAndControlsWhileStreamIsActive(primaryMediaStream, remoteVideoEl);
                attachMediaStreamToVideoElement(primaryMediaStream, remoteVideoEl);

                if (typeof mediaStream.getStream === 'function' && mediaStream.getStream().getTracks().length > 2) {
                    var secondaryMediaStream = mediaStream.select(function(track, index) {
                        return track.kind === 'video' && index == 2;
                    });

                    displayVideoElementAndControlsWhileStreamIsActive(secondaryMediaStream, remoteVideoSecondaryEl);
                    attachMediaStreamToVideoElement(secondaryMediaStream, remoteVideoSecondaryEl);
                }

                $.notify({
                    icon: 'glyphicon glyphicon-film',
                    title: '<strong>Stream</strong>',
                    message: 'Starting stream'
                }, {
                    type: 'success',
                    allow_dismiss: false,
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

                setTimeout(function () {
                    mediaStream.stop('stopped-by-client');
                }, 30000);
            });
        };

        var monitorStream = function monitorStream(stream, reason, description) {
            switch (reason) {
                case  'client-side-failure':
                    $.notify({
                        icon: 'glyphicon glyphicon-remove-sign',
                        title: '<strong>Monitor</strong>',
                        message: 'Stream Failure'
                    }, {
                        type: 'danger',
                        allow_dismiss: false,
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
                    // handle failure event, redo stream
                    break;
                default:
                    $.notify({
                        icon: 'glyphicon glyphicon-film',
                        title: '<strong>Monitor</strong>',
                        message: 'Stream Healthy'
                    }, {
                        type: 'success',
                        allow_dismiss: false,
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
                    // no failure has occurred, handle monitor event
                    break;
            }
        };

        var displayVideoElementAndControlsWhileStreamIsActive = function displayVideoElementWhileStreamIsActive(mediaStream, videoElement) {
            var video = $(videoElement);
            var videoControls = $('[data-video-target=' + videoElement.id + ']');
            var shouldVideoBeHidden = video.hasClass('hidden');

            if (shouldVideoBeHidden) {
                video.removeClass('hidden');
            }

            videoControls.removeClass('hidden');

            mediaStream.setStreamEndedCallback(function() {
                if (shouldVideoBeHidden) {
                    video.addClass('hidden');
                }

                videoControls.addClass('hidden');
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
                    allow_dismiss: false,
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
                    allow_dismiss: true,
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

        $('#environment').change(function () {
            createPCast();
            listStreams();
        });

        $('input[type="radio"]').on('change', function () {
            updateOptions();
        });

        updateOptions();

        $('#applicationId').change(listStreams);
        $('#secret').change(listStreams);
        $('#createAuthToken').click(createAuthToken);

        $('#start').click(start);
        $('#stop').click(stop);

        $('#createStreamTokenForPublishing').click(createStreamTokenForPublishing);
        $('#publish').click(publish);
        $('#stopPublisher').click(stopPublisher);
        $('#stream').change(onStreamSelected);
        $('#stream-refresh').click(listStreams);

        $('#createStreamTokenForViewing').click(createStreamTokenForViewing);

        $('#subscribe').click(subscribe);

        $('.fullscreen').click(handleFullscreenButtonClick);

        createPCast();
        enableSteps();
    };

    $(function () {
        init();

        // Plugin might load with delay
        if (rtc.phenixSupported && !rtc.isPhenixEnabled()) {
            rtc.onload = init;
        }
    });
});
