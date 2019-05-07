function start() {
	const WIDTH = window.innerWidth;
	const HEIGHT = window.innerHeight + 20;

	let global = {};

	function setUpAudioContext() {
		var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		var analyser = audioCtx.createAnalyser();
		analyser.connect(audioCtx.destination);

		global.analyser = analyser;
		global.audioContext = audioCtx;
		global.lastAudio = 0;
		global.eyebrowHeight = 0;
		global.volumeInterp = 0;
	}
	
	function playSound(b64) {
		console.log(b64);

		var sound = new Audio("data:audio/wav;base64," + b64);
		sound.id = 'audio';
		sound.controls = false;;
		sound.type = 'audio/mp3';
		sound.autoplay = true;


		let audioCtx = global.audioContext;
		let analyser = global.analyser;

		document.body.appendChild(sound);

		var audio = document.getElementById('audio');

		audio.onended = () => {
			audio.parentElement.removeChild(audio);
		};

		var source = audioCtx.createMediaElementSource(audio);

		source.connect(analyser);
	}

	function addCamera(scene) {
		// Set some camera attributes.
		const VIEW_ANGLE = 1;
		const ASPECT = WIDTH / HEIGHT;
		const NEAR = 10;
		const FAR = 100000;

		const camera =
			new THREE.PerspectiveCamera(
				VIEW_ANGLE,
				ASPECT,
				NEAR,
				FAR
			);

		scene.add(camera);

		var controls = new THREE.OrbitControls(camera);
		camera.position.set(0, -1750, 100);
		controls.update();

		controls.maxZoom = 20;
		// controls.minAzimuthAngle = -Math.PI/6;
		// controls.maxAzimuthAngle = Math.PI/6;
		// controls.minPolarAngle = -Math.PI/6;
		// controls.maxPolarAngle = Math.PI/6;

		controls.enablePan = false;
		controls.enableZoom = false;

		return {camera: camera, controls: controls}
	}

	function getRenderer() {
		const renderer = new THREE.WebGLRenderer();

		renderer.gammaOutput = true;
		renderer.gammaFactor = 2.2;

		renderer.setSize(WIDTH, HEIGHT);

		return renderer;
	}

	function addMesh(scene, completion) {
		let loader = new THREE.GLTFLoader();

		loader.load(
			// resource URL
			'gruh.glb',
			// called when the resource is loaded
			function (gltf) {

				gltf.scene.position.set(0, 0, 0);
				gltf.scene.scale.set(10, 10, 10);
				gltf.scene.rotation.set(Math.PI/2, 0, 0);

				scene.add(gltf.scene);

				console.log(gltf.animations); // Array<THREE.AnimationClip>
				console.log(gltf.scene); // THREE.Scene
				console.log(gltf.scenes); // Array<THREE.Scene>
				console.log(gltf.cameras); // Array<THREE.Camera>
				console.log(gltf.asset); // Object
				console.log("gb", gltf.morphTargetInfluences);
				window.gruh = gltf;

				completion(gltf.scene);

			},
			// called while loading is progressing
			function (xhr) {

				console.log((xhr.loaded / xhr.total * 100) + '% loaded');

			},
			// called when loading has errors
			function (error) {

				console.log('An error happened:' + error);

			}
		);
	}

	function addLights(transforms, scene) {
		for (let i = 0; i < transforms.length; i++) {
			const pointLight =
				new THREE.PointLight(0xFFFFFF);

			// set its position
			pointLight.position.x = transforms[i].x;
			pointLight.position.y = transforms[i].y;
			pointLight.position.z = transforms[i].z;

			// add to the scene
			scene.add(pointLight);
		}
	}

	function getVolume(analyser) {
		let typedFreqData = new Uint8Array(analyser.frequencyBinCount);

		analyser.getByteFrequencyData(typedFreqData);

		let freqData = Array.from(typedFreqData);

		// average volume
		return freqData.reduce( ( p, c ) => p + c, 0 ) / freqData.length;
	}

	function getMouthInfluence(volume) {

		// let styled = ((Math.pow(101, average/100) - 1) / 100.0);
		// let capped = styled > 1.0 ? 1.0 : styled;
		//
		// return capped;

		// Average of freqData
		return Math.min(volume / 100.0, 1);
	}

	function getEyeInfluence(time) {
		let timeDiff = global.millis - time;
		let blinkTime = 350;

		return {
			quadratic: Math.max(0, -1 * ((1/blinkTime) * (timeDiff-blinkTime))**2 + 1),
			linear: Math.max(0, 1 - Math.abs(1 - timeDiff/blinkTime)),
			sinusoidal: timeDiff > blinkTime ? 0 : 0.5*Math.sin(((2*Math.PI)/blinkTime)*(timeDiff-(blinkTime/4)))+0.5,

		}
	}

	// function getEyebrowInfluence(volume) {
	// 	// Calculate target and set lastVolume
	// 	let target = ((volume - (global.lastVolume || 0))/ 5);
	// 	global.lastVolume = volume;

	// 	// Set target to multiple of 1/intervals
	// 	let intervals = 4;
	// 	target = Math.round(target * intervals) / intervals;

	// 	// Only use volume shifts above 0.5; double result of target - 0.5
	// 	target = target > 1 ? 1.0 : (target < 0 ? 0 : target);
	// 	target = Math.max(0, (target - 0.5) * 4);

	// 	// s = inverse speed, amount that difference is divided
	// 	let s = 20;
	// 	let current = global.currentEyebrowInfluence || 0;
	// 	let next = current + ((target - current/ 2) / s);
	// 	next = next > 1 ? 1.0 : (next < 0 ? 0 : next);

	// 	global.currentEyebrowInfluence = next;
	// 	return next;
	// }

	function changeEyebrowInfluence(volume) {
		let volChange = Math.min(Math.max(volume - global.lastAudio, 0) / global.dt * 10, 1) || 0;

		global.eyebrowHeight = Math.min(global.eyebrowHeight + (volChange - global.eyebrowHeight) * .003 * global.dt, 1);

		global.lastAudio = volume;
	}

	function setMouthOpen(amount, gruh) {
		if (!gruh) return;
		gruh.traverse( function ( node ) {
			if ( node.isMesh ){
				node.morphTargetInfluences[0] = amount;
			}
		} );
	}

	function setLeftEyeClosed(amount, gruh) {
		if (!gruh) return;
		gruh.traverse( function ( node ) {
			if ( node.isMesh ){
				node.morphTargetInfluences[3] = amount;
			}
		} );
	}

	function setRightEyeClosed(amount, gruh) {
		if (!gruh) return;
		gruh.traverse( function ( node ) {
			if ( node.isMesh ){
				node.morphTargetInfluences[2] = amount;
			}
		} );
	}

	function setEyebrowsRaised(amount, gruh) {
		if (!gruh) return;
		gruh.traverse( function ( node ) {
			if ( node.isMesh ){
				node.morphTargetInfluences[1] = amount;
			}
		} );
	}

	function render() {
		// Get the DOM element to attach to
		const container =
			document.getElementById('container');

		const scene = new THREE.Scene();

		let {camera, controls} = addCamera(scene);
		let renderer = getRenderer();

		let gruh;

		global.dt = 16;
		global.millis = new Date().getTime();

		addMesh(scene, (mesh) => {
			gruh = mesh;
		});

		addLights([
			{x: 10, y: -300, z: 50},
			{x: -100, y: 200, z: 200},
			{x: 10, y: 10, z: 10000}], scene);

		setUpAudioContext();

		// Attach the renderer-supplied
		// DOM element.
		container.appendChild(renderer.domElement);

		function update() {
			// Draw!
			let ct = new Date().getTime();
			global.dt = ct - global.millis;
			global.millis = ct;

			renderer.render(scene, camera);

			controls.update();

			let vol = getVolume(global.analyser);
			global.volumeInterp += (vol - global.volumeInterp) * .01 * global.dt;

			setMouthOpen(getMouthInfluence(global.volumeInterp), gruh);

			changeEyebrowInfluence(global.volumeInterp);
			setEyebrowsRaised(global.eyebrowHeight, gruh);

			setLeftEyeClosed(getEyeInfluence(global.blinkEyeLeftTime).sinusoidal, gruh);
			setRightEyeClosed(getEyeInfluence(global.blinkEyeRightTime).sinusoidal, gruh);

			// Schedule the next frame.
			requestAnimationFrame(update);
		}

		// Schedule the first frame.
		requestAnimationFrame(update);
	}

	let socket = io.connect('/', {
		forceNew: true
	});

	socket.on('playSound', (b64)=>{
		console.log('sound');
		playSound(b64);
	});

	socket.on('blinkEyeLeft', ()=>{
		global.blinkEyeLeftTime = global.millis;
	});

	socket.on('blinkEyeRight', ()=>{
		global.blinkEyeRightTime = global.millis;
	});

	render();
}

document.getElementById('start').onclick = () => {
	let elem = document.getElementById('blocker');
	elem.parentNode.removeChild(elem);
	start();
};