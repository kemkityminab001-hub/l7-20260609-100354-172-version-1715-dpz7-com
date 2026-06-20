(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle('active', position === current);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('active', position === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function resetHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      resetHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      resetHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      resetHero();
    });
  });

  showSlide(0);
  startHero();

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(form) {
    var scopeSelector = form.getAttribute('data-filter-scope') || 'body';
    var scope = document.querySelector(scopeSelector) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var keywordInput = form.querySelector('[name="q"]');
    var yearSelect = form.querySelector('[name="year"]');
    var typeSelect = form.querySelector('[name="type"]');
    var keyword = normalize(keywordInput ? keywordInput.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (type && cardType.indexOf(type) === -1) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    var empty = scope.querySelector('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  filterForms.forEach(function (form) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || params.get('search') || '';
    var keywordInput = form.querySelector('[name="q"]');

    if (keywordInput && q) {
      keywordInput.value = q;
    }

    form.addEventListener('submit', function (event) {
      if (form.hasAttribute('data-local-filter')) {
        event.preventDefault();
        filterCards(form);
      }
    });

    Array.prototype.slice.call(form.elements).forEach(function (element) {
      element.addEventListener('input', function () {
        filterCards(form);
      });
      element.addEventListener('change', function () {
        filterCards(form);
      });
    });

    filterCards(form);
  });

  var videoBoxes = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));

  videoBoxes.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-overlay');
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function loadVideo() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    }

    function playVideo() {
      loadVideo();
      box.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', loadVideo);
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      video.removeAttribute('data-ready');
      box.classList.remove('is-playing');
    });
  });
})();
