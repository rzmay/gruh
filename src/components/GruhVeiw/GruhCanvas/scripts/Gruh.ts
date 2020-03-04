import * as THREE from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import { SubdivisionModifier } from 'three/examples/jsm/modifiers/SubdivisionModifier';
import GruhMaterials from './GruhMaterials';
import MeshObject from './MeshObject';
import { ModifierStack } from './ModifierStack';
import lerp from 'lerp';

class Gruh {

  gltf: GLTF | undefined;

  head: MeshObject | undefined;
  leftEye: MeshObject | undefined;
  rightEye: MeshObject | undefined;
  leftIris: MeshObject | undefined;
  rightIris: MeshObject | undefined;

  headModifier: ModifierStack | undefined;

  loaded: boolean = false;
  onLoaded: ((GLTF) => void) | undefined;

  constructor(scene: THREE.Scene) {
    const loader = new GLTFLoader();
    loader.load(
      '/asset/model/gruh',
      (gltf) => {
        // Set up gltf & add to scene
        // gltf.scene.position.set(0, -1, 0);
        // gltf.scene.scale.set(10, 10, 10);
        // gltf.scene.rotation.set(0, 0, 0);

        scene.add(gltf.scene);

        this.gltf = gltf;

        // Get parts (head, eyes, irises, mesh)
        const head = gltf.scene.getObjectByName('Gruh');

        const leftEye = gltf.scene.getObjectByName('Eye_L');
        const rightEye = gltf.scene.getObjectByName('Eye_R');

        const leftIris = gltf.scene.getObjectByName('Iris_L');
        const rightIris = gltf.scene.getObjectByName('Iris_R');

        // Get head
        if (head != undefined) {
          console.log(head);
          this.head = new MeshObject(head);
        }

        // Get eyes
        if (leftEye != undefined && rightEye != undefined) {
          this.leftEye = new MeshObject(leftEye);
          this.rightEye = new MeshObject(rightEye);
        }

        // Get irises
        if (leftIris != undefined && rightIris != undefined) {
          this.leftIris = new MeshObject(leftIris);
          this.rightIris = new MeshObject(rightIris);
        }

        // Set materials
        this.leftEye?.setMaterial('EyeSclera', GruhMaterials.sclera());
        this.rightEye?.setMaterial('EyeSclera', GruhMaterials.sclera());

        this.leftEye?.setMaterial('EyeLens', GruhMaterials.lens());
        this.rightEye?.setMaterial('EyeLens', GruhMaterials.lens());

        this.leftIris?.setMaterial('Iris', GruhMaterials.iris());
        this.rightIris?.setMaterial('Iris', GruhMaterials.iris());

        // this.head?.setMaterial('GruhSkin', GruhMaterials.skin());

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xa0a0a0, 1);
        fillLight.position.set(40, 20, 10);
        fillLight.target = (this.head?.object || new THREE.Object3D());
        scene.add(fillLight);

        // const fillLightHelper = new THREE.DirectionalLightHelper(fillLight);
        // scene.add(fillLightHelper);

        // Back light
        const backLight = new THREE.SpotLight(0xc0c0c0, 0.4);
        backLight.position.set(0, 0, -40);
        backLight.target = (this.head?.object || new THREE.Object3D());
        scene.add(backLight);

        // const backLightHelper = new THREE.SpotLightHelper(backLight);
        // scene.add(backLightHelper);

        // Key light
        const keyLight = new THREE.SpotLight(0xc4b0b0, 1);
        keyLight.position.set(-50, -5, 40);
        keyLight.target = (this.head?.object || new THREE.Object3D());
        scene.add(keyLight);

        // const keyLightHelper = new THREE.SpotLightHelper(keyLight);
        // scene.add(keyLightHelper);

        // Delegate
        this.loaded = true;
        if (this.onLoaded != undefined) this.onLoaded(gltf);
      }
    );
  }

  lookAt(position: THREE.Vector3) {
    for (var eye of [this.leftEye, this.rightEye]) {
      if (eye == undefined) return;

      // Rotate to camera
      let currentRotation = new THREE.Quaternion().copy(eye.object.quaternion);

      eye.object.lookAt(position);
      let targetRotation = new THREE.Quaternion().copy(eye.object.quaternion);

      THREE.Quaternion.slerp(currentRotation, targetRotation, eye.object.quaternion, 0.05);
    }

    // Pupil dilation based on camera's x position
    const maxXPos = Math.cos(Math.PI/3) * 170; // cos(Max rotation) * camera distance
    const amount = Math.abs(position.x) / maxXPos;
    this.setPupilDilationBoth(lerp(-0.8, 1, amount));
  }

  setMouthOpen(amount: number) {
    this.head?.setMorphTargetInfluence('MouthOpenV', amount);
  }

  setMouthRoundness(amount: number) {
    this.head?.setMorphTargetInfluence('MouthCloseH', amount);
  }

  setBreathe(amount: number) {
    this.head?.setMorphTargetInfluence('Breathe', amount);
  }

  setEyebrowsRaised(amount: number) {
    this.head?.setMorphTargetInfluence('Eyebrows', amount);
  }

  setBlinkBoth(amount: number) {
    this.head?.setMorphTargetInfluence('BlinkL', amount);
    this.head?.setMorphTargetInfluence('BlinkR', amount);
  }

  setBlink(left: number, right: number) {
    this.head?.setMorphTargetInfluence('BlinkL', left);
    this.head?.setMorphTargetInfluence('BlinkR', right);
  }

  setPupilDilationBoth(amount: number) {
    this.leftIris?.setMorphTargetInfluence('PupilExpand', amount);
    this.rightIris?.setMorphTargetInfluence('PupilExpand', amount);
  }

  setPupilDilation(left: number, right: number) {
    this.leftIris?.setMorphTargetInfluence('PupilExpand', left);
    this.rightIris?.setMorphTargetInfluence('PupilExpand', right);
  }
}

export default Gruh;
