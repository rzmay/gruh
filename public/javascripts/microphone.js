// Set up microphone to audio

global.onstart.push(()=>{
	function startMic() {
		let audioCtx = global.audioContext;
		let analyser = global.analyser;

		navigator.mediaDevices.getUserMedia({audio: true})
			.then(function(stream) {
				var source = audioCtx.createMediaStreamSource(stream);
				source.connect(analyser);
			});
	}

	function doBlink() {
		function blinkEye(eye) {
			let blink = {
				'Left': ()=>{
					global.blinkEyeLeftTime = new Date().getTime();
				},
				'Right': ()=>{
					global.blinkEyeRightTime = new Date().getTime();
				}
			};
			blink[eye]();
		}

		setTimeout(()=>{blinkEye('Left')}, (Math.random() * 0.2 * 1000));
		setTimeout(()=>{blinkEye('Right')}, (Math.random() * 0.2 * 1000));

		setTimeout(doBlink, ((Math.random() * 3) +  5) * 1000);
	}

	doBlink();
	startMic();
});