declare class Howl {
	public _volume: number;
	public _src: string | string[];
	public constructor(options?: { src: string | string[], volume: number });
	public play(sprite?: string, callback?: () => void): number;
	public volume(volume: number, id?: number): void;
}

interface Rv20SoundStrings {
	discDeath0: string,
	discDeath1: string,
	discDeath2: string,
	discDisc: string,
	discOffScreen: string,
	platBounce: string,
	capIncrease: string,
	capDecrease: string,
	capComplete: string,
	footKick: string,
	footBounce: string,
	footGoal: string,
	scoreAnimation: string,
	classicButtonClick: string,
	classicButtonHover: string,
	classicButtonBack: string,
	listRowHover: string,
	listRowClick: string,
	popNote: string,
	digiBeep: string
}

declare class GameResources {
	static svgStrings: [null, ...string[]];
	static soundStrings: Rv20SoundStrings;
	static bowSVG: string;
}