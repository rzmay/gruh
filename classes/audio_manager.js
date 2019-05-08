const path = require('path');
const atob = require('atob');
var fs = require('fs');

const { getAudioDurationInSeconds } = require('get-audio-duration');

var AudioManager = class {

	connstructor() {
		this.playStart = null;
		this.filepath = null;
		this.fileLength = 0;
	}

	getTime() {
		if (this.playStart) {
			return new Date().getTime() - this.playStart.getTime();
		} else {
			return 0;
		}
	}

	setFile(filepath) {
		this.filepath = filepath;
	}

	on(e, callback) {
		this['on' + e] = callback;
	}

	base64_encode(file) {
		// read binary data
		return fs.readFileSync(__dirname + file, { encoding: 'base64' })
	}

	startPlaying(file, io) {
		this.filepath = file;

		// Send sound from start to any clients already connected
		this.sendSound(io);

		// Set start time
		this.playStart = new Date();

		var self = this;

		var checkAudioOver = setInterval(()=>{
			if (self.getTime() > self.fileLength) {
				clearInterval(checkAudioOver);
				self.playStart = null;
				self.filepath = null;
				self.fileLength = 0;
				self.onend();
			}
		}, 100);

		getAudioDurationInSeconds(__dirname + file)
			.then((duration) => {
				self.fileLength = duration * 1000;
			})
			.catch((error) => {
				console.log(error);
			});
	}

	sendSound(io) {
		// Make sure file exists
		if (!this.filepath) return;

		// Read file
		let sound = this.base64_encode(this.filepath);

		// Send to clients
		io.emit('playSound', sound, this.getTime());
	}

	sendSoundSocket(socket) {
		// Make sure file exists
		if (!this.filepath) return;

		// Read file
		let sound = this.base64_encode(this.filepath);

		// Send to client
		socket.emit('playSound', sound, this.getTime());
	}
};

module.exports = AudioManager;