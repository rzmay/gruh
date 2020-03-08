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

  private _startTime: number = 0;
  private _deltaTime: number = 0;
  private _lastFrameTime: number = 0;

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

    // Instantiate camera
    this.camera = new GruhCamera(this.scene);
    this.camera.targetRotationAmount = new Vector3(0.4, 0.2, 0);

    // Instantiate Gruh
    this.gruh = new Gruh(this.scene);

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
    this._startTime = new Date().getTime();
    this._lastFrameTime = this._startTime;
    this._deltaTime = 0;
    window.requestAnimationFrame(() => { this.update(); })
  }

  update() {
    // Calculate _deltaTime
    this._deltaTime = new Date().getTime() - this._lastFrameTime;
    this._lastFrameTime = new Date().getTime();

    // Update camera
    this.camera.updatePosition(this._deltaTime);

    // Update gruh
    this.gruh.setBreathe((1 + Math.sin(new Date().getTime() / 2000)) / 2);
    this.gruh.lookAt(this.camera.camera.position);

    // Render
    this.renderer.render(this.scene, this.camera.camera);

    window.requestAnimationFrame(() => { this.update() })
  }
}

export default GruhScene;
