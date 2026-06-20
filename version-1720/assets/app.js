(function () {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let current = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains('is-active');
        }));
        let timer = null;

        const show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };

        const start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        if (slides.length > 1) {
            start();
        }
    }

    const filterPanel = document.querySelector('[data-filter-panel]');
    const grid = document.querySelector('[data-filter-grid]');

    if (filterPanel && grid) {
        const cards = Array.from(grid.querySelectorAll('.movie-card'));
        const keywordInput = filterPanel.querySelector('[data-filter-keyword]');
        const regionSelect = filterPanel.querySelector('[data-filter-region]');
        const typeSelect = filterPanel.querySelector('[data-filter-type]');
        const noResult = document.querySelector('[data-no-result]');

        const regions = Array.from(new Set(cards.map(function (card) {
            return card.getAttribute('data-region') || '';
        }).filter(Boolean))).sort();

        const types = Array.from(new Set(cards.map(function (card) {
            return card.getAttribute('data-type') || '';
        }).filter(Boolean))).sort();

        regions.forEach(function (region) {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });

        types.forEach(function (type) {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        const apply = function () {
            const keyword = (keywordInput.value || '').trim().toLowerCase();
            const region = regionSelect.value;
            const type = typeSelect.value;
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                const matchedKeyword = !keyword || haystack.includes(keyword);
                const matchedRegion = !region || card.getAttribute('data-region') === region;
                const matchedType = !type || card.getAttribute('data-type') === type;
                const matched = matchedKeyword && matchedRegion && matchedType;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (noResult) {
                noResult.classList.toggle('is-visible', visible === 0);
            }
        };

        [keywordInput, regionSelect, typeSelect].forEach(function (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
    }

    const searchRoot = document.querySelector('[data-search-page]');
    const searchInput = document.querySelector('[data-global-search-input]');
    const searchForm = document.querySelector('[data-global-search-form]');

    if (searchRoot && window.SEARCH_MOVIES) {
        const params = new URLSearchParams(window.location.search);
        const initialKeyword = params.get('q') || '';
        if (searchInput) {
            searchInput.value = initialKeyword;
        }

        const makeCard = function (movie) {
            const card = document.createElement('a');
            card.className = 'movie-card';
            card.href = movie.url;

            const posterWrap = document.createElement('span');
            posterWrap.className = 'poster-wrap';

            const image = document.createElement('img');
            image.src = movie.cover;
            image.alt = movie.title;
            image.loading = 'lazy';

            const shade = document.createElement('span');
            shade.className = 'poster-shade';

            const play = document.createElement('span');
            play.className = 'card-play';
            play.setAttribute('aria-hidden', 'true');

            const info = document.createElement('span');
            info.className = 'movie-info';

            const title = document.createElement('strong');
            title.textContent = movie.title;

            const meta = document.createElement('em');
            meta.textContent = movie.year + ' · ' + movie.region + ' · ' + movie.type;

            const tags = document.createElement('span');
            tags.className = 'card-tags';
            (movie.tags || []).slice(0, 3).forEach(function (tag) {
                const tagNode = document.createElement('span');
                tagNode.textContent = tag;
                tags.appendChild(tagNode);
            });

            posterWrap.appendChild(image);
            posterWrap.appendChild(shade);
            posterWrap.appendChild(play);
            info.appendChild(title);
            info.appendChild(meta);
            info.appendChild(tags);
            card.appendChild(posterWrap);
            card.appendChild(info);

            return card;
        };

        const render = function (keyword) {
            const key = (keyword || '').trim().toLowerCase();
            searchRoot.textContent = '';

            const matched = window.SEARCH_MOVIES.filter(function (movie) {
                if (!key) {
                    return true;
                }
                const haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' ').toLowerCase();
                return haystack.includes(key);
            }).slice(0, 96);

            matched.forEach(function (movie) {
                searchRoot.appendChild(makeCard(movie));
            });

            if (!matched.length) {
                const empty = document.createElement('div');
                empty.className = 'no-result is-visible';
                empty.textContent = '没有找到匹配内容';
                searchRoot.appendChild(empty);
            }
        };

        render(initialKeyword);

        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const nextKeyword = searchInput.value || '';
                const nextUrl = new URL(window.location.href);
                if (nextKeyword.trim()) {
                    nextUrl.searchParams.set('q', nextKeyword.trim());
                } else {
                    nextUrl.searchParams.delete('q');
                }
                window.history.replaceState(null, '', nextUrl.toString());
                render(nextKeyword);
            });
        }
    }
})();
