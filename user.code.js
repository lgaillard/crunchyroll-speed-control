// ==UserScript==
// @name         Crunchyroll Speed control
// @namespace    https://github.com/lgaillard
// @version      2025-04-18
// @description  Add Speed control to the Crunchyroll player.
// @author       lgaillard
// @license      MIT
// @match        https://static.crunchyroll.com/vilos-v2/web/vilos/player.html
// @icon         https://www.crunchyroll.com/build/assets/img/favicons/favicon-v2-32x32.png
// @icon64       https://www.crunchyroll.com/build/assets/img/favicons/favicon-v2-96x96.png
// @grant        none
// @homepage     https://github.com/lgaillard/crunchyroll-speed-control
// @supportURL   https://github.com/lgaillard/crunchyroll-speed-control/issues
// @downloadURL  https://raw.githubusercontent.com/lgaillard/crunchyroll-speed-control/refs/heads/main/user.code.js
// @updateURL    https://raw.githubusercontent.com/lgaillard/crunchyroll-speed-control/refs/heads/main/user.code.js
// ==/UserScript==

(function () {
    'use strict';

    // TODO: Add a proper speed selection panel

    // For now only support toggling speed
    const PLAYBACK_SPEEDS = [1, 1.5, 2];

    const HOVER_BACKGROUND = "rgb(35, 37, 43)";


    const video = document.querySelector("video");
    if (!video) return;

    const controlsPackage = document.querySelector("#velocity-controls-package");
    if (!controlsPackage) return;


    function onEnterSubMenu(event) {
        event.target.firstElementChild.style.backgroundColor = HOVER_BACKGROUND;
    }

    function onLeaveSubMenu(event) {
        event.target.firstElementChild.style.backgroundColor = "";
    }

    function toggleSpeed() {
        let speedIndex = PLAYBACK_SPEEDS.indexOf(video.playbackRate);
        if (speedIndex > -1) {
            speedIndex += 1;
            if (speedIndex >= PLAYBACK_SPEEDS.length) {
                speedIndex = 0;
            }

            video.playbackRate = PLAYBACK_SPEEDS[speedIndex];
        } else {
            video.playbackRate = 1;
        }
    }

    function onControlsPackageChange() {
        const settingsMenu = controlsPackage.querySelector("#velocity-settings-menu");
        if (!settingsMenu) return;

        const qualitySubMenu = settingsMenu.querySelector("div[data-testid=vilos-settings_quality_submenu]");
        let speedSubMenu = settingsMenu.querySelector("div[data-testid=vilos-settings_speed_submenu]");

        if (qualitySubMenu) {
            if (!speedSubMenu) {
                // Inject Speed submenu
                speedSubMenu = qualitySubMenu.cloneNode(true);
                speedSubMenu.setAttribute("data-testid", "vilos-settings_speed_submenu");
                const keyNode = speedSubMenu.querySelector(":scope > div > div > div > div");
                const valueNode = speedSubMenu.querySelector(":scope > div > div > div:nth-child(2) > div > div > div");
                keyNode.innerText = "Speed";
                valueNode.innerText = video.playbackRate;
                // Remove additional nodes (like HD annotation)
                for (let node of valueNode.parentNode.querySelectorAll(":scope > div:nth-child(n+2)")) {
                    valueNode.parentNode.removeChild(node);
                }

                speedSubMenu.addEventListener("mouseenter", onEnterSubMenu);
                speedSubMenu.addEventListener("mouseleave", onLeaveSubMenu);
                speedSubMenu.addEventListener("pointerenter", onEnterSubMenu);
                speedSubMenu.addEventListener("pointerleave", onLeaveSubMenu);
                speedSubMenu.addEventListener("click", _ => {
                    toggleSpeed();
                    // Refresh value displayed
                    valueNode.innerText = video.playbackRate;
                });

                qualitySubMenu.parentNode.insertBefore(speedSubMenu, qualitySubMenu);
            }
        } else {
            if (speedSubMenu) {
                // We are in a submenu, remove the speed submenu
                speedSubMenu.parentNode.removeChild(speedSubMenu);
            }
        }
    }

    const controlsObserver = new MutationObserver((mutationList, observer) => {
        onControlsPackageChange();
    });

    controlsObserver.observe(controlsPackage, {childList: true, subtree: true});
})();