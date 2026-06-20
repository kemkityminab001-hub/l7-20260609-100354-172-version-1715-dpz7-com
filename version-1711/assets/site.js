(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    document.querySelectorAll(".mobile-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    document.querySelectorAll(".filter-panel").forEach(function (panel) {
      var target = panel.getAttribute("data-target") || "body";
      var root = document.querySelector(target) || document.body;
      var input = panel.querySelector("input[type='search']");
      var select = panel.querySelector("select");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = select ? select.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matchedText = !query || haystack.indexOf(query) !== -1;
          var matchedYear = !year || card.getAttribute("data-year") === year;
          card.style.display = matchedText && matchedYear ? "" : "none";
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    });
  }

  window.initMoviePlayer = function (videoId, buttonId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var loaded = false;

    function hideOverlay() {
      if (button) {
        button.classList.add("is-hidden");
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function attachSource() {
      if (!video || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      attachSource();
      hideOverlay();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (button && video) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", hideOverlay);
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
