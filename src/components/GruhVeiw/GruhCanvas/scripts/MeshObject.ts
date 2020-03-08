import * as THREE from 'three';
import { ObjectSource } from './ModifierStack';

class MeshObject implements ObjectSource {

  object: THREE.Object3D;

  // Store each direct child mesh for shape keys
  meshList: THREE.Mesh[] = [];

  constructor(object: THREE.Object3D) {
    this.object = object;

    // Add self if mesh
    if (object instanceof THREE.Mesh) {
      this.meshList.push(object as THREE.Mesh);
    }

    this.object.children.forEach((node) => {
      if (node instanceof THREE.Mesh) {
        // Add to mesh list
        this.meshList.push(node as THREE.Mesh);
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
    this.meshList.forEach((mesh) => {
      if (mesh.morphTargetInfluences == undefined) return;
      mesh.morphTargetInfluences[index] = amount;
    });
  }

  setMorphTargetInfluence(name: string, amount: number) {
    this.meshList.forEach((mesh) => {
      if (mesh == undefined || mesh.morphTargetDictionary == undefined || mesh.morphTargetInfluences == undefined) return;
      if (mesh.morphTargetDictionary.hasOwnProperty(name)) {
        mesh.morphTargetInfluences[mesh.morphTargetDictionary[name]] = amount;
      }
    });
  }
}

export default MeshObject;