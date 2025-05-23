import * as THREE from 'three';
import { FBXLoader } from '../../node_modules/three/examples/jsm/loaders/FBXLoader.js';

export class FBXPlayer {
  constructor(scene) {
    this.scene = scene;
    this.loader = new FBXLoader();

    this.mixer = null;
    this.model = null;
    this.duration = 0;
    this.isPlaying = false;

    this.fbxObject = new THREE.Group();
  }

  async loadFBX(url) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (object) => {
          this.model = object;
          this.fbxObject.add(object);
          this.scene.add(this.fbxObject);

          // Setup animation
          if (object.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(object);
            const action = this.mixer.clipAction(object.animations[0]);
            action.play();

            this.duration = object.animations[0].duration;
            this.isPlaying = true;
          }

          // Add tick function for animation loop
          this.fbxObject.tick = (delta) => {
            if (this.mixer && this.isPlaying) {
              this.mixer.update(delta);

              if (this.mixer.time >= this.duration) {
                this.reset();
              }
            }
          };

          resolve(this.fbxObject);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  play() {
    this.isPlaying = true;
  }

  stop() {
    this.isPlaying = false;
  }

  reset() {
    if (this.mixer) {
      this.mixer.setTime(0);
      this.isPlaying = false;
    }
  }

  getObject() {
    return this.fbxObject;
  }
}
