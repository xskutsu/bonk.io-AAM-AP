export class Emitter<T> {
	private _callbacks: Map<number, (data: T) => void>;
	private _callbackID: number;
	constructor() {
		this._callbacks = new Map<number, (data: T) => void>();
		this._callbackID = 0;
	}

	public subscribe(callback: (data: T) => void): number {
		this._callbacks.set(this._callbackID, callback);
		return this._callbackID++;
	}

	public unsubscribe(callbackID: number): void {
		this._callbacks.delete(callbackID);
	}

	public emit(data: T): void {
		for (const callback of this._callbacks.values()) {
			callback(data);
		}
	}
}