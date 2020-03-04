import * as THREE from 'three';

interface Modifier {
  modify: (geometry: THREE.Geometry) => THREE.Geometry;
}

interface ObjectSource {
  object: THREE.Object3D;
}

class ModifierStack implements ObjectSource {

  modifier: Modifier;
  objectSource: ObjectSource;

  mesh: THREE.Mesh = new THREE.Mesh();
  object: THREE.Object3D = new THREE.Object3D();

  constructor(objectSource: ObjectSource, modifier: Modifier) {
    this.modifier = modifier;
    this.objectSource = objectSource;
    this.object.copy(objectSource.object);

    this.objectSource.object.visible = false;
  }

  addToScene(scene: THREE.Scene) {
    console.log('Added to scene');
    scene.add(this.object);
  }

  update() {
    // Update stack
    if (this.objectSource instanceof ModifierStack) this.objectSource.update();
    this.applyModifier();
  }

  async applyModifier() {
    // Get mesh
    this.object.copy(this.objectSource.object);
    this.object.visible = true;

    this.object.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        // If mesh not already found, set mesh & deform
        this.mesh = this.mesh || node as THREE.Mesh;
      }
    });

    var geometry = this.mesh.geometry;
    if (geometry instanceof THREE.BufferGeometry) geometry = new THREE.Geometry().fromBufferGeometry(geometry);

    var modifiedGeometry = this.modifier.modify(geometry);

    if (this.mesh.geometry != undefined) this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.BufferGeometry().fromGeometry(modifiedGeometry);
  }
}

// @ts-ignore
export { ObjectSource, Modifier, ModifierStack };
