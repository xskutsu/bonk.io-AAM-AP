import { Emitter } from "../core/Emitter";

export class Setting<T extends GM.Value> {
	public gmKey: string;
	public defaultValue: T;
	public onChange: Emitter<T>;
	private _value: T;
	constructor(gmKey: string, defaultValue: T) {
		this.gmKey = gmKey;
		this.defaultValue = defaultValue;
		this.onChange = new Emitter<T>();
		this._value = defaultValue;
	}

	public get value(): T {
		return this._value;
	}

	public set value(value: T) {
		if (this._value === value) {
			return;
		}

		this._value = value;
		this.onChange.emit(value);
		GM.setValue(this.gmKey, value);
	}

	public reset(): void {
		this.value = this.defaultValue;
	}

	public async initialize() {
		const value: GM.Value | undefined = await GM.getValue(this.gmKey);
		this.value = value === undefined || !this._isExpectedType(value) ? this.defaultValue : value;
	}

	private _isExpectedType(value: unknown): value is T {
		return typeof value === typeof this.defaultValue;
	}
}