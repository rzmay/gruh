import React from 'react';
import * as THREE from 'three';
import GruhCamera from './GruhCamera';
import Gruh from './Gruh';
import clamp = THREE.MathUtils.clamp;

interface GruhSceneOptions {
  maxBlinkOffset: number | undefined;
  minBlinkInterval: number | undefined;
  maxBlinkInterval: number | undefined;
  blinkLength: number | undefined;

  breathLength: number | undefined;
}

class GruhScene {

  container: React.RefObject<HTMLDivElement>;
  domElement: HTMLCanvasElement | undefined;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: GruhCamera;
  gruh: Gruh;

  private _time: number = 0;
  private _startTime: number = 0;
  private _deltaTime: number = 0;
  private _lastFrameTime: number = 0;

  private _lastBlink: number = 0;
  private _minBlinkInterval: number = 7.5;
  private _maxBlinkInterval: number = 12.5;
  private _blinkOffset: number = 0;
  private _maxBlinkOffset: number = 0.2;
  private _blinkLength: number = 0.25;

  private _breathLength: number = 2;

  constructor(
    container: React.RefObject<HTMLDivElement>,
    color: THREE.Color = new THREE.Color(0x202020),
    options: GruhSceneOptions | undefined
  ) {
    this.container = container;

    // Set up options
    if (options != undefined) {
      this._breathLength = options.breathLength ?? this._breathLength;
      this._minBlinkInterval = options.minBlinkInterval ?? this._minBlinkInterval;
      this._maxBlinkInterval = options.maxBlinkInterval ?? this._maxBlinkInterval;
      this._maxBlinkInterval = options.maxBlinkOffset ?? this._maxBlinkOffset;
      this._blinkLength = options.blinkLength ?? this._blinkLength;
    }

    // Instantiate renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Instantiate scene
    this.scene = new THREE.Scene();
    this.scene.background = color;

    // Instantiate camera
    this.camera = new GruhCamera(this.scene);
    this.camera.targetRotationAmount = new THREE.Vector3(0.4, 0.2, 0);

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
    this._time = new Date().getTime();

    // Calculate _deltaTime
    this._deltaTime = this._time - this._lastFrameTime;
    this._lastFrameTime = this._time;

    // Update camera
    this.camera.updatePosition(this._deltaTime);

    // Update gruh
    this.gruh.setBreathe((1 + Math.sin(this._time / (1000 * this._breathLength))) * 0.65);
    this.gruh.lookAt(this.camera.camera.position);

    this._tryBlink();
    this.gruh.setBlink(this._calculateBlink(0), this._calculateBlink(this._blinkOffset));

    // Render
    this.renderer.render(this.scene, this.camera.camera);

    window.requestAnimationFrame(() => { this.update() })
  }

  _tryBlink() {
    let timeSinceLastBlink = (this._time - this._lastBlink) / 1000;
    let doBlink = (timeSinceLastBlink > this._maxBlinkInterval) ||
        ((timeSinceLastBlink > this._minBlinkInterval) && (Math.random() < 0.05));

    if (doBlink) {
      this._lastBlink = this._time;
      this._blinkOffset = (Math.random() * 2 - 1) * this._maxBlinkOffset;
    }
  }

  _calculateBlink(offset: number) {
    let timeSinceLastBlink = (this._time - this._lastBlink) / 1000 + offset;
    let blinkAmount = (-1 / Math.pow(this._blinkLength, 2)) *
        Math.pow(timeSinceLastBlink - this._blinkLength - offset, 2) +
        1;

    return clamp(blinkAmount, 0, 1);
  }
}

export default GruhScene;
