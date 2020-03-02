import React from 'react';
import * as THREE from 'three';
import GruhCamera from './GruhCamera';
import Gruh from './Gruh';
import {Vector3} from "three";

class GruhScene {

  container: React.RefObject<HTMLDivElement>;
  domElement: HTMLCanvasElement | undefined;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: GruhCamera;
  gruh: Gruh;

  private startTime: number = 0;
  private deltaTime: number = 0;
  private lastFrameTime: number = 0;

  constructor(
    container: React.RefObject<HTMLDivElement>,
    color: THREE.Color = new THREE.Color(0x202020),
  ) {
    this.container = container;

    // Instantiate renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Instantiate scene
    this.scene = new THREE.Scene();
    this.scene.background = color;

    // Instantiate Gruh
    this.gruh = new Gruh(this.scene);

    // Instantiate camera
    this.camera = new GruhCamera(this.scene);
    this.camera.targetRotationAmount = new Vector3(0.4, 0.2, 0);

    // Add lights
    const lightTransforms = [
      {x: -10, y: 50, z: 300},
      {x: 100, y: 200, z: -200},
      {x: -10, y: 10000, z: -10},
      {x: 10, y: -300, z: 50},
    ];
    for (let i = 0; i < lightTransforms.length; i++) {
      const pointLight =
        new THREE.PointLight(0x636363);

      // set its position
      pointLight.position.set(
        lightTransforms[i].x,
        lightTransforms[i].y,
        lightTransforms[i].z
      );

      // add to the scene
      this.scene.add(pointLight);
    }

    // Add resize listener
    window.addEventListener('resize', (e) => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  start() {
    // Add scene to dom
    this.domElement = this.renderer.domElement;
    this.container.current?.appendChild(this.domElement);

    // Start update loop
    this.startTime = new Date().getTime();
    this.lastFrameTime = this.startTime;
    this.deltaTime = 0;
    window.requestAnimationFrame(() => { this.update(); })
  }

  update() {
    // Calculate deltaTime
    this.deltaTime = new Date().getTime() - this.lastFrameTime;
    this.lastFrameTime = new Date().getTime();

    // Update camera and gruh
    this.camera.updatePosition(this.deltaTime);
    this.gruh.lookAt(this.camera.camera.position);

    // Render
    this.renderer.render(this.scene, this.camera.camera);

    window.requestAnimationFrame(() => { this.update() })
  }
}

export default GruhScene;
