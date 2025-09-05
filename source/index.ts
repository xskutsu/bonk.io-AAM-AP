import { Setting } from "./config/Setting";

export const config = {
	audioPatches: {
		modeSelector: new Setting<boolean>("audiopatches.mode_selector", true),
		replayButton: new Setting<boolean>("audiopatches.replay_button", true),
		unlistedRoom: new Setting<boolean>("audiopatches.unlisted_room", true),
		accountMenu: new Setting<boolean>("audiopatches.account_menu", true),
		settingsMenu: new Setting<boolean>("audiopatches.settings_menu", true),
		fullscreenByExcigma: new Setting<boolean>("audiopatches.fullscreen_by_excigma", true),
		accountSwitcherByKitaesq: new Setting<boolean>("audiopatches.account_switcher_by_kitaesq", true),
		bonkCommandsByLegendBoss123: new Setting<boolean>("audiopatches.bonk_commands_by_legendboss123", true),
	},
	volumes: {
		global: new Setting<number>("volumes.global", 80),
	},
	other: {
		invertXskt: new Setting<boolean>("other.invert_xskt", true)
	}
} as const satisfies Record<string, Record<string, Setting<any>>>;

for (const catagory of Object.values(config)) {
	for (const setting of Object.values(catagory)) {
		await setting.initialize();
	}
}