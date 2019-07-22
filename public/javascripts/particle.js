class Particle {

	constructor(position, velocity, rotation, startTime, mesh, options, isSprite=false) {
		this.position = position;
		this.velocity = velocity;
		this.rotation = rotation;
		this.startTime = startTime;
		this.mesh = mesh;
		this.options = options;
		this.isSprite = isSprite;
	}

	move(deltaTime) {
		this.position.addScaledVector(this.velocity, deltaTime);
		this.mesh.position.set(this.position.x, this.position.y, this.position.z);

		this.rotate();
	}

	rotate() {
		if (this.isSprite) {
			this.mesh.material.rotation = this.rotation.x;
		} else {
			this.mesh.material.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
		}
	}


}