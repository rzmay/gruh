import * as THREE from 'three';

class Particle {

    position: THREE.Vector3;
    rotation: THREE.Vector3;
    scale: THREE.Vector3;

    velocity: THREE.Vector3;
    angularVelocity: THREE.Vector3;

    readonly object: THREE.Mesh | THREE.Sprite;

    private readonly _isSprite: boolean;

    constructor(
        position: THREE.Vector3,
        rotation: THREE.Vector3,
        scale: THREE.Vector3,
        velocity: THREE.Vector3,
        angularVelocity: THREE.Vector3,
        object: THREE.Mesh | THREE.Sprite,
    ) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;

        this.velocity = velocity;
        this.angularVelocity = angularVelocity;

        this.object = object;

        this._isSprite = object instanceof THREE.Sprite;
    }

    move(deltaTime: number) {
        this.position.addScaledVector(this.velocity, deltaTime);
        this.rotation.addScaledVector(this.angularVelocity, deltaTime);

        this.object.position.set(this.position.x, this.position.y, this.position.z);
        this.object.scale.set(this.scale.x, this.scale.y, this.scale.z);

        if (this._isSprite) {
            let material = this.object.material as (THREE.SpriteMaterial);
            material.rotation = this.rotation.x;
        } else {
            let mesh = this.object as (THREE.Mesh);
            mesh.rotation.setFromVector3(this.rotation);
        }
    }
}

export default Particle;