import * as THREE from 'three';

class MeshObject {

  object: THREE.Object3D;
  mesh: THREE.Mesh | undefined;

  constructor(object: THREE.Object3D) {
    this.object = object;

    this.object.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        // If mesh not already found, set mesh
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

  setMorphTargetInfluence(name: string, amount: number) {
    if (this.mesh == undefined || this.mesh.morphTargetDictionary == undefined) return;
    if (this.mesh.morphTargetDictionary.hasOwnProperty(name)) {
      this.mesh.morphTargetDictionary[name] = amount;
    }
  }
}

export default MeshObject;