// Connect server to audio

global.onstart.push(()=>{
	let socket = io.connect('/', {
		forceNew: true
	});

	socket.on('playSound', (b64, startTime)=>{
		console.log('sound');
		global.playSound(b64, startTime);
	});

	socket.on('blinkEyeLeft', ()=>{
		global.blinkEyeLeftTime = global.millis;
	});

	socket.on('blinkEyeRight', ()=>{
		global.blinkEyeRightTime = global.millis;
	});
});