function setupMoviePlayer(config) {
    const video = document.getElementById(config.videoId);
    const overlay = document.getElementById(config.overlayId);
    let ready = false;
    let hls = null;

    const initialize = function () {
        if (!video || ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(config.source);
            hls.attachMedia(video);
        } else {
            video.src = config.source;
        }

        ready = true;
    };

    const play = function () {
        initialize();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    };

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
