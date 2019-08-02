const path = require('path');
const atob = require('atob');
const request = require('request');
const tmp = require('tmp');
const fs = require('fs');
const chance = require('chance').Chance();

const config = require('../config');

const { getAudioDurationInSeconds } = require('get-audio-duration');

var AudioManager = class {

	/* STATIC */

	// firebase admin
	static admin;

	static setAdmin(admin) {
		this.admin = admin;
	}

	static base64Encode(file) {
		// read binary data
		return fs.readFileSync(config.private.root + file, { encoding: 'base64' })
	}

	/* INSTANCE */

	constructor() {
		this.playStart = null;
		this.filepath = null;
		this.fileLength = 0;

		// Audio can be b64 or url; both can be set as src
		this.audio = null;
		this.audioType = null;
	}

	// Get current time in current song
	getTime() {
		if (this.playStart) {
			return new Date().getTime() - this.playStart.getTime();
		} else {
			return 0;
		}
	}

	/* FILE SYSTEM */

	// Set path of file currently playing
	setAudioFromFile(filepath) {
		this.filepath = filepath;

		// Set b64
		this.audio = AudioManager.base64Encode(this.fileLength);
		this.audioType = 'file';
	}

	// Set callback for events
	on(e, callback) {
		this['on' + e] = callback;
	}

	/* FIREBASE (STATIC) */

	// Default aId in case of failurs
	static defaultAnalyticsId = 'default';

	// Get next aId from queue (if queue is empty, call getIdFromAll
	static getIdFromQueue(completion) {
		let db = AudioManager.admin.firestore();

		// Get queue
		let queueRef = db.collection('audio').doc('queue');
		queueRef.get()
			.then((doc)=>{
				if (!doc.exists) {
					console.log('ERROR: queue doc missing');
					completion(null)
				} else {
					let queue = doc.data().queue;

					// If queue is empty, use getIdFromAll
					// Otherwise, use first item
					if (queue.length < 1) {
						AudioManager.getIdFromAll((id)=>{
							completion(id);
						});
					} else {
						let aId = queue[0];
						queue.splice(0, 1);

						// Remove item from queue and complete
						queueRef.update({
							queue: queue
						});
						completion(aId)
					}
				}
		});
	}

	// Get random aId from list (if queue is empty)
	static getIdFromAll(completion) {
		let db = this.admin.firestore();

		// Get references
		let referencesRef = db.collection('audio').doc('references');
		referencesRef.get()
			.then((doc)=>{
				if (!doc.exists) {
					console.log('ERROR: references doc missing');
					completion(null)
				} else {
					let idList = doc.data().analyticsIdentifiers;

					// Get weights
					let frequenciesRef = db.collection('audio').doc('frequencies');
					frequenciesRef.get()
						.then((doc)=>{
							if (!doc.exists) {
								console.log('ERROR: frequencies doc missing');
								completion(null);
							} else {
								let weightMap = doc.data().frequencies;

								// Get list of weights
								let weightList = idList.map( id => weightMap[id] );

								// Get weighted aId
								let aId = chance.weighted(idList, weightList);

								completion(aId);
							}
						});
				}
			});
	}

	// Update analytics (times played) for aId
	static updateTimesPlayed(aId, step) {
		let db = this.admin.firestore();

		// Get analytics doc
		let analyticsRef = db.collection('audio').doc('references').collection('analytics').doc(aId);
		analyticsRef.update({
			timesPlayed: this.admin.firestore.FieldValue.increment(step)
		})
	}

	// Update analytics (times heard) for aId
	static updateTimesHeard(aId, step) {
		let db = this.admin.firestore();

		// Get analytics doc
		let analyticsRef = db.collection('audio').doc('references').collection('analytics').doc(aId);
		analyticsRef.update({
			timesHeard: this.admin.firestore.FieldValue.increment(step)
		})
	}

	// Get analytics
	static getAnalytics(aId, success, failure) {
		let db = this.admin.firestore();

		// Get analytics doc
		let analyticsRef = db.collection('audio').doc('references').collection('analytics').doc(aId);
		analyticsRef.get()
			.then((doc)=>{
				if (!doc.exists) {
					console.log('ERROR: invalid analytics id');
					failure()
				} else {
					success(doc.data());
				}
			});
	}


	/* FIREBASE (INSTANCE) */

	// Set b64 from firebase storage by getting id
	setAudioFromStorage(completion) {
		// Set audio type
		this.audioType = 'url';

		let self = this;
		AudioManager.getIdFromQueue((id)=> {
			// Get filename
			let name = '';
			if (!id) {
				console.log('ERROR: null id from queue. Using default');
				name = AudioManager.defaultAnalyticsId;
			} else {
				name = id;
			}

			// Get file reference
			let storage = AudioManager.admin.storage().bucket();

			// Expiration date (current time +3 minutes)
			let expirationDate = new Date();
			expirationDate.setMinutes(expirationDate.getMinutes() + 3);

			// Download file to /audio/current_audio.mp3
			const file = storage.file(`audio/${name}.mp3`);
			file.download({
				destination: config.private.root + '/audio/current_audio.mp3'
			})
				.then(() => {
					self.filepath = '/audio/current_audio.mp3';
					self.audioType = 'url';
					completion(name)
				})
				.catch((error) => {
					console.log(error);
					completion();
				})
		})
	}

	/* UNIVERSAL */

	sendSound(io) {
		// Read file
		let sound = this.audio;

		// Send to clients
		io.emit('playSound', (this.audioType === 'b64' ? sound : '/current_audio'), this.audioType === 'b64', this.getTime());
	}

	sendSoundSocket(socket) {
		// Send url to current_audio.mp3
		let sound = this.audio;

		// Send to client
		socket.emit('playSound', (this.audioType === 'b64' ? sound : '/current_audio'), this.audioType === 'b64', this.getTime());
	}

	// Start playing this.base64
	startPlaying(io) {
		// handler for duration
		let self = this;
		function onDuration(duration) {
			// set file length
			self.fileLength = duration * 1000;

			console.log('Current audio time: ' + duration);

			// Set timeout to clear when the audio is done playing
			setTimeout(()=>{
				console.log('Current audio ended');
				self.playStart = null;
				self.filepath = null;
				self.fileLength = 0;
				self.onend();
			}, self.fileLength);

			// Send sound from start to any clients already connected
			self.sendSound(io);

			// Set start time
			self.playStart = new Date();
		}

		/* File to read from will be set either to the correct file, or
			if reading from storage, /audio/current_audio.mp3
		 */

		console.log('playing from file ' + this.filepath);

		// Read time from file
		getAudioDurationInSeconds(config.private.root + this.filepath)
			.then(onDuration)
			.catch((error) => {
				console.log(error);
			});
	}
};

module.exports = AudioManager;