// Set up graphics to connect to audio

let global = {};

global.onstart = [];
global.onstart.push(function () {
	const WIDTH = window.innerWidth;
	const HEIGHT = window.innerHeight + 20;

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

	class ParticleSystem {

		constructor(lifetime) {

			this.radius = .1;
			this.segments = 7;
			this.lifetime = lifetime;
			this.particles = [];

			// particle = [startTime, posx, posy, velx, vely, object]

		}

		createParticle(scene, posx, posy, velx, vely) {
			var geometry = new THREE.CircleGeometry(this.radius, this.segments);
			var material = new THREE.MeshBasicMaterial();
			material.transparent = true;
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.y = Math.random() * 20 - 10;
			mesh.rotation.x = Math.PI/2;
			scene.add(mesh);
			return Array(global.millis, posx, posy, velx || 0, vely || 0, mesh);

			// TODO: IF WE CAN RAW DRAW 2D STUFF THIS CAN GO AND WE CAN JUST DRAW ALL THE PARTICLES IN ONE FUNC
		}

		addParticles(scene, amt, posx, posy, deviationx, deviationy, velx, vely) {
			for (let i = 0; i < amt; i++) {
				this.particles.push(this.createParticle(scene, posx + (Math.random() - .5) * deviationx, posy + (Math.random() - .5) * deviationy, velx, vely));
			}
		}

		// setSpawnInterval(amt, interval, posx, posy, deviationx, deviationy, velx, vely) {
		// 	window.setInterval(function() {
		// 		this.addParticles(amt, posx, posy, deviationx || 0, deviationy || 0, velx || 0, vely || 0);
		// 	}, interval);
		// }

		applyParticleForces(dt, particle) {}
		// specific per particle system, including drag

		updateParticles(millis, dt, scene) {
			for (let i = this.particles.length - 1; i >= 0; i--) {
				let particle = this.particles[i];
				if (millis - particle[0] > this.lifetime) {
					scene.remove(this.particles[i][5]);
					this.particles.splice(i, 0);
				} else {
					this.applyParticleForces(dt, particle);
					particle[1] += particle[3] * dt;
					particle[2] += particle[4] * dt;

					particle[5].position.x = particle[1];
					particle[5].position.z = particle[2];

					this.adjustParticleLooks(particle, this.lifetime);
				}
			}
			// console.log(this.particles[0]);

			// this.drawParticles();
		}

		adjustParticleLooks(particle, lifetime) {}
		// specific per particle

	}

	function setUpParticleSystems(scene) {

		global.canvas = document.getElementById("container").childNodes[0];

		global.embers = new ParticleSystem(6000);

		global.embers.applyParticleForces = function(dt, particle) {
			particle[3] += dt * .00001 * (Math.sin(particle[1]/3) + Math.cos(particle[2]/2));
			particle[4] += dt * .00002 * (Math.sin(particle[2]) + Math.cos(particle[1]));

			particle[3] *= .99 ** dt;
			particle[4] += .00005 * dt;
			particle[4] *= .99 ** dt;
		};

		global.embers.adjustParticleLooks = function(particle, lifetime) {
			let thing = (global.millis - particle[0]) / lifetime;
			particle[5].material.opacity = 1 - thing;
			particle[5].material.color = {r: 1, g: 1 - thing * 1.5, b: .1};
		}

		// global.embers.setSpawnInterval(10, 700, 200, 0, 400, 10);
		setInterval(function() {
			global.embers.addParticles(scene, 2, 0, -17, 60, 4, 0, 0);
		}, 200);

	}

	global.playSound = function (b64, startTime) {
		console.log(b64);

		var sound = new Audio("data:audio/wav;base64," + b64);
		sound.id = 'audio';
		sound.controls = false;
		sound.currentTime = startTime / 1000;
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

	function getFreqData(analyser) {
		let typedFreqData = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(typedFreqData);

		return Array.from(typedFreqData);
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
		let freqData = getFreqData(analyser);

		// average volume
		return freqData.reduce( ( p, c ) => p + c, 0 ) / freqData.length;
	}

	function getMouthInfluence(volume) {

		// let styled = ((Math.pow(101, average/100) - 1) / 100.0);
		// let capped = styled > 1.0 ? 1.0 : styled;
		//
		// return capped;

		// Average of freqData
		let realAvg = Math.max(0, Math.min(volume / 100.0, 1));

		// Average of freqData in common voice range
		let freqData = getFreqData(global.analyser);
		freqData.splice(0, 85);
		freqData.splice(255);
		let avg = freqData.reduce( ( p, c ) => p + c, 0 ) / freqData.length;
		let commonVoice = Math.max(0, Math.min(avg / 255.0, 1));

		// favor commonVoice more depending on how much louder it is
		const differenceDamper = 10;
		let commonVoiceWeight = 1 + (commonVoice - realAvg) / differenceDamper;
		let weightedAvg = ((commonVoice * commonVoiceWeight) + realAvg) / (1 + commonVoiceWeight);

		return weightedAvg
	}

	function getSquintInfluence(analyser) {
		let freqData = getFreqData(analyser);

		// Use median of freq data
		const sum = freqData.reduce((a,b)=>{return a+b});
		let total = 0;
		let found = false;
		let median = null;
		for (let i = 0; i < freqData.length && !found; i++) {
			total += freqData[i];
			if (total >= sum / 2) {
				median = i;
				found = true;
			}
		}

		let squintInfluence1 = Math.min(Math.max(Math.min(median, 500) - 200, 0) / 500, 1);

		// Use average of three-quarters of freq data
		freqData.splice(0, Math.floor(1 * freqData.length / 4));
		let avg = freqData.reduce( ( p, c ) => p + c, 0 ) / freqData.length;
		let squintInfluence2 = avg / 255;

		// Use whichever is greater for the most effect
		let squintInfluence = Math.min(Math.max(Math.max(squintInfluence1, squintInfluence2), 0), 0.5);

		return squintInfluence;
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

	function getEyebrowInfluence(volume) {
		// Calculate target and set lastVolume
		let target = ((volume - (global.lastVolume || 0))/ 5);
		global.lastVolume = volume;

		// Set target to multiple of 1/intervals
		let intervals = 6;
		target = Math.round(target * intervals) / intervals;

		target = target > 1 ? 1.0 : (target < 0 ? 0 : target);
		// Only use volume shifts above 0.5; double result of target - 0.5 (actually do not)
		// target = Math.max(0, (target - 0.5) * 2);
		// console.log(target);

		// s = inverse speed, amount that difference is divided
		let s = 10;
		let current = global.currentEyebrowInfluence || 0;
		let next = current + ((target - current/ 2) / s);
		next = next > 1 ? 1.0 : (next < 0 ? 0 : next);

		global.currentEyebrowInfluence = next;
		return next;
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

		// set up embers
		setUpParticleSystems(scene);

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

			setEyebrowsRaised(getEyebrowInfluence(global.volumeInterp), gruh);

			setLeftEyeClosed(
				Math.max(
					getSquintInfluence(global.analyser),
					getEyeInfluence(global.blinkEyeLeftTime).sinusoidal || 0)
				, gruh);
			setRightEyeClosed(Math.max(
				getSquintInfluence(global.analyser),
				getEyeInfluence(global.blinkEyeRightTime).sinusoidal || 0)
				, gruh);

			// update particle system
			global.embers.updateParticles(global.millis, global.dt, scene);

			// Schedule the next frame.
			requestAnimationFrame(update);
		}

		// Schedule the first frame.
		requestAnimationFrame(update);
	}

	render();
});

global.start = function() {
	for (let i = 0; i < global.onstart.length; i++) {
		global.onstart[i]();
	}
};

document.getElementById('start').onclick = () => {
	let elem = document.getElementById('blocker');
	elem.parentNode.removeChild(elem);

	global.start()
};