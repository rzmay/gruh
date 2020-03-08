import * as THREE from 'three';

class GruhCamera {

  camera: THREE.PerspectiveCamera;
  mouseControl: boolean;

  backLight: THREE.SpotLight;

  targetRotationAmount: THREE.Vector3 = new THREE.Vector3(0, 0, 0); // Numbers between -1 and 1
  private _currentRotation: THREE.Quaternion = new THREE.Quaternion();

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
    camera.position.set(0, 10, 170);
    scene.add(camera);

    this.camera = camera;
    this.mouseControl = mouseControl;

    // Add back light (dependent on camera)
    this.backLight = new THREE.SpotLight(0xc0c0c0, 0.7);
    scene.add(this.backLight);

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
      (this.targetRotationAmount.x) * (Math.PI / 3) - Math.PI/2, // Max of pi/3
      ((this.targetRotationAmount.y) * (Math.PI / 12)) // Max of pi/12
    ));
    this._currentRotation.slerp(targetRot, Math.min(1, deltaTime * 0.005));


    let newPosition = new THREE.Vector3(170, 0, 0);
    newPosition.applyQuaternion(this._currentRotation);

    this.camera.position.copy(newPosition);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    let backLightPosition = new THREE.Vector3(-170, 0, 0);
    backLightPosition.applyQuaternion(this._currentRotation);

    this.backLight.position.copy(backLightPosition);
    this.backLight.lookAt(new THREE.Vector3(0, 0, 0));
  }
}

export default GruhCamera;
