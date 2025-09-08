class AudioPatch {
	private _enabled: boolean = false;
	constructor() {

	}

	public get enabled(): boolean {
		return this._enabled;
	}

	public set enabled(state: boolean) {
		if (state === this._enabled) {
			return;
		}
		this._enabled = state;
		if (state) {
			this._apply();
		} else {
			this._remove();
		}
	}

	private _apply(): void {

	}

	private _remove(): void {

	}
}