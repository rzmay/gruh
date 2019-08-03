const crypto = require('crypto');
const tmp = require('tmp');
const stream = require('stream');


class UploadClient {

	/* STATIC */
	// firebase admin, set in index.js
	static admin;

	static setAdmin(admin) {
		this.admin = admin;
	}

	/* INSTANCE */

	constructor(id, b64, frequency, session) {
		this.id = id;
		this.b64 = b64;
		this.frequency = frequency;
		this.session = session;

		// Was completed
		this.wasCompleted = false;

		// Analytics identifier
		this.aId = null
	}

	setSession(session) {
		this.session = session;
	}

	/* FIREBASE UPLOAD */

	// Generate unique id stored in database to track analytics for this upload
	generateAnalyticsIdentifier(completion) {
		let db = UploadClient.admin.firestore();

		// Generate aId
		let aId = crypto.randomBytes(10).toString('hex');

		// Make sure that aId does not already exist
		let referencesRef = db.collection('audio').doc('references');
		referencesRef.get()
			.then((doc)=>{
				if (!doc.exists) {
					console.log('ERROR: references doc missing');
					completion(null)
				} else {
					while (doc.data().analyticsIdentifiers.includes(aId)) {
						aId = crypto.randomBytes(10).toString('hex');
					}

					// Write aId to list
					referencesRef.update({
						analyticsIdentifiers: UploadClient.admin.firestore.FieldValue.arrayUnion(aId)
					})
						.then(()=>{
							// Complete
							completion(aId)
						})
						.catch((e)=>{
							console.log(e);
							completion(null)
						});
				}
			})
			.catch((e)=>{
				console.log(e);
				completion(null)
			});
	}

	// Upload all data to database using other upload functions
	upload(onSuccess, onFailure) {
		console.log('uploading!');

		let self = this;
		this.generateAnalyticsIdentifier((aId) => {
			// Failed if no aId
			if (!aId) return onFailure();
			console.log('New upload: ' + aId);

			self.aId = aId;
			self.uploadAudio((ref) => {
				self.uploadReference(onSuccess, onFailure);
			});
		});
	}

	// Upload audio file from b64 and return database ref
	uploadAudio(completion) {

		// Get bucket
		let storage = UploadClient.admin.storage().bucket();

		// Create file in bucket
		const file = storage.file(`audio/${this.aId}.mp3`);

		const writeStream = file.createWriteStream({
			contentType: 'audio/mp3',
		});

		writeStream.on('error', (err) => {
			console.log(err);
			completion(err);
		});

		let self = this;
		writeStream.on('finish', () => {
			// Clear b64 to free memory
			self.b64 = null;

			// Upload is complete
			completion(`audio/${self.aId}`)
		});

		// Write b64 to stream
		let base64Data = this.b64.replace(/^data:audio\/mp3;base64,/, '');
		var bufferStream = new stream.PassThrough();
		bufferStream.end(Buffer.from(base64Data, 'base64'));

		// Pipe stream to write stream
		bufferStream.pipe(writeStream);
	}

	// Upload database references and their weights & analytics to a list of all items
	uploadReference(onSuccess, onFailure) {
		let db = UploadClient.admin.firestore();

		let audioRef = db.collection('audio');

		// Add to all references
		audioRef.doc('references').update({
			analyticsIdentifiers: UploadClient.admin.firestore.FieldValue.arrayUnion(this.aId)
		})
			.catch((e)=>{
				console.log(e);
				return onFailure();
			});

		// Add to queue
		audioRef.doc('queue').update({
			queue: UploadClient.admin.firestore.FieldValue.arrayUnion(this.aId)
		})
			.catch((e)=>{
				console.log(e);
				return onFailure();
			});

		// Add frequency
		let key = `frequencies.${this.aId}`;
		let frequencyUdpate = {};
		frequencyUdpate[key] = this.frequency;

		audioRef.doc('frequencies').update(frequencyUdpate)
			.catch((e)=>{
				console.log(e);
				return onFailure();
			});

		// Add analytics
		audioRef.doc('references').collection('analytics').doc(this.aId).set({
			timesPlayed: 0,
			timesHeard: 0
		})
			.catch((e)=>{
				console.log(e);
				return onFailure();
			});

		onSuccess();
	}

	/* HANDLE CHECKOUT COMPLETION */

	// Change object when purchase complete
	onPurchaseCompleted() {
		this.upload(()=>{
			console.log('upload success');
			this.wasCompleted = true;
		},
		(e)=> {
			console.log(`upload failed: ${e}`);
		});
	}

}

module.exports = UploadClient;