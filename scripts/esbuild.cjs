const esbuild = require("esbuild");
const args = process.argv.slice(2);
const isWatch = args.includes("--watch");

const banner = `
// ==UserScript==
// @name         AAM+AP (Advanced Audio Manager + Audio Patches)
// @namespace    http://tampermonkey.net/
// @version      2025-09-05
// @description  gng
// @author       https://github.com/xskutsu
// @match        *://bonk.io/gameframe-release.html
// @match        *://bonkisback.io/gameframe-release.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bonk.io
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==`.trim();

const options = {
	entryPoints: ["./source/index.ts"],
	bundle: true,
	sourcemap: true,
	logLevel: "info",
	minify: false,
	format: "iife",
	outfile: "dist/aam-ap.user.js",
	platform: "browser",
	banner: {
		js: banner + "\n"
	}
};

(async function () {
	const ctx = await esbuild.context(options);
	if (isWatch) {
		await ctx.watch();
		console.log(`Watching to outfile: ${options.outfile}`);
	} else {
		await ctx.rebuild();
		await ctx.dispose();
		console.log(`Built outfile: ${options.outfile}`);
	}
})();