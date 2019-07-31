class UploadClient {

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
	generateAnalyticsIdentifier() {
		return null
	}

	// Upload all data to database using other upload functions
	upload(onSuccess, onFailure) {
		console.log('uploading!');

		let ref = this.uploadAudio();
		this.aId = this.generateAnalyticsIdentifier();
		this.uploadReference(ref, this.aId);

		onSuccess();
	}

	// Upload audio file from b64 and return database ref
	uploadAudio() {
		return null
	}

	// Upload database references and their weights & analytics to a list of all items
	uploadReference(dbRef, analyticsId) {

	}

	/* HANDLE CHECKOUT COMPLETION */

	// Change object when purchase complete
	onPurchaseCompleted() {
		let self = this;
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