(function () {
  var holder = document.querySelector('[data-player]');

  if (!holder) {
    return;
  }

  var video = holder.querySelector('video');
  var overlay = holder.querySelector('[data-play-overlay]');
  var source = video ? video.getAttribute('src') : '';
  var hls = null;
  var ready = false;

  function setup() {
    if (!video || ready || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      ready = true;
    }
  }

  function play() {
    setup();

    if (overlay) {
      overlay.classList.add('hidden');
    }

    var request = video.play();

    if (request && typeof request.catch === 'function') {
      request.catch(function () {
        if (overlay) {
          overlay.classList.remove('hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }
})();
