import * as THREE from 'three';

class GruhCamera {

  camera: THREE.PerspectiveCamera;
  mouseControl: boolean;

  targetRotationAmount: THREE.Vector3 = new THREE.Vector3(0, 0, 0); // Numbers between -1 and 1
  private currentRotation: THREE.Quaternion = new THREE.Quaternion();

  constructor(scene, mouseControl = false) {
    // Set some camera attributes.
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    // Perspective Camera
    const VIEW_ANGLE = 1;
    const ASPECT = WIDTH / HEIGHT;

    // Both
    const NEAR = 10;
    const FAR = 10000;

    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      ASPECT,
      NEAR,
      FAR
    );

    // Add camera to scene
    camera.position.set(0, 100, 1700);
    scene.add(camera);

    this.camera = camera;
    this.mouseControl = mouseControl;

    window.addEventListener('mousemove', (e) => {
      if (!this.mouseControl) return;
      this.targetRotationAmount = new THREE.Vector3(
        (-e.clientX / window.innerWidth) + 0.5,
        (e.clientY / window.innerHeight) - 0.5,
        0
      );
    });

    window.addEventListener('resize', (e) => {
      this.resize();
    });
  }

  resize() {
    // Lookup the size the browser is displaying the canvas.
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  updatePosition(deltaTime: number) {
    let targetRot = new THREE.Quaternion();
    targetRot.setFromEuler( new THREE.Euler(
      0,
      (this.targetRotationAmount.x) - Math.PI/2,
      ((this.targetRotationAmount.y) * 0.4) // Max of 0.4
    ));
    this.currentRotation.slerp(targetRot, Math.min(1, deltaTime * 0.005));


    let newPosition = new THREE.Vector3(1700, 0, 0);
    newPosition.applyQuaternion(this.currentRotation);

    this.camera.position.copy(newPosition);

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }
}

export default GruhCamera;
