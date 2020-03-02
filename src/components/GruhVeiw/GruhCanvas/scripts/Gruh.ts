import * as THREE from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {TranslucentShader} from "three/examples/jsm/shaders/TranslucentShader";
import MeshObject from './MeshObject';

import * as images from '../../../../assets/images/*.*';
import {ShaderMaterial} from "three";

class Gruh {

  gltf: GLTF | undefined;

  head: MeshObject | undefined;
  leftEye: MeshObject | undefined;
  rightEye: MeshObject | undefined;
  leftIris: MeshObject | undefined;
  rightIris: MeshObject | undefined;

  onLoaded: ((GLTF) => void) | undefined;

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

        // Get parts (head, eyes, irises, mesh)
        const head = gltf.scene.getObjectByName('Gruh');

        const leftEye = gltf.scene.getObjectByName('Eye_L');
        const rightEye = gltf.scene.getObjectByName('Eye_R');

        const leftIris = gltf.scene.getObjectByName('Iris_L');
        const rightIris = gltf.scene.getObjectByName('Iris_R');

        if (head != undefined) this.head = new MeshObject(head);

        if (leftEye != undefined) this.leftEye = new MeshObject(leftEye);
        if (rightEye != undefined) this.rightEye = new MeshObject(rightEye);

        if (leftIris != undefined) this.leftIris = new MeshObject(leftIris);
        if (rightIris != undefined) this.rightIris = new MeshObject(rightIris);

        // Create materials
        let textureLoader = new THREE.TextureLoader();

        const scleraMaterial = new THREE.MeshPhysicalMaterial({
          map: textureLoader.load(images['Sclera_COL'].png),
          bumpMap: textureLoader.load(images['Sclera_BUMP'].png),
          bumpScale: 0.1,
          roughness: 0.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1
        });

        const lensMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.0,
          depthWrite: false,
          transparency: 0.75,
          refractionRatio: 1.05,
          opacity: 1.0,
          transparent: true
        });

        const irisMaterial = new THREE.MeshPhysicalMaterial({
          map: textureLoader.load(images['Iris_COL'].png),
          bumpMap: textureLoader.load(images['Iris_BUMP'].png),
          bumpScale: 0.2,
          roughness: 0.0
        });

        var shader = TranslucentShader;
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms.map.value = textureLoader.load(images['white'].png);
        uniforms.thicknessColor.value = new THREE.Color(0xe75f51);
        uniforms.thicknessPower.value = 1;
        uniforms.thicknessAttenuation.value = 500;
        uniforms.thicknessAmbient.value = 200;

        const gruhSkinMaterial = new ShaderMaterial({
          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
          lights: true
        });
        gruhSkinMaterial.extensions.derivatives = true;

        // Set materials
        this.leftEye?.setMaterial('EyeSclera', scleraMaterial);
        this.rightEye?.setMaterial('EyeSclera', scleraMaterial);

        this.leftEye?.setMaterial('EyeLens', lensMaterial);
        this.rightEye?.setMaterial('EyeLens', lensMaterial);

        this.leftIris?.setMaterial('Iris', irisMaterial);
        this.rightIris?.setMaterial('Iris', irisMaterial);

        this.head?.setMaterial('GruhSkin', gruhSkinMaterial);

        // Delegate
        if (this.onLoaded != undefined) this.onLoaded(gltf);
      }
    );
  }

  lookAt(position: THREE.Vector3) {
    for (var eye of [this.leftEye, this.rightEye]) {
      if (eye == undefined) return;

      let currentRotation = new THREE.Quaternion().copy(eye.object.quaternion);

      eye.object.lookAt(position);
      let targetRotation = new THREE.Quaternion().copy(eye.object.quaternion);

      THREE.Quaternion.slerp(currentRotation, targetRotation, eye.object.quaternion, 0.05);
    }
  }

  setMouthOpen(amount: number) {
    this.head?.setMorphTargetInfluence('MouthOpen', amount);
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
