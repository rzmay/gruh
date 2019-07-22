// Menu ui

// Button dropdown
global.onstart.push(()=>{
	let menuTrigger = $('#menuTrigger');
	let triggerY = 75;
	let lastMousePos;

	menuTrigger.click( ()=> {
		menuTrigger.text(function(i,old){
			return old == 'Show Menu' ?  'Hide Menu' : 'Show Menu';
		});
	});

	window.onmousemove = (e)=>{
		if  (e.clientY < triggerY && lastMousePos >= triggerY) {
			menuTrigger.animate({top: '20px'}, 250);
		} else if (e.clientY >= triggerY && lastMousePos < triggerY) {
			menuTrigger.animate({top: '-50px'}, 100);
		}
		lastMousePos = e.clientY;
	}

});

// Add featured merch to menu
window.requestAnimationFrame(()=>{
	let merchCard = $('#gruhMerchDesigns');

	for (var i = 0; i < config.featuredMerch.length; i++) {
		merchCard.append(config.featuredMerch[i].html);
	}
});

// Fix unclickable form elements
window.requestAnimationFrame(()=>{
	$('#frequencyMultiplier').click(()=> {
		console.log('fuc')
	});
});

// Change file label on selection
window.requestAnimationFrame(()=>{
	let fileLabel = $('#audioInputLabel');
	let fileInput = $('#audioInput');
	fileInput.on('change', ()=>{
		let fileName = fileInput[0].files[0].name;
		fileLabel.text(fileName);
	});
});


