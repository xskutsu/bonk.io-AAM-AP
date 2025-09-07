import { GMClearValues } from "./gmutils";
import { initializeConfig } from "./setting";
import { Whimper } from "./whimper";

function afterDOMContentLoaded(): Promise<void> {
	return new Promise(function (resolve) {
		if (document.readyState === "loading") {
			window.addEventListener("DOMContentLoaded", function () {
				resolve();
			}, { once: true });
		} else {
			resolve();
		}
	})
}

(async function () {
	await GMClearValues();
	await initializeConfig();
	await afterDOMContentLoaded();
	Whimper.initialize();
})();