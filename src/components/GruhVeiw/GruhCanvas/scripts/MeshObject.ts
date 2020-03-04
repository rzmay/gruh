import * as THREE from 'three';
import { ObjectSource } from './ModifierStack';

class MeshObject implements ObjectSource {

  object: THREE.Object3D;
  mesh: THREE.Mesh = new THREE.Mesh();

  constructor(object: THREE.Object3D) {
    this.object = object;

    this.object.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        // If mesh not already found, set mesh & deform
        this.mesh = this.mesh || node as THREE.Mesh;
      }
    });
  }

  setMaterial(name: string, material: THREE.Material) {
    this.object.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        if ((<THREE.Material>node.material).name == name) {
          node.material = material;
        }
      }
    });
  }

  setMorphTargetInfluenceIndex(index: number, amount: number) {
    if (this.mesh == undefined || this.mesh.morphTargetInfluences == undefined) return;
    this.mesh.morphTargetInfluences[index] = amount;
  }

  // This does not work, but morph target documentation is limited so I'm not sure if it actually should
  setMorphTargetInfluence(name: string, amount: number) {
    if (this.mesh == undefined || this.mesh.morphTargetDictionary == undefined || this.mesh.morphTargetInfluences == undefined) return;
    if (this.mesh.morphTargetDictionary.hasOwnProperty(name)) {
      this.mesh.morphTargetInfluences[this.mesh.morphTargetDictionary[name]] = amount;
    }

    console.log(`Setting ${name}: ${amount}`);
  }
}

export default MeshObject;