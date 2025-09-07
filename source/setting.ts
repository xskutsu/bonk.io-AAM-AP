import { Emitter } from "./emitter";

export class Setting<T extends GM.Value> {
	public readonly gmKey: string;
	public readonly defaultValue: T;
	public readonly onchange: Emitter<T>;
	private _value: T;
	private readonly _validator: (value: T) => boolean;
	constructor(gmKey: string, defaultValue: T, validator?: (value: T) => boolean) {
		this.gmKey = gmKey;
		this.defaultValue = defaultValue;
		this.onchange = new Emitter<T>();
		this._value = defaultValue;
		if (validator === undefined) {
			const typeofDefaultValue: string = typeof this.defaultValue;
			this._validator = (v: T) => typeof v === typeofDefaultValue;
		} else {
			this._validator = validator;
		}
		if (!this._validator(defaultValue)) {
			throw new Error(`Default value "${defaultValue}" was considered invalid by ${this.gmKey}'s validator.`);
		}
	}

	public get value(): T {
		return this._value;
	}

	public set value(value: T) {
		if (value === this._value) {
			return;
		}
		if (!this._validator(value)) {
			console.warn(`Invalid value "${value}" provided for ${this.gmKey}, using default instead.`);
			value = this.defaultValue;
		}
		this._value = value;
		this.onchange.emit(value);
		GM.setValue(this.gmKey, value);
	}

	public reset(): void {
		this.value = this.defaultValue;
	}

	public async initialize(): Promise<void> {
		this.value = await GM.getValue(this.gmKey, this.defaultValue);
	}
}

function volumeValidator(value: number): boolean {
	return value >= 0 && value <= 100;
}

export const config = {
	advancedAudioManager: {
		globalVolume: new Setting<number>("aam.global_vume", 0, volumeValidator),
	},
	audioPatches: {
		modeSelector: new Setting<boolean>("ap.mode_selector", true),
		replayButton: new Setting<boolean>("ap.replay_button", true),
		createRoomMenu: new Setting<boolean>("ap.create_room_menu", true),
		guestMenu: new Setting<boolean>("ap.guest_menu", true),
		accountMenu: new Setting<boolean>("ap.account_menu", true),
		settingsMenu: new Setting<boolean>("ap.settings_menu", true),
		fullscreenMod: new Setting<boolean>("ap.fullscreen_mod", true),
		accountSwitcherMod: new Setting<boolean>("ap.account_switcher_mod", true),
		bonkCommandsMod: new Setting<boolean>("ap.bonk_commands_mod", true),
	},
	other: {
		invertXskt: new Setting<boolean>("other.invert_xskt", true),
	}
} as const satisfies Record<string, Record<string, Setting<any>>>;

export async function initializeConfig(): Promise<void> {
	for (const category of Object.values(config)) {
		for (const setting of Object.values(category)) {
			await setting.initialize();
		}
	}
}