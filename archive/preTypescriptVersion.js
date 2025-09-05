// ==UserScript==
// @name         AAM+AP (Advanced Audio Manager + Audio Patches)
// @namespace    http://tampermonkey.net/
// @version      2025-09-02
// @description  gng
// @author       https://github.com/xskutsu
// @match        *://bonk.io/*
// @match        *://bonkisback.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bonk.io
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

// the roots of everything :3
void !(async function () {
	"use strict";

	// make sure we are running in the bonk.io game iframe
	if (unsafeWindow.parent === unsafeWindow) {
		return;
	}

	// list of sounds
	/*[
		"discDeath0",
		"discDeath1",
		"discDeath2",
		"discDisc",
		"discOffScreen",
		"platBounce",
		"capIncrease",
		"capDecrease",
		"capComplete",
		"footKick",
		"footBounce",
		"footGoal",
		"scoreAnimation",
		"classicButtonClick",
		"classicButtonHover",
		"classicButtonBack",
		"listRowHover",
		"listRowClick",
		"popNote",
		"digiBeep"
	]*/
	// generic event class
	class Emitter {
		constructor() {
			this.callbacks = new Map();
			this.callbackID = 0;
		}

		subscribe(callback) {
			this.callbacks.set(this.callbackID, callback);
			return this.callbackID++;
		}

		unsubscribe(callbackID) {
			this.callbacks.delete(callbackID);
		}

		emit(data) {
			let result;
			for (const callback of this.callbacks.values()) {
				result = callback(data);
			}
			return result;
		}
	}

	// main configuration object
	class Config {
		static gmKey = "config.";
		static options = {
			audioPatches: true,

			modeSelectorFix: true,
			replayButtonFix: true,
			unlistedRoomFix: true,
			guestMenuFixes: true,
			accountMenuFixes: true,
			settingsMenuFixes: true,

			fullscreenByExcigmaPatch: true,
			accountSwitcherByKitaesqPatch: true,
			bonkCommandsByLegendBoss123: true,

			invertXskt: true
		};

		static setOption(key, value) {
			this.options[key] = value;
			GM_setValue(this.gmKey + key, value);
			console.log(value);
		}

		static initialize() {
			for (const key in this.options) {
				this.options[key] = GM_getValue(this.gmKey + key, this.options[key]);
			}
		}
	}

	Config.initialize();

	// dynamic config for bonk sounds
	class VolumeConfig {
		static gmKey = "config.volume.";
		static defaultValue = 80;

		static global = GM_getValue(this.gmKey + "global", this.defaultValue);
		static globalSetEvent = new Emitter();
		static setGlobal(value) {
			this.global = value;
			GM_setValue(this.gmKey + "global", value);
			this.globalSetEvent(value);
		}

		static soundStrings = new Map(Object.keys(GameResources.soundStrings).map(key => [key, GM_getValue(this.gmKey + key, this.defaultValue)]));
		static soundStringsSetEvent = new Emitter();
		static setSoundString(soundString, value) {
			this.soundStrings.set(soundString, value);
			this.soundStringsSetEvent(soundString, value);
			GM_setValue(this.gmKey + soundString, value);
		}
		static getSoundString(soundString) {
			return this.soundStrings.get(soundString);
		}
	}

	// hijack Howler.js' internal methods
	// every howler can be shunned to a whimper
	class Whimper {
		static nativePlay = Howl.prototype.play;
		static dataURLToSoundStringMap = new Map(Object.entries(GameResources.soundStrings).map(([key, value]) => [value, key]));

		static play(howl, ...args) {
			const soundId = this.nativePlay.call(howl, ...args);

			let volume = howl._volume;
			const soundString = Whimper.dataURLToSoundStringMap.get(howl._src);
			if (soundString !== undefined) {
				volume *= VolumeConfig.getSoundString(soundString) / 100;
			}
			howl.volume(volume * (VolumeConfig.global / 100), soundId);

			return soundId;
		}

		static initialize() {
			Howl.prototype.play = function (...args) {
				return Whimper.play(this, ...args);
			};
		}
	}

	Whimper.initialize();

	// hijack the audio buttons and replace them with our own
	const AAMAPButton = await new Promise(function (resolve) {
		const intervalID = setInterval(function () {
			const volumeButton = document.getElementById("pretty_top_volume");
			if (!volumeButton) {
				return;
			}

			const musicButton = document.getElementById("pretty_top_volume_music");
			if (!musicButton) {
				return;
			}

			// now let's make things happen... in a moment
			// we wait because the listeners seem to be added at a delay
			clearInterval(intervalID);
			setTimeout(function () {
				// if sounds are off, turn them on
				if (volumeButton.classList.contains("pretty_top_volume_off")) {
					volumeButton.click();
				}

				// if music is on, turn them off
				// sorry studio le bus...
				if (!musicButton.classList.contains("pretty_top_volume_music_off")) {
					musicButton.click();
				}

				// make our cooler button (it's practically the same)
				const button = document.createElement("div");
				button.classList.add("pretty_top_button", "niceborderleft");
				button.style.cssText = `
					width: 58px;
					height: 34px;
					background-image: url(../graphics/volumeon.png);
					background-repeat: no-repeat;
					background-position: center;
					position: absolute;
					right: 116px;
					top: 0;
					border-bottom: 2px solid transparent;`;

				// actually replace the original button
				const parentNode = volumeButton.parentNode;
				const nextSibling = volumeButton.nextSibling;
				if (nextSibling === null) {
					parentNode.appendChild(button);
				} else {
					parentNode.insertBefore(button, nextSibling);
				}

				volumeButton.remove();

				// we're done
				resolve(button);
			}, 500);
		}, 100);
	});

	// howl sounds for menu
	const howls = {
		buttonHover: new Howl({
			src: [GameResources.soundStrings.classicButtonHover],
			volume: 0.55
		}),
		buttonClick: new Howl({
			src: [GameResources.soundStrings.classicButtonClick],
			volume: 0.65
		}),
		buttonBack: new Howl({
			src: [GameResources.soundStrings.classicButtonBack],
			volume: 0.65
		}),
		capIncrease: new Howl({
			src: [GameResources.soundStrings.capIncrease],
			volume: 0.65
		}),
		capDecrease: new Howl({
			src: [GameResources.soundStrings.capDecrease],
			volume: 0.65
		}),
	};

	// simple utility function for adding sounds
	function addSoundsTo(element, doClick = true, doHover = true, isBack = false) {
		const container = element.closest("label.control-checkbox") ?? element;
		if (doClick) {
			const input = container.querySelector('input[type="checkbox"], input[type="radio"]');
			if (input) {
				input.addEventListener("click", event => event.stopPropagation());
			}
			container.addEventListener("click", function () {
				if (isBack) {
					howls.buttonBack.play();
				} else {
					howls.buttonClick.play();
				}
			});
		}
		if (doHover) {
			container.addEventListener("mouseenter", function (event) {
				if (!container.contains(event.relatedTarget)) {
					howls.buttonHover.play();
				}
			});
		}
	}

	// slider css
	GM_addStyle(`
		:root{
		--aam-thumb-size: 18px;          /* diameter of the knob */
		--aam-track-height: 6px;         /* visible track height */
		--aam-gap: 12px;                 /* gap */
		--aam-track-bg: #bababaff;       /* neutral track color (unfilled) */
		--aam-track-bg-alt: #939393;   /* alternate/moz track color */
		--aam-thumb-bg: #f3f3f3;
		--aam-thumb-border: rgba(0,0,0,0.12);
		--aam-value-min-width: 38px;
		--aam-label-max-width: 30%;
		--aam-font: "futurept_b1";
		}

		.aam-slider {
			display: flex;
			align-items: center;
			gap: var(--aam-gap);
			width: 100%;
			user-select: none;
			pointer-events: auto;
		}
		.aam-slider-label {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			flex: 0 0 auto;
			max-width: var(--aam-label-max-width);
		}
		.aam-slider-value {
			min-width: var(--aam-value-min-width);
			text-align: right;
			font-family: var(--aam-font);
			font-size: 14px;
			flex: 0 0 auto;
		}

		input.aam-range[type="range"] {
			-webkit-appearance: none;
			appearance: none;
			height: var(--aam-thumb-size);
			background: transparent;
			margin: 0;
			padding: 0;
			box-sizing: content-box;
			flex: 1 1 auto;
			outline: none;
		}

		input.aam-range[type="range"]::-webkit-slider-runnable-track {
			height: var(--aam-track-height);
			border-radius: calc(var(--aam-track-height) / 2);
			background: var(--aam-track-bg);
		}

		input.aam-range[type="range"]::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: var(--aam-thumb-size);
			height: var(--aam-thumb-size);
			border-radius: 50%;
			background: var(--aam-thumb-bg);
			border: 1px solid var(--aam-thumb-border);
			cursor: pointer;
			margin: 0;
			transform: translateY(calc((var(--aam-track-height) - var(--aam-thumb-size)) / 2));
		}

		input.aam-range[type="range"]:focus {
			outline: none;
		}

		input.aam-range[type="range"]::-moz-range-track {
			height: var(--aam-track-height);
			border-radius: calc(var(--aam-track-height) / 2);
			background: var(--aam-track-bg-alt);
		}

		input.aam-range[type="range"]::-moz-range-thumb {
			width: var(--aam-thumb-size);
			height: var(--aam-thumb-size);
			border-radius: 50%;
			background: var(--aam-thumb-bg);
			border: 1px solid var(--aam-thumb-border);
			cursor: pointer;
			transform: translateY(calc((var(--aam-track-height) - var(--aam-thumb-size)) / 2));
		}

		input.aam-range[type="range"]::-moz-focus-outer {
			border: 0;
		}
	`);

	// methods for making bonk-styled elements
	class MenuFactory {
		// menu popup container
		static makeContainer() {
			const element = document.createElement("div");
			element.classList.add("audio-menu-container", "windowShadow");
			element.style.cssText = `
				min-width: 200px;
				min-height: 70px;
				background-color: #cfd8dc;
				padding: 34px;
				padding-bottom: 12px;
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				margin: auto;
				border-radius: 7px;
				pointer-events: auto;
				outline: 3000px solid rgba(0,0,0,0.30);
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				transition: opacity 0.2s ease;
				opacity: 0;
				visibility: hidden;`;
			return element;
		}

		// popup header
		static makeTopBar(text) {
			const element = document.createElement("div");
			element.classList.add("windowTopBar", "windowTopBar_classic");
			element.textContent = text;
			return element;
		}

		// top-right close button
		static makeCloseButton() {
			const element = document.createElement("div");
			element.classList.add("windowCloseButton", "brownButton", "brownButton_classic", "buttonShadow");
			addSoundsTo(element, true, true, true);
			return element;
		}

		// section header text
		static makeSectionHeading(text) {
			const element = document.createElement("span");
			element.classList.add("settingsHeading");
			element.style.cssText = `
				text-align: center;
				font-size: 20px;
				margin: 5px;`;
			element.textContent = text;
			return element;
		}

		// normal text section, can be link
		static makeSectionText(text, link = "") {
			const element = document.createElement("span");
			element.classList.add("settingsHeading");
			element.style.cssText = `
				text-align: center;
				font-size: 16px;`;
			element.textContent = text;
			if (link.length > 0) {
				element.style.cssText += `
					text-decoration: underline;
					cursor: pointer;
					color: #0011ffff;`;
				element.addEventListener("click", () => open(link));
			}
			return element;
		}

		// styled checkbox
		static makeCheckbox(labelText, defaultValue, tooltip = null) {
			const container = document.createElement("div");
			container.style.cssText = `
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				user-select: none;`;
			container.title = tooltip;

			const labelElement = container.appendChild(document.createElement("label"));
			labelElement.classList.add("control", "control-checkbox");
			labelElement.style.cssText = `
				display: flex;
				align-items: center;
				justify-content: center;
				width: 100%;
				margin: 0px;`;

			const input = labelElement.appendChild(document.createElement("input"));
			input.type = "checkbox";
			input.checked = defaultValue;
			input.addEventListener("click", e => e.stopPropagation());

			const indicatorElement = labelElement.appendChild(document.createElement("span"));
			indicatorElement.classList.add("control_indicator");

			const textElement = labelElement.appendChild(this.makeSectionText(labelText));
			textElement.style.cssText = `
				margin-left: 22px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;`;

			addSoundsTo(container, true, true);

			return {
				container: container,
				input: input
			};
		}

		// basic buttons
		static makeButton(text, width = "90px", height = "30px", isBack = false) {
			const element = document.createElement("div");
			element.classList.add("brownButton", "brownButton_classic", "buttonShadow");
			element.style.cssText = `
				min-width: ${width};
				min-height: ${height};
				line-height: 30px;`;
			element.textContent = text;
			addSoundsTo(element, true, true, isBack);

			return element;
		}

		static makeSlider(labelText, width, defaultValue, min, max, step) {
			const container = document.createElement("div");
			container.classList.add("aam-slider");
			container.style.cssText = `
				width: 100%;
				align-items: center;`;

			const label = container.appendChild(this.makeSectionText(labelText));
			label.classList.add("aam-slider-label");
			label.style.minWidth = "0";

			const input = container.appendChild(document.createElement("input"));
			input.type = "range";
			input.classList.add("aam-range");
			input.min = String(min);
			input.max = String(max);
			input.step = String(step);
			input.value = String(defaultValue);
			input.style.cssText = `
				width: ${width};
				flex: 1 1 auto;`;
			addSoundsTo(input, false, true);

			const valueDisplay = container.appendChild(document.createElement("div"));
			valueDisplay.classList.add("aam-slider-value");
			valueDisplay.textContent = input.value;

			let lastValue = defaultValue;
			function updateValue(newValue) {
				input.value = newValue;
				valueDisplay.textContent = newValue;
				lastValue = newValue;
			}

			input.addEventListener("input", function () {
				updateValue(parseInt(input.value));
				if (input.value > lastValue) {
					howls.capIncrease.play();
				} else if (input.value < lastValue) {
					howls.capDecrease.play();
				}
			});

			return {
				container: container,
				input: input,
				setValue: v => updateValue(v)
			};
		}
	}

	// controls menu lifecycle
	// creation, showing, hiding, cleanup
	class MenuManager {
		// menu registry
		static menus = new Map();

		// create a new popup menu
		static register(id, title) {
			const container = document.getElementById("prettymenu").appendChild(MenuFactory.makeContainer());
			container.appendChild(MenuFactory.makeTopBar(title));

			const closeButton = container.appendChild(MenuFactory.makeCloseButton());
			closeButton.addEventListener("click", () => this.close(id));

			const menu = {
				id: id,
				container: container,
				isOpen: false,
				closeEvent: new Emitter(),
				openEvent: new Emitter()
			};

			this.menus.set(id, menu);
			return menu;
		}

		// remove a popup window
		static unregister(id) {
			const menu = this.menus.get(id);
			menu.container.remove();
			this.menus.delete(menu.id);
		}

		// open (show) a menu
		static open(id) {
			const menu = this.menus.get(id);
			if (menu.isOpen) {
				return;
			}

			menu.isOpen = true;
			menu.container.style.visibility = "inherit";
			menu.container.style.opacity = 1;
			document.getElementById("settings_close").click();

			menu.openEvent.emit();
		}

		// close (hide) a menu
		static close(id) {
			const menu = this.menus.get(id);
			if (!menu.isOpen) {
				return;
			}

			menu.isOpen = false;
			menu.container.style.opacity = 0;
			menu.closeEvent.emit();

			setTimeout(function () {
				if (!menu.isOpen) {
					menu.container.style.visibility = "hidden";
				}
			}, 200);
		}

		// toggle a menu between opened and closed regardless of current state
		static toggle(id) {
			const menu = this.menus.get(id);
			if (menu.isOpen) {
				this.close(id);
			} else {
				this.open(id);
			}
		}

		// close all custom popup menus
		static closeAll() {
			for (const id of this.menus.keys()) {
				this.close(id);
			}
		}

		// close all popup menus (except)
		static closeAllExcept(ids) {
			for (const id of this.menus.keys()) {
				if (!ids.include(id)) {
					this.close(id);
				}
			}
		}
	}

	// Make our button do stuff
	addSoundsTo(AAMAPButton);
	updateVolumeIconFor(AAMAPButton, VolumeConfig.global);
	AAMAPButton.addEventListener("click", function () {
		MenuManager.closeAll();
		MenuManager.toggle("router");
	});

	{ // router menu
		const menu = MenuManager.register("router", "AAM+AP Router");
		menu.container.appendChild(MenuFactory.makeSectionText("What would you like to open?"));
		menu.container.appendChild(document.createElement("br"));

		const AAMButton = MenuFactory.makeButton("Advanced Audio Manager", "200px");
		AAMButton.addEventListener("click", function () {
			MenuManager.closeAll();
			MenuManager.open("aam");
		});

		const APButton = MenuFactory.makeButton("Audio Patches", "117px");
		APButton.addEventListener("click", function () {
			MenuManager.closeAll();
			MenuManager.open("ap");
		});

		const buttonContainer = document.createElement("div");
		buttonContainer.style.cssText = `
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: row;
			gap: 15px;`;
		buttonContainer.appendChild(AAMButton);
		buttonContainer.appendChild(APButton);
		menu.container.appendChild(buttonContainer);
	}

	function updateVolumeIconFor(element, value) {
		const isOn = element.style.backgroundImage.includes("volumeon");
		if (value === 0) {
			if (isOn) {
				element.style.backgroundImage = 'url("../graphics/volumeoff.png")';
			}
		} else {
			if (!isOn) {
				element.style.backgroundImage = 'url("../graphics/volumeon.png")';
			}
		}
	}

	{ // audio patches menu
		const menu = MenuManager.register("ap", "Audio Patches");
		menu.container.appendChild(MenuFactory.makeSectionText("Note: You must reload for changes to apply."));
		menu.container.appendChild(MenuFactory.makeSectionText("Tip: Hover over a checkbox for more information."));

		function makeCheckbox(key, label, tooltip) {
			const checkbox = MenuFactory.makeCheckbox(label, Config.options[key], tooltip);
			menu.container.appendChild(checkbox.container);
			checkbox.input.addEventListener("change", () => Config.setOption(key, checkbox.input.checked));
		}

		makeCheckbox("audioPatches", "Enable Audio Patches", "Global switch for all audio patches and fixes.");

		menu.container.appendChild(MenuFactory.makeSectionHeading("Bonk.io Fixes"));

		makeCheckbox("modeSelectorFix", "Mode Selector Fix", "Fixes mode selector submenu not having any sounds.");
		makeCheckbox("replayButtonFix", "Replay Button Fix", "Fixes the top bar replay button not having a hover sound.");
		makeCheckbox("unlistedRoomFix", "Unlisted Room Fix", "Fixes missing sound event for the unlisted room");
		makeCheckbox("guestMenuFixes", "Guest Menu Fixes", "Fixes buttons in the guest menu not having hover sounds.");
		makeCheckbox("accountMenuFixes", "Account Menu Fixes", "Fixes buttons in the account menu not having any sounds.");
		makeCheckbox("settingsMenuFixes", "Settings Menu Fixes", "Adds sounds to the settings menu, possibly in places it shouldn't be.");

		menu.container.appendChild(MenuFactory.makeSectionHeading("Fullscreen by Excigma"));
		makeCheckbox("fullscreenByExcigmaPatch", "Enable Patch", "Adds sounds to the fullscreen button added by this userscript.");

		menu.container.appendChild(MenuFactory.makeSectionHeading("Account Switcher by kitaesq"));
		makeCheckbox("accountSwitcherByKitaesqPatch", "Enable Patch", "Adds sounds to the buttons added by this userscript.");

		menu.container.appendChild(MenuFactory.makeSectionHeading("Bonk Commands by LEGENDBOSS123"));
		makeCheckbox("accountSwitcherByKitaesqPatch", "Enable Patch", "Adds sounds to the Sandbox button added by this userscript.");

		menu.container.appendChild(MenuFactory.makeSectionHeading("Other Options"));
		makeCheckbox("invertXskt", "Invert xskt", "Let me have some fun! Bonk commands does the same thing, you know.");

		menu.container.appendChild(document.createElement("br"));

		const backButton = MenuFactory.makeButton("Back", undefined, undefined, true);
		backButton.addEventListener("click", function () {
			MenuManager.closeAll();
			MenuManager.open("router");
		});

		const reloadButton = MenuFactory.makeButton("Reload");
		reloadButton.addEventListener("click", function () {
			if (reloadButton.textContent === "Sure?") {
				location.reload();
			}
			reloadButton.textContent = "Sure?";
		});

		const buttonContainer = document.createElement("div");
		buttonContainer.style.cssText = `
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: row;
			gap: 15px;`;
		buttonContainer.appendChild(backButton);
		buttonContainer.appendChild(reloadButton);
		menu.container.appendChild(buttonContainer);
	}

	const soundStringToElementMap = new Map();

	// sound effect menu factory
	function soundEffectMenuFor(soundString) {
		const menuKey = "aam-se-" + soundString;
		const menu = MenuManager.register(menuKey, "AAM - Sound Effect " + soundString);
		menu.closeEvent.subscribe(() => MenuManager.unregister(menuKey));

		menu.container.appendChild(MenuFactory.makeSectionText("Note: Volume may be quieter in-game."));
		menu.container.appendChild(document.createElement("br"));

		/*const volumeSlider = MenuFactory.makeSlider("Volume", "40px", configVolumes[soundString], 0, 100, 5);
		menu.container.appendChild(volumeSlider.container);
		volumeSlider.input.addEventListener("input", function () {
			const value = parseInt(volumeSlider.input.value);
			configVolumes[soundString] = value;
			GM.setValue(configVolumesGMKey + soundString, value);

			const iconElement = soundStringToElementMap.get(soundString);
			if (iconElement) {
				updateVolumeIconFor(iconElement, value);
			}
		})*/

		menu.container.appendChild(document.createElement("br"));

		const replaceStatus = menu.container.appendChild(MenuFactory.makeSectionText("Waiting for replacement..."));

		menu.container.appendChild(document.createElement("br"));

		const buttonContainer = menu.container.appendChild(document.createElement("div"));
		buttonContainer.style.cssText = `
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: row;
			gap: 15px;`;

		const backButton = buttonContainer.appendChild(MenuFactory.makeButton("Back", undefined, undefined, true));
		backButton.addEventListener("click", function () {
			MenuManager.closeAll();
			MenuManager.open("aam");
		});

		const playButton = buttonContainer.appendChild(MenuFactory.makeButton("Play"));
		playButton.addEventListener("click", function () {
			const howl = new Howl({ src: [GameResources.soundStrings[soundString]], volume: 1 });
			howl.play();
		});

		const replaceButton = buttonContainer.appendChild(MenuFactory.makeButton("Replace"));
		replaceButton.addEventListener("click", function () {

		});

		const resetButton = buttonContainer.appendChild(MenuFactory.makeButton("Reset"));
		resetButton.addEventListener("click", function () {
			if (resetButton.textContent === "Sure?") {
				resetButton.textContent = "Reset";
				return;
			}
			resetButton.textContent = "Sure?";
		});

		return menu;
	}

	{ // advanced audio manager menu
		const menu = MenuManager.register("aam", "Advanced Audio Manager");

		menu.container.appendChild(MenuFactory.makeSectionHeading("General Options"));

		/*const globalVolumeSlider = MenuFactory.makeSlider("Global Volume", "40px", config.globalVolume, 0, 100, 5);
		menu.container.appendChild(globalVolumeSlider.container);
		globalVolumeSlider.input.addEventListener("input", function () {
			const value = parseInt(globalVolumeSlider.input.value);
			config.globalVolume = value;
			GM.setValue(configGMKey + "globalVolume", value);
			updateVolumeIconFor(AAMAPButton, value);
		})*/

		const soundsHeading = menu.container.appendChild(MenuFactory.makeSectionHeading("Sound Effects"));
		soundsHeading.style.marginBottom = "0px";

		const soundsTip = menu.container.appendChild(MenuFactory.makeSectionText("Tip: Need some piece and quiet? Consider making a private room while editing the sounds."));
		soundsTip.style.marginBottom = "15px";

		const soundsGrid = menu.container.appendChild(document.createElement("div"));
		soundsGrid.style.cssText = `
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			width: 100%;
			box-shadow: 1px 1px 5px -2px rgba(0, 0, 0, 0.63);
			gap: 1px;
			background: #c5c5c5;
			margin-bottom: 24px;`;

		GM_addStyle(`
			.aam-button-hover:hover {
				background: #3a3a3aAA;
			}
		`);

		for (const soundString in GameResources.soundStrings) {
			const container = soundsGrid.appendChild(document.createElement("div"));
			container.style.cssText = `
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				width: 100%;
				background: #f3f3f3;`;

			const label = container.appendChild(MenuFactory.makeSectionHeading(soundString));
			label.style.cssText = `
				text-align: "left";
				margin-left: 10px;
				margin-right: auto;`;

			const editButton = container.appendChild(document.createElement("div"));
			editButton.style.cssText = `
				width: 20px;
				height: 20px;
				margin: 10px;
				background-image: url(../graphics/cog.png);
				background-repeat: no-repeat;
				background-position: center;
				filter: invert(100%);
				cursor: pointer;
				background-size: contain;`;
			editButton.classList.add("aam-button-hover");
			editButton.title = "Edit Sound";
			editButton.addEventListener("click", function () {
				const soundEffectMenu = soundEffectMenuFor(soundString);
				MenuManager.closeAll();
				MenuManager.open(soundEffectMenu.id);
			})
			addSoundsTo(editButton);

			const testButton = container.appendChild(document.createElement("div"));
			testButton.classList.add("aam-button-hover");
			testButton.style.cssText = `
				width: 20px;
				height: 20px;
				margin: 10px;
				margin-left: 0px;
				background-image: url(../graphics/volumeon.png);
				background-repeat: no-repeat;
				background-position: center;
				filter: invert(100%);
				cursor: pointer;
				background-size: contain;`;
			testButton.title = "Play Sound";
			testButton.addEventListener("click", function () {
				const howl = new Howl({ src: [GameResources.soundStrings[soundString]], volume: 1 });
				howl.play();
			});
			soundStringToElementMap.set(soundString, testButton);
			addSoundsTo(testButton, false, true);
			VolumeConfig.soundStringsSetEvent.subscribe(function (ss, value) {
				if (soundString === ss) {
					updateVolumeIconFor(testButton, value);
				}
			})
			updateVolumeIconFor(testButton, VolumeConfig.soundStrings.get(soundString));
		}

		const buttonContainer = menu.container.appendChild(document.createElement("div"));
		buttonContainer.style.cssText = `
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: row;
			gap: 15px;`;

		const backButton = buttonContainer.appendChild(MenuFactory.makeButton("Back", undefined, undefined, true));
		backButton.addEventListener("click", function () {
			MenuManager.closeAll();
			MenuManager.open("router");
		});

		const resetVolumes = buttonContainer.appendChild(MenuFactory.makeButton("Reset Volumes", "117px", undefined, false));
		resetVolumes.addEventListener("click", function () {
			if (resetVolumes.textContent === "Sure?") {
				resetVolumes.textContent = "Reset Volumes";
				return;
			}
			resetVolumes.textContent = "Sure?";
		});

		const resetReplacements = buttonContainer.appendChild(MenuFactory.makeButton("Reset Replacements", "153px", undefined, false));
		resetReplacements.addEventListener("click", function () {
			if (resetReplacements.textContent === "Sure?") {
				resetReplacements.textContent = "Reset Replacements";
				return;
			}
			resetReplacements.textContent = "Sure?";
		});
	}

	{ // watermark and credits menu
		const menu = MenuManager.register("credits", "AAM+AP Credits");
		menu.container.appendChild(MenuFactory.makeSectionHeading("Primary Credits"));
		menu.container.appendChild(MenuFactory.makeSectionText("Advanced Audio Manager and Audio Patches"));
		menu.container.appendChild(MenuFactory.makeSectionText("github | xskutsu", "https://github.com/xskutsu"));
		menu.container.appendChild(MenuFactory.makeSectionText("discord | @xskt"));
		menu.container.appendChild(MenuFactory.makeSectionText("bonk.io username | xskt"));
		menu.container.appendChild(document.createElement("br"));
		menu.container.appendChild(MenuFactory.makeSectionHeading("Secondary Credits"));
		menu.container.appendChild(MenuFactory.makeSectionText("Bonk.io iframe hook | Fullscreen - Bonk.io by Excigma", "https://greasyfork.org/en/scripts/436028-fullscreen-bonk-io"));

		// hope this isn't annoying...
		const watermarkElement = document.createElement("div");
		watermarkElement.classList.add("niceborderright");
		watermarkElement.style.cssText = `
			color: #82fbffc2;
			text-decoration: underline;
			cursor: pointer;
			font-family: "futurept_b1";
			line-height: 35px;
			display: inline-block;
			padding-left: 15px;
			padding-right: 15px;`;
		watermarkElement.textContent = "AAM+AP";
		watermarkElement.addEventListener("click", function () {
			MenuManager.closeAll();
			MenuManager.toggle("credits");
		});
		document.getElementById("pretty_top_playercount").after(watermarkElement);
	}

	if (Config.options.invertXskt) {
		const observer = new MutationObserver(mutations => {
			for (const { addedNodes } of mutations) {
				for (const node of addedNodes) {
					if (node.nodeType !== Node.ELEMENT_NODE) {
						continue;
					}
					const entries = node.matches(".newbonklobby_playerentry") ? [node] : node.querySelectorAll(".newbonklobby_playerentry");
					for (const entry of entries) {
						const nameElement = entry.querySelector(".newbonklobby_playerentry_name");
						if (nameElement?.textContent.trim() === "xskt") {
							const levelElement = entry.querySelector('.newbonklobby_playerentry_level');
							const matchResult = levelElement.textContent?.match(/-?\d+/);
							if (matchResult !== null) {
								levelElement.textContent = `Level ${-parseInt(matchResult[0], 10)}`;
							}
						}
					}
				}
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	// When vanilla settings is opened close everything else.
	document.getElementById("pretty_top_settings").addEventListener("click", () => MenuManager.closeAll());

	if (Config.options.audioPatches) {
		// fix missing sounds for mode selector
		if (Config.options.modeSelectorFix) {
			for (const element of document.querySelectorAll(".newbonklobby_settings_button_mode")) {
				addSoundsTo(element);
			}
		}

		if (Config.options.replayButtonFix) {
			addSoundsTo(document.getElementById("pretty_top_replay"), false, true);
		}

		if (Config.options.guestMenuFixes) {
			addSoundsTo(document.getElementById("guestOrAccountContainer_guestButton"), false, true);
			addSoundsTo(document.getElementById("guestOrAccountContainer_accountButton"), false, true);
			addSoundsTo(document.getElementById("guestPlayButton"), false, true);
		}

		if (Config.options.accountMenuFixes) {
			addSoundsTo(document.getElementById("passwordChange_cancelButton"));
			addSoundsTo(document.getElementById("passwordChange_close"));
			addSoundsTo(document.getElementById("passwordChange_saveButton"));
		}

		// add missing sounds for the vanilla settings menu
		if (Config.options.settingsMenuFixes) {
			const graphicsQualitySelector = document.getElementById("settings_graphicsquality");
			graphicsQualitySelector.addEventListener("change", () => howls.buttonClick.play());
			addSoundsTo(graphicsQualitySelector);

			addSoundsTo(document.getElementById("settings_filterprofanity_label"));
			addSoundsTo(document.getElementById("settings_fps_label"));
			addSoundsTo(document.getElementById("settings_change_password_label"));

			let intervalID = setInterval(function () {
				for (const element of document.querySelectorAll(".redefineControls_selectionCell")) {
					addSoundsTo(element);
					if (intervalID !== -1) {
						clearInterval(intervalID);
						intervalID = -1;
					}
				}
			}, 200);
		}

		// audio patch for bonk.io Account Switcher by kitaesq
		if (Config.options.accountSwitcherByKitaesqPatch) {
			const xpr = document.evaluate("//div[contains(@class, 'windowTopBar') and contains(@class, 'windowTopBar_classic') and text()='Account Switcher']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			const topBarElement = xpr.singleNodeValue;
			console.log(topBarElement);
			if (topBarElement !== null) {
				const container = topBarElement.parentElement;
				for (const element of container.children[2].children) {
					addSoundsTo(element);
				}
				for (const element of container.children[3].children) {
					addSoundsTo(element);
				}
			}
		};

		// audio patch for fullscreen - Bonk.io by Excigma
		if (Config.options.fullscreenByExcigmaPatch) {
			const button = document.getElementById("pretty_top_fullscreen");
			if (button !== null) {
				addSoundsTo(button);
			}
		};

		// audio patch for Bonk Commands by LEGENDBOSS123
		if (Config.options.bonkCommandsByLegendBoss123) {
			let intervalID = setInterval(function () {
				const button = document.getElementById("classic_mid_sandbox");
				if (button !== null) {
					addSoundsTo(button);
					clearInterval(intervalID);
				}
			}, 200);
		};
	}
})();