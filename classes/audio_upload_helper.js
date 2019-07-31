var fs = require('fs');
var tmp = require('tmp');
var crypto = require('crypto');
const { getAudioDurationInSeconds } = require('get-audio-duration');

const config = require('../config');
const UploadClient = require('./upload_client');

tmp.setGracefulCleanup();

class AudioUploadHelper {

	/* FILE READING */
	static getFileInfoFromBase64(b64, completion) {
		tmp.file({ mode: 0o644, prefix: 'audio-upload-' }, function _tempFileCreated(err, path, fd, cleanupCallback) {
			if (err) throw err;

			console.log('File: ', path);
			console.log('Filedescriptor: ', fd);

			// Write b64 to file
			let base64Data = b64.replace(/^data:audio\/mp3;base64,/, '');
			fs.writeFile(path, base64Data, 'base64', function(err) {
				console.log(err);
			});

			// Get file size
			let byteSize = (b64.length * (3/4)) - ((b64[b64.length-2] === '=') ? 2 : 1);
			let size = byteSize / 1000 / 1000;

			// Get duration
			getAudioDurationInSeconds(path)
				.then((duration) => {
					completion(duration * 1000, size);
					cleanupCallback();
				})
				.catch((e) => {
					console.log(e);
					cleanupCallback();
				})
		});
	}

	/* REQUEST PROCESSING */
	static processUploadCheckReq(req, completion) {
		req.body.frequencyMultiplier = parseFloat(req.body.frequencyMultiplier);

		if (!req.body.b64 || !req.body.frequencyMultiplier) {
			let response = {
				success: false,
				error: this.missingParamError(req.body)
			};
			completion(response);
			return
		}

		if (typeof(req.body.b64) !== 'string' || isNaN(req.body.frequencyMultiplier)) {
			let response = {
				success: false,
				error: this.paramTypeError(req.body)
			};
			completion(response);
			return
		}

		// Make sure frequency multiplier is one of permitted
		if (!config.permittedFrequencyMultipliers.includes(req.body.frequencyMultiplier)) {
			let response = {
				success: false,
				error: this.frequencyMultiplierError(req.body.frequencyMultiplier)
			};
			completion(response);
			return
		}

		this.getFileInfoFromBase64(req.body.b64,(duration, size) => {
			if (size > config.maxFileSize) {
				response = {
					success: false,
					error: this.fileSizeError(size)
				};
				completion(response);
			}

			let success = duration < config.maxAudioDuration;
			let response = {
				success: success,
			};

			if (success) {
				response.size = size;
				response.duration = duration;
				response.price = this.calculateCost(duration, req.body.frequencyMultiplier, size);
				completion(response);
			} else {
				response.error = this.durationError(duration);
				completion(response);
			}
		});
	}

	static calculateCost(duration, frequencyMultiplier, size) {
		// Avg cost calculated by duration & size
		let maxCost = 1.00;

		let durationCost = (duration / config.maxAudioDuration) * maxCost;
		let fileSizeCost = (size / config.maxFileSize) * maxCost;
		let baseCost = (durationCost + fileSizeCost) / 2;

		// Multiply baseCost by frequencyMultiplier
		let scaledCost = (baseCost * frequencyMultiplier);

		// Subtract a small amount scaled with frequencyMultiplier from scaledCost so that higher frequencies are better deals
		let differenceScale = 0.05;
		let finalCost = scaledCost - (differenceScale * (frequencyMultiplier - 1));

		// Cost must be at least 50 cents for stripe
		let validCost = Math.max(0.50, finalCost);

		// Round and return cost
		return  Number((validCost).toFixed(2));
	}

	static missingParamError(params) {
		let message = 'Missing parameters: ' +
			((!params.b64) ? 'base64 string (audio file)' : '') +
			((!params.frequencyMultiplier) ? 'frequency multiplier' : '');

		return message
	}

	static paramTypeError(params) {
		let message = 'Wrong parameter types: ' +
			((typeof(params.b64) !== 'string') ? `base64 string (audio file) is type ${typeof(params.b64)} (should be String) ` : '') +
			(isNaN(params.frequencyMultiplier) ? `frequency multiplier is NaN (should be Int)` : '');

		return message
	}

	static frequencyMultiplierError(frequencyMultiplier) {
		return `Frequence multiplier ${frequencyMultiplier} is not permitted (Permitted multipliers: ${config.permittedFrequencyMultipliers})`;
	}

	static durationError(duration) {
		return `Duration of ${duration / 1000} seconds is not permitted (Maximum duration: ${config.maxAudioDuration / 1000} seconds)`
	}

	static fileSizeError(fileSize) {
		return `File size ${fileSize} MB is too large (Maximum size: ${config.maxFileSize} MB)`
	}

	/* STRIPE CHECKOUT HANDLING */

	static clients = [];

	static registerClient(b64, frequencyMultiplier, session) {
		// Generate client id
		let ids = this.clients.map(client => client.id);
		let id = crypto.randomBytes(20).toString('hex');
		while (ids.includes(id)) {
			id = crypto.randomBytes(20).toString('hex');
		}

		// Create and push client
		let client = new UploadClient(id, b64, frequencyMultiplier, session);
		this.clients.push(client);

		return client;
	}

	static getClientBySessionId(id) {
		let ids = this.clients.map(client => client.session.id);

		let index = ids.indexOf(id);
		if (index < 0) return null;

		return this.clients[ids.indexOf(id)];
	}

	static getClientById(id) {
		let ids = this.clients.map(client => client.id);

		let index = ids.indexOf(id);
		if (index < 0) return null;

		return this.clients[ids.indexOf(id)];
	}

	/* HANDLE CHECKOUT COMPLETION */

	static onSessionCompleted(session) {
		// Get client object
		let client = this.getClientBySessionId(session.id);

		// Update client object to show reflect completion
		client.onPurchaseCompleted();

		// Server will send a message to the next client to send a req to the server with the client id in their cookies
	}

	// This will be called in an interval in index.js
	static checkCompletedSessions(stripe) {
		let self = this;
		const events = stripe.events.list({
			type: 'checkout.session.completed',
			created: {
				// Check for events created in the last 24 hours.
				gte: Date.now() - 24 * 60 * 60,
			},
		}, function (err, eventList) {
			let events = eventList.data;

			// Return if there are no events
			if (!events) {
				return
			}

			console.log(events);

			for (const event of events) {
				const session = event.data.object;

				// Fulfill the purchase
				self.onSessionCompleted(session);
			}
		})
	}

	// Called by server in index.js when a client receives the message that their purchase was completed
	static destroyClient(id) {
		let client = this.getClientById(id);

		let index = this.clients.indexOf(client);
		if (index < 0) return false;

		this.clients.splice(index, 1);
		return true;
	}
}

module.exports = AudioUploadHelper;