(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function compact(value, maxLength) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength).replace(/[，。,.\s]+$/, "") + "…";
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", root);
    var dots = selectAll("[data-hero-dot]", root);
    var next = root.querySelector("[data-hero-next]");
    var prev = root.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function renderCard(movie) {
    var terms = (movie.terms || []).slice(0, 3).map(function (term) {
      return "<span>" + escapeHtml(term) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"poster\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p class=\"movie-meta\">" + escapeHtml(movie.year + " · " + movie.region + " · " + movie.type) + "</p>" +
      "<p class=\"movie-desc\">" + escapeHtml(compact(movie.one_line, 74)) + "</p>" +
      "<div class=\"movie-card-tags\">" + terms + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.searchMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var normalized = query.toLowerCase();
    var matched = window.searchMovies.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.one_line].join(" ").toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = "搜索：“" + query + "”";
    }
    if (!matched.length) {
      results.innerHTML = "<p class=\"movie-meta\">没有找到匹配内容。</p>";
      return;
    }
    results.innerHTML = matched.map(renderCard).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearchPage();
  });
}());
