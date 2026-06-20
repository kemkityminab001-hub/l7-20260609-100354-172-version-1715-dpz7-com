(function () {
    var hlsPromise = null;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadRemoteHls() {
        return new Promise(function (resolve) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }
            var existing = document.querySelector("script[data-hls-library]");
            if (existing) {
                existing.addEventListener("load", function () {
                    resolve(window.Hls || null);
                });
                existing.addEventListener("error", function () {
                    resolve(null);
                });
                return;
            }
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
            script.async = true;
            script.setAttribute("data-hls-library", "true");
            script.onload = function () {
                resolve(window.Hls || null);
            };
            script.onerror = function () {
                resolve(null);
            };
            document.head.appendChild(script);
        });
    }

    function getHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (!hlsPromise) {
            hlsPromise = import("./hls-vendor.js")
                .then(function (module) {
                    return module.H || null;
                })
                .catch(function () {
                    return null;
                })
                .then(function (Hls) {
                    if (Hls) {
                        return Hls;
                    }
                    return loadRemoteHls();
                });
        }
        return hlsPromise;
    }

    function setupPlayer(player) {
        var video = player.querySelector("video");
        var layer = player.querySelector("[data-play]");
        if (!video || !layer) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        var loaded = false;
        var hlsInstance = null;

        function attach() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return Promise.resolve();
            }
            return getHls().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                }
            });
        }

        function play() {
            attach().then(function () {
                layer.classList.add("is-hidden");
                video.controls = true;
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            });
        }

        layer.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            layer.classList.add("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(setupPlayer);
    });
})();
