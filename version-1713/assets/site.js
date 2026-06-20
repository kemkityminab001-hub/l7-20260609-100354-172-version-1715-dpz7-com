function initNavigation() {
    const button = document.querySelector("[data-menu-button]");
    const menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", function () {
        menu.classList.toggle("is-open");
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const next = hero.querySelector("[data-hero-next]");
    const prev = hero.querySelector("[data-hero-prev]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
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
        }
    }

    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
            start();
        });
    }

    if (prev) {
        prev.addEventListener("click", function () {
            show(index - 1);
            start();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            const dotIndex = Number(dot.getAttribute("data-hero-dot"));
            show(dotIndex);
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
}

function initFilters() {
    const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
        const scope = panel.parentElement || document;
        const search = panel.querySelector("[data-filter-search]");
        const year = panel.querySelector("[data-filter-year]");
        const type = panel.querySelector("[data-filter-type]");
        const region = panel.querySelector("[data-filter-region]");
        const empty = panel.querySelector("[data-filter-empty]");
        const cards = Array.from(scope.querySelectorAll(".movie-card"));

        function match(card) {
            const keyword = search ? search.value.trim().toLowerCase() : "";
            const yearValue = year ? year.value : "";
            const typeValue = type ? type.value : "";
            const regionValue = region ? region.value : "";
            const text = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();

            if (keyword && !text.includes(keyword)) {
                return false;
            }

            if (yearValue && card.getAttribute("data-year") !== yearValue) {
                return false;
            }

            if (typeValue && card.getAttribute("data-type") !== typeValue) {
                return false;
            }

            if (regionValue && card.getAttribute("data-region") !== regionValue) {
                return false;
            }

            return true;
        }

        function apply() {
            let visible = 0;

            cards.forEach(function (card) {
                const shouldShow = match(card);
                card.style.display = shouldShow ? "" : "none";

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [search, year, type, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });
}

function initMoviePlayer(videoId, overlayId, sourceUrl) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);
    let ready = false;
    let hlsInstance = null;

    if (!video || !overlay || !sourceUrl) {
        return;
    }

    function attach() {
        if (ready) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        ready = true;
    }

    function play() {
        attach();
        overlay.classList.add("is-hidden");
        video.controls = true;

        const promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    overlay.addEventListener("click", play);

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initFilters();
});
