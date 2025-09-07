type Callback<T> = (data: T) => void;

export class Emitter<T> {
	public callbacks: Set<Callback<T>>;
	constructor() {
		this.callbacks = new Set<Callback<T>>();
	}

	public subscribe(callback: Callback<T>): void {
		this.callbacks.add(callback);
	}

	public unsubscribe(callback: Callback<T>): boolean {
		return this.callbacks.delete(callback);
	}

	public emit(data: T): void {
		for (const callback of this.callbacks.values()) {
			callback(data);
		}
	}
}