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

	// Utility func
	function randomSeed(seed) {
		var x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	}

	function setUpParticleSystems(scene) {

		global.canvas = document.getElementById("container").childNodes[0];

		// Set up which particles to show
		global.showEmbers = false;
		global.showSmoke = true;

		// Embers

		// Custom property for particle system
		let embersLifetime = 6000;

		let embersTexture = new THREE.TextureLoader().load('images/particle_embers_1.png');

		global.embers = new ParticleSystem(
			'mesh',
			()=>{
				var radius = 0.1;
				var segments = 7;
				var geometry = new THREE.CircleGeometry(radius, segments);
				var material = new THREE.MeshBasicMaterial({color: 0xffffff, map: embersTexture, transparent: true});
				material.transparent = true;

				let sprite = new THREE.Sprite(material);
				sprite.scale.set(.15,.15,1);

				return sprite;
			},
			(particle, self)=>{
				return global.millis - particle[0] > embersLifetime;
			}
		);

		// Custom property for embers
		global.embers.lifetime = 6000;

		global.embers.getNewParticle= function(createParticle) {
			let [posx, posy, posz, deviationx, deviationy, deviationz, velx, vely, velz, rotx, roty, rotz] =
				[0, -17, 0, 60, 4, 40, 0, 0, 0, Math.PI / 2, 0, 0];

			let params = {
				posx: posx + (Math.random() - .5) * deviationx,
				posy: posy + (Math.random() - .5) * deviationy,
				posz: posz + (Math.random() - .5) * deviationz,
				velx: velx,
				vely: vely,
				velz: velz,
				rotx: rotx,
				roty: roty,
				rotz: rotz
			};

			createParticle(params);
		};

		global.embers.applyParticleForces = function(dt, particle) {
			particle[4] += dt * .00001 * (Math.sin(particle[1]/4) + Math.cos(particle[2]/2));
			particle[5] += dt * .00002 * (Math.sin(particle[2]) + Math.cos(particle[1]));

			particle[4] *= .99 ** dt;
			particle[5] += .00005 * dt;
			particle[5] *= .99 ** dt;
		};

		global.embers.adjustParticleLooks = function(particle) {
			let life = (global.millis - particle[0]) / global.embers.lifetime;
			particle[10].material.opacity = 1 - life;
			particle[10].material.color = {r: 1, g: 1 - life * 1.5, b: 1 - life * 3};
		};



		// global.embers.setSpawnInterval(10, 700, 200, 0, 400, 10);
		if (global.showEmbers) {
			setInterval(function() {
				global.embers.addParticles(scene, 2);
			}, 200);
		}

		// Smoke
		let smokeTexture = new THREE.TextureLoader().load('images/particle_smoke_1.png');

		global.smoke = new ParticleSystem(
			'sprite',
			()=>{
				// let smokeTexture = new THREE.TextureLoader().load('images/particle_smoke_1.png');
				// let smokeMaterial = new THREE.MeshLambertMaterial({color: 0x888888, map: smokeTexture, transparent: true, opactiy: 0.1});
				// let smokeGeo = new THREE.PlaneGeometry(20,20);
				//
				// return new THREE.Mesh(smokeGeo, smokeMaterial);
				let smokeMaterial = new THREE.SpriteMaterial({color: 0xc8c8c8, map: smokeTexture, transparent: true});
				smokeMaterial.opacity = 0.2;

				let sprite = new THREE.Sprite(smokeMaterial);
				sprite.scale.set(30, 30, 1);

				return sprite;
			},
			(particle, self)=>{
				return (particle[1] > 75);
			}
		);

		global.smoke.getNewParticle= function(createParticle) {
			let [posx, posy, posz, deviationx, deviationy, deviationz, velx, vely, velz, rotx, roty, rotz] =
				[-75, -20, 0, 20, 30, 30, 0.005, 0, 0, Math.random() * (2 * Math.PI), 0, 0];

			let params = {
				posx: posx + (Math.random() - .5) * deviationx,
				posy: posy + (Math.random() - .5) * deviationy,
				posz: posz + (Math.random() - .5) * deviationz,
				velx: velx,
				vely: vely,
				velz: velz,
				rotx: rotx,
				roty: roty,
				rotz: rotz
			};

			createParticle(params);
		};

		global.smoke.adjustParticleLooks = function(particle) {
			particle[7] += (2*Math.PI / 360) * 0.25;

			// Sin wave with a period of 3000 and a random offset seeded by start time
			let life = global.millis - particle[0];
			let darkness = (1 / 255) * (200 + 30 * Math.sin((2*Math.PI / 3000) * (life + randomSeed(particle[0]))));

			// console.log('d: '+ darkness);
			particle[10].material.color = {r: darkness, g: darkness, b: darkness};
		};

		// Add smoke to center before created smoke drifts in
		for (let i = -75; i < 75; i+=3) {
			let [posx, posy, posz, deviationx, deviationy, deviationz, velx, vely, velz, rotx, roty, rotz] =
				[i, -20, 0, 20, 30, 30, 0.005, 0, 0, Math.random() * (2 * Math.PI), 0, 0];

			global.smoke.particles.push(global.smoke.createParticle(
				scene,
				posx + (Math.random() - .5) * deviationx,
				posy + (Math.random() - .5) * deviationy,
				posz + (Math.random() - .5) * deviationz,
				velx,
				vely,
				velz,
				rotx,
				roty,
				rotz,
			));
		}

		// global.smoke.setSpawnInterval(10, 700, 200, 0, 400, 10);
		if (global.showSmoke) {
			setInterval(function () {
				global.smoke.addParticles(scene, 1);
			}, 400);
		}
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
	};

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

	function getHeadRotation(mDown, dmx, dmy, prevx, prevy, dt) {
		if (mDown) {
			var x = prevx + dt * dmx / ((Math.abs(prevx) + 1) ** 2);
			var y = prevy + dt * dmy / ((Math.abs(prevy) + 1) ** 2);
			// console.log(x);
			return [x, y];
		}
		// console.log(prevx/(.9**dt));
		return [prevx*(.9**dt), prevy*(.9**dt)];
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

		global.mouseDown = false;
		global.headx = 0;
		global.heady = 0;

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

		window.addEventListener('mousedown', function() {global.mouseDown = true});
		window.addEventListener('mouseup', function() {global.mouseDown = false});

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

			let bruh = getHeadRotation(global.mouseDown, 1, 0, global.headx, global.heady, global.dt)
			global.headx = bruh[0];
			global.heady = bruh[1];

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
			if (global.showEmbers) global.embers.updateParticles(global.millis, global.dt, scene);
			if (global.showSmoke) global.smoke.updateParticles(global.millis, global.dt, scene);

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