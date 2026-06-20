(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  var filterLists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
  var input = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    var query = normalize(input && input.value);
    var year = normalize(yearSelect && yearSelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var visible = 0;

    filterLists.forEach(function (list) {
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !year || cardYear === year;
        var matchType = !type || cardType.indexOf(type) !== -1;
        var matchRegion = !region || cardRegion === region;
        var matched = matchQuery && matchYear && matchType && matchRegion;

        card.classList.toggle('hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  [input, yearSelect, typeSelect, regionSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
})();
