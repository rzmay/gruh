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
let submitButton = $('#submitButton');
let priceLabel = $('#uploadPrice');
let invalidTooltip = $('#invalidFileTooltip');

function showErrorTooltip(message) {
	invalidTooltip.text(message);
	fileInput.removeClass('is-valid');
	fileInput.addClass('is-invalid');
}

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
				// Set price input
				priceLabel.attr('placeholder', data.price);
				fileInput.removeClass('is-invalid');
				fileInput.addClass('is-valid');
				submitButton.attr('disabled', false);

				// Callback
				if (success) {
					success(data, b64);
				}
			},
			error: (error) => {
				// Reset inputs
				fileInput[0].value = null;
				fileLabel.text('Choose file...');
				priceLabel.attr('placeholder', 0.00);
				submitButton.attr('disabled', true);

				// Set tooltip
				showErrorTooltip(error.responseJSON.error);
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
			showErrorTooltip(`Max file size is ${config.maxFileSize}mb. Please select a smaller file.`);
			fileInput[0].value = null;
			submitButton.attr('disabled', true);

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
let stripe = Stripe(config.stripePublicKey);

form.on('submit', (e)=>{
	// Stop reload
	e.preventDefault();

	// Temporarily disable button
	submitButton.attr('disabled', true);

	// Stripe
	uploadFile('audio.upload', (result, b64)=>{
		// Round numbers
		let duration = Number((result.duration/1000).toFixed(1));
		let size = Number((result.size).toFixed(3));

		stripe.redirectToCheckout({
			sessionId: result.session.id
		}).then(function (result) {
			showErrorTooltip(result.error.message);
		});
	})
});

/* POST PURCHASE CONFIRMATION */

let modal = $('#purchaseModal');
let aIdLabel = $('#analyticsIdentifier');
let dismissButton = $('#modalDismiss');

// If client, set aIdLabel, present modal, and set dismissButton onclick
// Otherwise, remove the modal from the page
if (config.isClient) {
	aIdLabel.text(config.analyticsIdentifier);

	dismissButton.click(()=>{
		// Ensure that client id is connected
		if (!config.clientId) return;
		$.ajax({
			url: '/clearclient',
			type: 'POST',
			dataType: 'json',
			data: {
				clientId: config.clientId
			},
			success: (data) => {
				// Log success
				console.log(`Destroyed client successfully: ${data.success}`)
			},
			error: (error) => {
				// Log error
				console.log(`Destroyed client successfully: ${error.success}`);
				console.log(error.error);
			}
		})
	});

	modal.modal('show');
} else {
	modal.remove();
}

/* ANALYTICS */

let requestLabel = $('#requestLabel');
let analyticsLabel = $('#analyticsContainer');
let timesHeardLabel = $('#timesHeard');
let timesPlayedLabel = $('#timesPlayed');
let analyticsInput = $('#analyticsIdentifierInput');
let analyticsSubmit = $('#analyticsButton');

// On click, generate request and get analytics
analyticsSubmit.click(()=>{
	let aId = analyticsInput.val();

	let url = `/api/analytics?analytics_id=${aId}`;
	requestLabel.text(`Request: ${url}`);

	$.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		success: (data)=>{
			analyticsLabel.text(JSON.stringify(data));
			timesHeardLabel.text(`Times Heard: ${data.timesHeard}`);
			timesPlayedLabel.text(`Times Played: ${data.timesPlayed}`);
		},
		error: (e)=>{
			console.log(e);
			analyticsLabel.text(JSON.stringify(e));
			timesHeardLabel.text(e.statusText || '');
			timesPlayedLabel.text(e.responseJSON.message || '');
		}
	})
});
