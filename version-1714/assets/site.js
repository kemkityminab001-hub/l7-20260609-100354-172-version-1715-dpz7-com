(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var nextIndex = parseInt(dot.getAttribute("data-hero-dot"), 10);
                show(nextIndex);
                start();
            });
        });

        var hero = document.querySelector(".hero");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }

        show(0);
        start();
    }

    function textOf(card) {
        return (card.getAttribute("data-title") || "").toLowerCase();
    }

    function activeFilters(scope) {
        var filters = {};
        var buttons = scope.querySelectorAll("[data-filter-field].is-active");
        buttons.forEach(function (button) {
            var field = button.getAttribute("data-filter-field");
            var value = button.getAttribute("data-filter-value");
            if (value) {
                filters[field] = value;
            }
        });
        return filters;
    }

    function applyFilter(scope) {
        var input = scope.querySelector("[data-search-input]");
        var query = input ? input.value.trim().toLowerCase() : "";
        var filters = activeFilters(scope);
        var cards = scope.querySelectorAll("[data-card]");
        cards.forEach(function (card) {
            var matchQuery = !query || textOf(card).indexOf(query) !== -1;
            var matchFilter = true;
            Object.keys(filters).forEach(function (field) {
                var cardValue = card.getAttribute("data-" + field) || "";
                if (cardValue !== filters[field]) {
                    matchFilter = false;
                }
            });
            card.classList.toggle("is-hidden", !(matchQuery && matchFilter));
        });
    }

    function setupFilters() {
        var scopes = document.querySelectorAll("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var clear = scope.querySelector("[data-search-clear]");
            if (input) {
                input.addEventListener("input", function () {
                    applyFilter(scope);
                });
            }
            if (clear && input) {
                clear.addEventListener("click", function () {
                    input.value = "";
                    applyFilter(scope);
                    input.focus();
                });
            }
            var buttons = scope.querySelectorAll("[data-filter-field]");
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var field = button.getAttribute("data-filter-field");
                    var groupButtons = scope.querySelectorAll('[data-filter-field="' + field + '"]');
                    groupButtons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    applyFilter(scope);
                });
            });
            applyFilter(scope);
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
