// Connect server to audio

global.onstart.push(()=>{
	let socket = io.connect('/', {
		forceNew: true
	});

	socket.on('playSound', (b64, startTime)=>{
		console.log('sound');
		global.playSound(b64, startTime);
	});

	socket.on('blinkEyeLeft', (data)=>{
		global.blinkEyeLeftTime = data.time;
	});

	socket.on('blinkEyeRight', (data)=>{
		global.blinkEyeRightTime = data.time;
	});
});