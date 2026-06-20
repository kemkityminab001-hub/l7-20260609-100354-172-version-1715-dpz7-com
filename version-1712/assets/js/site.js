(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setHeaderMenu() {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector("[data-mobile-toggle]");
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            header.classList.toggle("is-open");
        });
    }

    function setHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
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
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var filterBar = document.querySelector("[data-filter-bar]");
        var activeFilter = "all";

        function currentQuery() {
            return inputs.map(function (input) {
                return input.value.trim().toLowerCase();
            }).filter(Boolean).join(" ");
        }

        function apply() {
            var query = currentQuery();
            var items = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .ranking-row, .latest-row, .mini-card, .category-overview-card"));
            var visibleCount = 0;
            items.forEach(function (item) {
                var searchText = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
                var tags = item.getAttribute("data-tags") || "";
                var matchQuery = !query || searchText.indexOf(query) !== -1;
                var matchFilter = activeFilter === "all" || tags.indexOf(activeFilter) !== -1 || searchText.indexOf(activeFilter.toLowerCase()) !== -1;
                var visible = matchQuery && matchFilter;
                item.classList.toggle("is-hidden-by-filter", !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });
            var empty = document.querySelector("[data-empty-state]");
            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", apply);
        });

        if (filterBar) {
            filterBar.addEventListener("click", function (event) {
                var button = event.target.closest("[data-filter]");
                if (!button) {
                    return;
                }
                activeFilter = button.getAttribute("data-filter") || "all";
                Array.prototype.slice.call(filterBar.querySelectorAll("[data-filter]")).forEach(function (chip) {
                    chip.classList.toggle("is-active", chip === button);
                });
                apply();
            });
        }
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("movie-video");
        var overlay = document.querySelector(".player-overlay");
        if (!video || !sourceUrl) {
            return;
        }
        var hlsInstance = null;
        var loaded = false;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            load();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setHeaderMenu();
        setHero();
        setFilters();
    });
})();
