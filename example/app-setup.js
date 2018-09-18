/**
 * Copyright 2018 PhenixP2P Inc. All Rights Reserved.
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
var version = '1.0.0'; // ToDo: use until sample app separated from repo

define('app-setup', [
    'jquery',
    'lodash',
    'bootstrap-notify',
    'fingerprintjs2',
    'phenix-web-sdk',
    'shaka-player'
], function($, _, bootstrapNotify, Fingerprint, sdk, shaka) {
    var enabledSteps = ['step-1'];
    var onStepsReset;
    var defaultPublisherQuality = 'hd';

    var init = function init() {
        $('#phenixRTCVersion').text(sdk.utils.rtc.phenixVersion);
        $('#browserName').text(sdk.utils.rtc.browser);
        $('#browserVersion').text(sdk.utils.rtc.browserVersion);

        if (sdk.utils.rtc.webrtcSupported) {
            $('#webrtc').addClass('success');
            $('#webrtc .support').removeClass('glyphicon-remove');
            $('#webrtc .support').addClass('glyphicon-ok');
        } else {
            $('#webrtc').addClass('danger');
            $('#webrtc .support').removeClass('glyphicon-ok');
            $('#webrtc .support').addClass('glyphicon-remove');
        }

        if (sdk.utils.rtc.isPhenixEnabled()) {
            $('#phenix').addClass('success');
        } else if (sdk.utils.rtc.phenixSupported) {
            $('#phenix').addClass('warning');
        } else {
            $('#phenix').addClass('danger');
        }

        var canPlayHls = document.createElement('video').canPlayType('application/vnd.apple.mpegURL') === 'maybe';

        if (!canPlayHls && !shaka.Player.isBrowserSupported()) {
            shaka.polyfill.installAll();
        }

        if (document.getElementById('environment')) {
            _.forOwn(getPCastEndpoints(), function(name, endpoint) {
                $('#environment').append($('<option></option>').attr('value', endpoint).text(name));
            });
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

        if (getUrlParameter('channelAlias')) {
            $('#channelAlias').val(getUrlParameter('channelAlias'));
        }

        if (getUrlParameter('alias')) {
            $('#alias').val(getUrlParameter('alias'));
        }

        if (document.getElementById('publish-capabilities')) {
            _.forOwn(getPublisherCapabilities(), function(title, capability) {
                $('#publish-capabilities').append($('<option></option>').attr('value', capability).text(title));
            });
        }

        if (document.getElementById('subscriber-mode')) {
            _.forOwn(getSubscriberCapabilities(), function(title, capability) {
                $('#subscriber-mode').append($('<option></option>').attr('value', capability).text(title));
            });
        }

        if (document.getElementById('publish-quality')) {
            _.forOwn(getPublisherQualities(), function(title, capability) {
                $('#publish-quality').append($('<option></option>').attr('value', capability).text(title));
            });

            if ($('#publish-quality [value=' + defaultPublisherQuality + ']')) {
                $('#publish-quality [value=' + defaultPublisherQuality + ']').attr('selected', 'selected');
            }
        }

        var updateOptions = function updateOptions() {
            $('input[name="option"]').each(function() {
                var option = $(this).val();

                $('.' + option).addClass('option-disabled');
            });

            var option = $('input[name="option"]:checked').val();

            $('.' + option).removeClass('option-disabled');
        };

        $('#environment').change(function() {
            if (onStepsReset) {
                onStepsReset();
            }
        });

        $('input[type="radio"]').on('change', function() {
            updateOptions();
        });

        updateOptions();
        enableSteps();
    };

    var getUri = function getUri() {
        return $('#environment option:selected').val();
    };

    var getBaseUri = function parseBaseUri() {
        var uri = getUri();
        var parser = document.createElement('a');
        parser.href = uri;

        var adminBaseUri = 'https://' + parser.hostname;

        if (parseInt(parser.port, 10)) {
            adminBaseUri += ':' + parser.port;
        }

        return adminBaseUri;
    };

    var getUrlParameter = function getUrlParameter(parameterName, defaultValue) {
        const queryParameters = window.location.search.substring(1).split('&');
        const queryParameter = _.find(queryParameters, function(queryParameter) {
            const equalsIndex = queryParameter.indexOf('=');
            const parameter = queryParameter.substring(0, equalsIndex);

            return parameter === parameterName || queryParameter === parameterName;
        }) || '';

        if (!queryParameter) {
            return defaultValue || '';
        }

        if (queryParameter.indexOf('=') === -1) {
            return 'true';
        }

        return queryParameter.substring(queryParameter.indexOf('=') + 1, queryParameter.length);
    };

    var getAuthData = function getAuthData() {
        return {
            applicationId: $('#applicationId').val(),
            secret: $('#secret').val()
        };
    };

    var setLoggerUserId = function setLoggerUserId(pcast) {
        if (!pcast) {
            return;
        }

        var logger = pcast.getLogger();

        logger.setUserId($('#applicationId').val());
    };

    var setLoggerEnvironment = function setLoggerEnvironment(pcast) {
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
    };

    var setLoggerVersion = function setLoggerVersion(pcast) {
        pcast.getLogger().setApplicationVersion(version);
    };

    var enableSteps = function enableSteps() {
        $('.step').addClass('step-disabled');
        $('.step .server').removeClass('step-active');
        $('.step .client').removeClass('step-active');

        enabledSteps.forEach(function(step) {
            $('.' + step).removeClass('step-disabled');
        });

        $('.' + enabledSteps[enabledSteps.length - 1] + ' .server').addClass('step-active');
        $('.' + enabledSteps[enabledSteps.length - 1] + ' .client').addClass('step-active');

        if (!$('.' + enabledSteps[enabledSteps.length - 1]).length) {
            return;
        }

        $('html, body').animate({scrollTop: $('.' + enabledSteps[enabledSteps.length - 1]).offset().top - ($(window).height() / 3)}, 'slow');
    };

    var activateStep = function activateStep(step) {
        enabledSteps.push(step);
        enableSteps();
    };

    function createNotification(type, message) {
        $.notify(message, {
            type: type,
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
    }

    var getModeFromAbbreviation = function getModeFromAbbreviation(mode) {
        switch (mode) {
        case 'r':
            return 'real-time';
        case 's':
            return 'streaming';
        case 'b':
            return 'broadcast';
        case 'l':
            return 'low-latency';
        default:
            return mode;
        }
    };

    var isMobile = function() {
        var userAgent = window.navigator.userAgent;
        var isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

        return isIOS || /Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(userAgent);
    };

    var getDefaultReplaceUrl = function() {
        if (getBaseUri().indexOf('stg') > -1) {
            return 'https://stg.phenixrts.com/video';
        }

        if (getBaseUri().indexOf('local') > -1) {
            return 'https://local.phenixrts.com:8443/video';
        }

        return 'https://phenixrts.com/video';
    };

    var getPCastEndpoints = function() {
        return {
            'https://pcast.phenixrts.com': 'Anycast (Closest Data Center)',
            'https://pcast-primary.phenixrts.com': 'Anycast (Closest Data Center - Primary)',
            'https://pcast-secondary.phenixrts.com': 'Anycast (Closest Data Center - Secondary)',
            'wss://pcast-asia-southeast.phenixrts.com': 'APAC South East',
            'wss://pcast-asia-east.phenixrts.com': 'APAC East',
            'wss://pcast-asia-northeast.phenixrts.com': 'APAC North East',
            'wss://pcast-asia-south.phenixrts.com': 'APAC South',
            'wss://pcast-australia-southeast.phenixrts.com': 'Australia South East',
            'wss://pcast-us-west.phenixrts.com': 'US West',
            'wss://pcast-us-southwest.phenixrts.com': 'US South West',
            'wss://pcast-us-central.phenixrts.com': 'US Central',
            'wss://pcast-us-east.phenixrts.com': 'US East',
            'wss://pcast-us-northeast.phenixrts.com': 'US North East',
            'wss://pcast-uk-southeast.phenixrts.com': 'UK South East',
            'wss://pcast-europe-west.phenixrts.com': 'EU West',
            'wss://pcast-europe-central.phenixrts.com': 'EU Central',
            'wss://pcast-southamerica-east.phenixrts.com': 'South America East',
            'https://pcast-stg.phenixrts.com': 'Anycast - Staging',
            'wss://pcast-stg-us-central.phenixrts.com': 'US Central - Staging',
            'wss://pcast-stg-europe-west.phenixrts.com': 'EU West - Staging',
            'https://local.phenixrts.com:8443': 'Anycast - Local',
            'wss://local.phenixrts.com:8443': 'Local'
        };
    };

    var getPublisherCapabilities = function() {
        return {
            'archive': 'Archive',
            'archive-audio-only': 'Archive Audio Only',
            'streaming': 'Streaming',
            'on-demand': 'On Demand',
            'low-latency': 'Low Latency (Streaming)',
            'prefer-h264': 'H264 (Real-time)',
            'drm': 'DRM',
            'high-fidelity': 'High Fidelity (Audio)',
            'multi-bitrate': 'Multi Bitrate (MBR)',
            'multi-bitrate-codec=vp8': 'VP8 MBR Codec',
            'multi-bitrate-codec=h264': 'H264 MBR Codec',
            'constant-gop-size': 'Constant GOP',
            'constant-resolution': 'Constant Resolution',
            'origin-shield': 'Origin Shield',
            'rtmp': 'RTMP'
        };
    };

    var getSubscriberCapabilities = function() {
        return {
            'real-time': 'Real-time',
            'prefer-vp8': 'Real-time VP8',
            'prefer-h264': 'Real-time H264',
            'single-bitrate': 'Real-time SBR',
            'broadcast': 'Broadcast',
            'streaming': 'Live',
            'on-demand': 'On Demand',
            'rtmp': 'Rtmp'
        };
    };

    var getPublisherQualities = function() {
        return {
            'uld': 'ULD',
            'vvld': 'VVLD',
            'vld': 'VLD',
            'ld': 'LD',
            'sd': 'SD',
            'hd': 'HD',
            'fhd': 'FHD',
            'xhd': 'XHD',
            'uhd': 'UHD'
        };
    };

    var getSwfFilePath = function() {
        return './rtmp-flash-renderer-2018.3.13.swf';
    };

    var addDebugAppender = function(pcast) {
        pcast.getLogger().addAppender({
            log: function() {
                $.ajax({
                    url: '/log',
                    accepts: 'application/json',
                    contentType: 'application/json',
                    method: 'POST',
                    data: JSON.stringify({messages: arguments})
                });
            }
        });
    };

    return {
        init: init,
        getUri: getUri,
        getBaseUri: getBaseUri,
        getAuthData: getAuthData,
        getUrlParameter: getUrlParameter,
        enableSteps: enableSteps,
        activateStep: activateStep,
        createNotification: createNotification,
        setOnReset: function(callback) {
            onStepsReset = callback;
        },
        setLoggerUserId: setLoggerUserId,
        setLoggerEnvironment: setLoggerEnvironment,
        setLoggerVersion: setLoggerVersion,
        getModeFromAbbreviation: getModeFromAbbreviation,
        isMobile: isMobile,
        getDefaultReplaceUrl: getDefaultReplaceUrl,
        getSwfFilePath: getSwfFilePath,
        addDebugAppender: addDebugAppender
    };
});