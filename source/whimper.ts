import { config } from "./setting";

export class Whimper {
	static Howl__proto__play: typeof Howl.prototype.play;

	static play(howl: Howl, sprite?: string, callback?: () => void): number {
		const soundId: number = Whimper.Howl__proto__play.call(howl, sprite, callback);
		let volume: number = howl._volume;
		howl.volume(volume * config.advancedAudioManager.globalVolume.value / 100, soundId);
		return soundId;
	}

	static initialize() {
		this.Howl__proto__play = Howl.prototype.play;
		Howl.prototype.play = function (sprite?: string, callback?: () => void): number {
			return Whimper.play(this, sprite, callback);
		}
	}
}