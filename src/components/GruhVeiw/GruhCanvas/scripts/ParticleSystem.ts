import * as THREE from 'three';
import Particle from './Particle';

interface EmissionSettings {
    
}

interface ParticleSystemSettings {
    duration: number;
    looping: boolean;

    object: THREE.Mesh | THREE.Sprite;

    startRotation: THREE.Vector3 | undefined;
    startScale: THREE.Vector3 | undefined;

    startVelocity: THREE.Vector3 | undefined;
    startAngularVelocity: THREE.Vector3 | undefined;

    lifetime: number | undefined;

    manipulateParticle: (Particle)=>void | undefined;
}

class ParticleSystem {

    duration: number = 10;
    looping: boolean = true;

    object: THREE.Mesh | THREE.Sprite;

    startRotation: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    startScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

    startVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    startAngularVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    lifetime: number = 10;

    manipulateParticle: (Particle)=>void;

    constructor(
        options: ParticleSystemSettings
    ) {
        this.object = options.object;
        this.manipulateParticle = options.manipulateParticle;

        this.startRotation = options.startRotation ?? this.startRotation;
        this.startScale = options.startScale ?? this.startScale;
        this.startVelocity = options.startVelocity ?? this.startVelocity;
        this.startAngularVelocity = options.startAngularVelocity ?? this.startAngularVelocity;

        this.lifetime = options.lifetime ?? this.lifetime;
    }

}