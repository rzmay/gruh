/* BUTTON DROPDOWN */
global.onstart.push(() => {
	let menuTrigger = $('#menuTrigger');
	let triggerY = 75;
	let lastMousePos;

	menuTrigger.click(() => {
		menuTrigger.text(function (i, old) {
			return old == 'Show Menu' ? 'Hide Menu' : 'Show Menu';
		});
	});

	window.onmousemove = (e) => {
		if (e.clientY < triggerY && lastMousePos >= triggerY) {
			menuTrigger.animate({top: '20px'}, 250);
		} else if (e.clientY >= triggerY && lastMousePos < triggerY) {
			menuTrigger.animate({top: '-50px'}, 100);
		}
		lastMousePos = e.clientY;
	}

});

/* MENU MERCH */
let merchCard = $('#gruhMerchDesigns');

for (var i = 0; i < config.featuredMerch.length; i++) {
	merchCard.append(config.featuredMerch[i].html);
}

/* MENU CREDITS */
let credits = $('#creditsList');

function createCreditElement(credit) {
	return `<div class='list-group-item'>
			<h5 class='text-center'><a href='${credit.page}'>${credit.name || ''}</a></h5>
			<p2 class='text-center'>${credit.role || ''}</p2>
			<br>
			<a class='text-center' href='${credit.license}'>${credit.license || ''}</a>
		</div>`;
}

for (let credit of config.credits) {
	credits.append(createCreditElement(credit))
}

/* FILE UPLOAD */
let form = $('#uploadForm');
let fileLabel = $('#audioInputLabel');
let fileInput = $('#audioInput');
let fileInputContainer = $('#fileInputContainer');
let frequencyMultiplier = $('#frequencyMultiplier');
let priceLabel = $('#uploadPrice');
let invalidTooltip = $('#invalidFileTooltip');

function uploadFile(url, success) {
	let reader = new FileReader();
	let file = fileInput[0].files[0];

	reader.readAsDataURL(file);
	reader.onload = function () {
		let b64 = reader.result;
		$.ajax({
			url: url,
			type: 'POST',
			dataType: 'json',
			data: {
				b64: b64.toString(),
				frequencyMultiplier: frequencyMultiplier.val()
			},
			success: (data) => {
				console.log(data);

				// Set price input
				priceLabel.attr('placeholder', data.price);
				fileInput.removeClass('is-invalid');
				fileInput.addClass('is-valid');

				// Callback
				if (success) {
					success(data);
				}
			},
			error: (error) => {
				// Reset inputs
				fileInput[0].value = null;
				fileLabel.text('Choose file...');
				priceLabel.attr('placeholder', 0.00);

				// Set tooltip
				invalidTooltip.text(error.responseJSON.error);
				fileInput.removeClass('is-valid');
				fileInput.addClass('is-invalid');
			}
		});

	};
	reader.onerror = function (error) {
		console.log('Error: ', error);
	};
}

fileInput.on('change', () => {
	let file = fileInput[0].files[0];

	// Return is file is too large
	if (file.size/1024/1024 > config.maxFileSize) {
		invalidTooltip.text(`Max file size is ${config.maxFileSize}mb. Please select a smaller file.`);
		fileInput.removeClass('is-valid');
		fileInput.addClass('is-invalid');
		fileInput[0].value = null;
		return
	}

	let fileName = fileInput[0].files[0].name;
	fileLabel.text(fileName);

	uploadFile('audio.check');
});

frequencyMultiplier.on('change', () => {
	uploadFile('audio.check');
});

/* Upload file & pay */

form.on('submit', (e)=>{
	// Stop reload
	e.preventDefault();


	// Stripe
	var stripe = Stripe(config.stripePublicKey);
	uploadFile('audio.upload', (session)=>{
		console.log(session);
		stripe.redirectToCheckout({
			// Make the id field from the Checkout Session creation API response
			// available to this file, so you can provide it as parameter here
			// instead of the {{CHECKOUT_SESSION_ID}} placeholder.
			sessionId: session
		}).then(function (result) {
			// If `redirectToCheckout` fails due to a browser or network
			// error, display the localized error message to your customer
			// using `result.error.message`.
			console.log(result);
		});
	})
});

