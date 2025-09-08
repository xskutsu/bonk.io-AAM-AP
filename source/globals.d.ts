declare class Howl {
	public readonly _volume: number;
	public readonly _src: string;
	public constructor(options?: { src: string | string[], volume: number });
	public play(sprite?: string, callback?: () => void): number;
	public volume(volume: number, id?: number): void;
}

interface Rv20SoundStrings {
	readonly discDeath0: string,
	readonly discDeath1: string,
	readonly discDeath2: string,
	readonly discDisc: string,
	readonly discOffScreen: string,
	readonly platBounce: string,
	readonly capIncrease: string,
	readonly capDecrease: string,
	readonly capComplete: string,
	readonly footKick: string,
	readonly footBounce: string,
	readonly footGoal: string,
	readonly scoreAnimation: string,
	readonly classicButtonClick: string,
	readonly classicButtonHover: string,
	readonly classicButtonBack: string,
	readonly listRowHover: string,
	readonly listRowClick: string,
	readonly popNote: string,
	readonly digiBeep: string
}

declare class GameResources {
	static readonly svgStrings: [null, ...string[]];
	static readonly soundStrings: Rv20SoundStrings;
	static readonly bowSVG: string;
}