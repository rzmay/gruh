class SFXManager {

	static defaultFadeLoopOptions = {
		cello: {
			maxVolume: 0.05,
			maxDuration: 8,
			minDuration: 3,
			maxRest: 30,
			minRest: 10,
			fadeTime: 3
		},

		bugs: {
			maxVolume: 0.02,
			maxDuration: 9,
			minDuration: 3,
			maxRest: 30,
			minRest: 20,
			fadeTime: 3
		},

		chant: {
			maxVolume: 0.05,
			maxDuration: 10,
			minDuration: 5,
			maxRest: 60,
			minRest: 40,
			fadeTime: 3
		},

		choir: {
			maxVolume: 0.03,
			maxDuration: 8,
			minDuration: 5,
			maxRest: 60,
			minRest: 30,
			fadeTime: 3
		}
	};

	static defaultLoopOptions = {
		breathing: {
			volume: 0.8,
			maxRest: 120,
			minRest: 90,
			fadeTime: 0.5
		}
	};

	static startWhiteNoise() {
		let audioElement = this.addAudio('audio/white_noise.mp3', 'whiteNoise');

		audioElement[0].play();
		audioElement.animate({volume: 0.5}, 3000);
	}

	static startFadeLoop(fileName, options) {
		let audioElement = this.addAudio(`audio/${fileName}.mp3`, `${fileName}Audio`);

		audioElement[0].play();
		this.audioFadeLoop(audioElement, options || this.defaultFadeLoopOptions[fileName]);
	}

	static startLoop(fileName, options) {
		let audioElement = this.addAudio(`audio/${fileName}.mp3`, `${fileName}Audio`);

		this.audioLoop(audioElement, options || this.defaultLoopOptions[fileName]);
	}

	static addAudio(src, id) {
		// Add audio
		let audio = new Audio();
		audio.src = src;
		audio.volume = 0;
		audio.id = id;
		audio.controls = false;
		audio.loop = true;

		$('body').append(audio);
		let audioElement = $(`#${id}`);

		return audioElement;
	}

	static audioFadeLoop(audio, options) {
		let self = this;
		setTimeout(()=>{
			self.audioFadeSegment(audio, options,()=>{
				self.audioFadeLoop(audio, options);
			})
		}, (Math.random() * (options.maxRest - options.minRest) + options.minRest) * 1000);
	}

	static audioFadeSegment(audio, options, completion) {
		audio.animate({volume: options.maxVolume}, options.fadeTime * 1000, 'swing', ()=>{
			let playDuration = (Math.random() * (options.maxDuration - options.minDuration) + options.minDuration) * 1000;
			setTimeout(()=>{
				audio.animate({volume: 0}, options.fadeTime * 1000, 'swing', ()=>{
					completion();
				})
			}, playDuration);
		})
	}

	static audioLoop(audio, options) {
		let self = this;
		setTimeout(()=>{
			self.audioInstance(audio, options, ()=>{
				self.audioLoop(audio, options);
			})
		}, (Math.random() * (options.maxRest - options.minRest) + options.minRest) * 1000);
	}

	static audioInstance(audio, options, callback) {
		audio[0].play();
		audio.animate({volume: options.volume}, options.fadeTime);

		setTimeout(()=>{
			audio.animate({volume: options.volume}, options.fadeTime, 'swing', ()=>{
				audio[0].currentTime = 0;
				audio[0].pause();
				callback();
			});
		}, audio[0].duration - options.fadeTime);
	}

}
