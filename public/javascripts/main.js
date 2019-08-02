// Connect server to audio

global.onstart.push(()=>{
	let socket = io.connect('/', {
		forceNew: true
	});

	socket.on('playSound', (src, b64, startTime)=>{
		console.log('Audio source: ' + src);
		global.playSound(src, b64, startTime);
	});

	socket.on('stopSound', ()=>{
		console.log('Sound over');
		global.stopSound();
	});

	socket.on('blinkEyeLeft', (data)=>{
		global.blinkEyeLeftTime = data.time;
	});

	socket.on('blinkEyeRight', (data)=>{
		global.blinkEyeRightTime = data.time;
	});
});