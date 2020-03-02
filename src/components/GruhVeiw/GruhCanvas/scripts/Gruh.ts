import * as THREE from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

class Gruh {

  gltf: GLTF | undefined;

  head: THREE.Object3D | undefined;
  leftEye: THREE.Object3D | undefined;
  rightEye: THREE.Object3D | undefined;

  mesh: THREE.Mesh | undefined;

  constructor(scene: THREE.Scene) {
    const loader = new GLTFLoader();
    loader.load(
      '/asset/model/gruh',
      (gltf) => {
        // Set up gltf & add to scene
        gltf.scene.position.set(0, -1, 0);
        gltf.scene.scale.set(10, 10, 10);
        gltf.scene.rotation.set(0, 0, 0);

        scene.add(gltf.scene);

        this.gltf = gltf;

        this.head = gltf.scene.getObjectByName('Gruh');
        this.leftEye = gltf.scene.getObjectByName('Eye_L');
        this.rightEye = gltf.scene.getObjectByName('Eye_R');

        if (this.head != undefined) {
          this.head.traverse((node) => {
            if (node instanceof THREE.Mesh) {
              this.mesh = node as THREE.Mesh;
            }
          });
        }
      }
    );
  }

  lookAt(position: THREE.Vector3) {
    for (var eye of [this.leftEye, this.rightEye]) {
      if (eye == undefined) return;

      let currentRotation = new THREE.Quaternion().copy(eye.quaternion);

      eye.lookAt(position);
      let targetRotation = new THREE.Quaternion().copy(eye.quaternion);

      THREE.Quaternion.slerp(currentRotation, targetRotation, eye.quaternion, 0.05);
    }
  }

  setMouthOpen(amount: number) {
    this.setMorphTarget(0, amount);
  }

  setEyebrowsRaised(amount: number) {
    this.setMorphTarget(1, amount);
  }

  setBlink(left: number, right: number) {
    this.setMorphTarget(2, right);
    this.setMorphTarget(3, left);
  }

  private setMorphTarget(index: number, amount: number) {
    if (this.mesh == undefined || this.mesh.morphTargetInfluences == undefined) return;
    this.mesh.morphTargetInfluences[index] = amount;
  }
}

export default Gruh;
