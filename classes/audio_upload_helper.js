var fs = require('fs');
var tmp = require('tmp');
const { getAudioDurationInSeconds } = require('get-audio-duration');

const config = require('../config');

tmp.setGracefulCleanup();

class AudioUploadHelper {

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
			fs.stat(path, (err, stats)=>{
				if (err) {
					console.log(err);
					return;
				}

				let size = stats.size / 1000 / 1000;

				// Get duration
				getAudioDurationInSeconds(path)
					.then((duration)=>{
						completion(duration * 1000, size);
						cleanupCallback();
					})
					.catch((e)=>{
						console.log(e);
						cleanupCallback();
					})
			});
		});
	}

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

		// Round and return cost
		return  Number((finalCost).toFixed(2));
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
}

module.exports = AudioUploadHelper;