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

define('video-player', [
    'jquery',
    'lodash'
], function ($, _) {

    var Player = function(elementId) {
        this.videoId = elementId;
        this.video = document.getElementById(elementId);
        this.videoControls = null;
        this.onEnd = null;
    };

    Player.prototype.onToggleAudio = null;

    Player.prototype.onToggleVideo = null;

    Player.prototype.start = function start(stream) {
        this.stream = stream;
        this.videoControls = createVideoControls.call(this);

        this.video.parentNode.insertBefore(this.videoControls, this.video.nextElementSibling);

        setupVideoEvents.call(this);
        displayVideoElementAndControlsWhileStreamIsActive.call(this, this.stream.getStream(), this.video, this.onEnd);
    };

    Player.prototype.stop = function stop() {
        this.videoControls.remove();

        this.videoControls = null;
        this.onEnd = null;
    };

    function setupVideoEvents() {
        var newVideo = this.video;
        var that = this;

        if (this.stream.setStreamEndedCallback) {
            this.onEnd = _.bind(this.stream.setStreamEndedCallback, this.stream);

            newVideo.onloadedmetadata = function () {
                onLoadedMetaData(newVideo);
            };
        } else if (this.stream.setPublisherEndedCallback) {
            this.onEnd = _.bind(this.stream.setPublisherEndedCallback, this.stream);
        } else if (this.stream.getTracks) {
            this.onEnd = function setOnEnded(callback) {
                that.stream.getTracks()[0].onended = callback;
            };
        }

        return newVideo;
    }

    function createVideoControls() {
        var element = document.createElement('div');

        element.className = 'video-controls';
        element.appendChild(createMuteAudioControl.call(this));
        element.appendChild(createMuteVideoControl.call(this));
        element.appendChild(createFullscreenControl.call(this));

        return element;
    }

    function createMuteVideoControl() {
        var element = document.createElement('span');

        element.className = 'glyphicon glyphicon-facetime-video toggle-off video-control mute-video';
        element.dataset.targetVideo = this.videoId;
        element.onclick = handleMuteVideoButtonClick.bind(this);

        return element;
    }

    function createMuteAudioControl() {
        var element = document.createElement('span');

        element.className = 'glyphicon glyphicon-volume-off video-control mute';
        element.dataset.targetVideo = this.videoId;
        element.onclick = handleMuteButtonClick.bind(this);

        return element;
    }

    function createFullscreenControl() {
        var element = document.createElement('span');

        element.className = 'glyphicon glyphicon-fullscreen video-control fullscreen';
        element.dataset.targetVideo = this.videoId;
        element.onclick = handleFullscreenButtonClick.bind(this);

        return element;
    }

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

    var displayVideoElementAndControlsWhileStreamIsActive = function displayVideoElementWhileStreamIsActive(stream, videoElement, onEnd) {
        var video = $(videoElement);
        var videoControlsContainer = $(this.videoControls);
        var videoControls = $(videoControlsContainer).children();
        var shouldVideoBeHidden = video.hasClass('hidden');

        if (shouldVideoBeHidden) {
            video.removeClass('hidden');
        }

        videoControls.removeClass('hidden');

        if (stream) {
            setAudioMuteClass(!isMediaStreamTrackEnabled(stream, true), $(videoControlsContainer).find('.mute'));
            setVideoMuteClass(!isMediaStreamTrackEnabled(stream, false), $(videoControlsContainer).find('.mute-video'));
        } else {
            $(videoControlsContainer).find('.mute').addClass('hidden');
            $(videoControlsContainer).find('.mute-video').addClass('hidden');
        }

        onEnd(function() {
            if (shouldVideoBeHidden) {
                video.addClass('hidden');
            }

            videoControls.addClass('hidden');
        });
    };

    var handleFullscreenButtonClick = function handleFullscreenButtonClick(clickEvent) {
        var element = clickEvent.target;

        if (!element.dataset.targetVideo) {
            throw new Error('Button Must Have Target');
        }

        requestFullscreen(this.video);
    };

    var handleMuteButtonClick = function handleMuteButtonClick(clickEvent) {
        var element = clickEvent.target;

        if (!element.dataset.targetVideo) {
            throw new Error('Button Must Have Target');
        }

        if (this.stream && this.onToggleAudio) {
            var isMuted = !this.onToggleAudio(isMediaStreamTrackEnabled(this.stream.getStream(), true));

            setAudioMuteClass(isMuted, $(element));
        }
    };

    var handleMuteVideoButtonClick = function handleMuteVideoButtonClick(clickEvent) {
        var element = clickEvent.target;

        if (!element.dataset.targetVideo) {
            throw new Error('Button Must Have Target');
        }

        if (this.stream && this.onToggleVideo) {
            var isMuted = !this.onToggleVideo(isMediaStreamTrackEnabled(this.stream.getStream(), false));

            setVideoMuteClass(isMuted, $(element));
        }
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

    var isMediaStreamTrackEnabled = function(stream, isAudio) {
        var tracks = isAudio ? stream.getAudioTracks() : stream.getVideoTracks();

        if (!tracks || !tracks.length) {
            return false;
        }

        return tracks[0].enabled;
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

    return Player;
});