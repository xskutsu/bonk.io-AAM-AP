import { GMClearValues } from "./gmutils";
import { initializeConfig } from "./setting";
import { Whimper } from "./whimper";

const Array__proto__push = Array.prototype.push;
Array.prototype.push = function (...items: any[]): number {
	if (items[0] === "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgaGVpZ2h0PSIxMDAuMHB4IiB3aWR0aD0iMzAuMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMS4wLCAwLjAsIDAuMCwgMS4wLCAxNS4wLCA1MC4wKSI+ICAgIDxwYXRoIGQ9Ik0wLjAgLTUwLjAgTDE1LjAgNTAuMCAtMTUuMCA1MC4wIDAuMCAtNTAuMCIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9Im5vbmUiLz4gIDwvZz48L3N2Zz4=") {
		items[0] = "https://media.discordapp.net/attachments/843395236537434192/1414356295179567214/Untitled.png?ex=68bf4572&is=68bdf3f2&hm=d714380095e333f4e71c64a5443d10965d9aa6658ce38ae13ad763fbc0a9fa69&=&format=webp&quality=lossless";
	}
	return Array__proto__push.apply(this, items);
};

function DOMContentLoaded(): Promise<void> {
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
	await DOMContentLoaded();
	Whimper.initialize();
})();