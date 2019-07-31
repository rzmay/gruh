/* BUTTON DROPDOWN */
global.onstart.push(() => {
	let menuTrigger = $('#menuTrigger');
	let triggerY = 75;
	let lastMousePos;
	let menuOpen = false;

	menuTrigger.click(() => {
		menuTrigger.text(function (i, old) {
			menuOpen = !menuOpen;
			return old == 'Show Menu' ? 'Hide Menu' : 'Show Menu';
		});
	});

	window.onmousemove = (e) => {
		if (e.clientY < triggerY && lastMousePos >= triggerY) {
			menuTrigger.animate({top: '20px'}, 250);
		} else if (e.clientY >= triggerY && lastMousePos < triggerY && !menuOpen) {
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

// Stop reload
form.on('submit', (e)=>{  });

function uploadFile() {
	let reader = new FileReader();
	let file = fileInput[0].files[0];

	reader.readAsDataURL(file);
	reader.onload = function () {
		let b64 = reader.result;
		$.ajax({
			url: 'audio.check',
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

	// Return if file is too large
	if (file.size/1024/1024 > config.maxFileSize) {
		invalidTooltip.text(`Max file size is ${config.maxFileSize}mb. Please select a smaller file.`);
		fileInput.removeClass('is-valid');
		fileInput.addClass('is-invalid');
		fileInput[0].value = null;
		return
	}

	let fileName = fileInput[0].files[0].name;
	fileLabel.text(fileName);

	uploadFile();
});

frequencyMultiplier.on('change', () => {
	uploadFile();
});


