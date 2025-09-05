// ==UserScript==
// @name         Dev Watch Script
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @match        *://bonk.io/gameframe-release.html
// @match        *://bonkisback.io/gameframe-release.html
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
	const scriptElement = document.createElement("script");
	scriptElement.src = "http://localhost:3001/";
	scriptElement.async = false;
	document.documentElement.appendChild(scriptElement);
})();