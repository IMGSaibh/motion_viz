import * as THREE from 'three';
import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader.js';

export class BVHPlayer {
  constructor() {
    this.loader = new BVHLoader();

    this.mixer = null;
    this.clipAction = null;
    this.skeletonHelper = null;

    this.object3D = new THREE.Group(); // <--- Das ist dein Objekt mit .tick()

    // tick als Methode definieren, du kannst es später auch überschreiben
    this.object3D.tick = (delta) => {
      if (this.mixer) this.mixer.update(delta);
    };
  }

  async load(url) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (result) => {
          const { skeleton, clip } = result;

          const rootBone = skeleton.bones[0];

          // Setup SkeletonHelper
          this.skeletonHelper = new THREE.SkeletonHelper(rootBone);
          this.skeletonHelper.skeleton = skeleton;

          // Animation
          this.mixer = new THREE.AnimationMixer(rootBone);
          this.clipAction = this.mixer.clipAction(clip);
          this.clipAction.loop = THREE.LoopOnce;
          this.clipAction.clampWhenFinished = true;

          // Add to main object3D
          this.object3D.add(rootBone);
          this.object3D.add(this.skeletonHelper);

          // Optional: Reset on finish
          this.mixer.addEventListener('finished', () => {
            this.reset();
          });

          resolve(this.object3D);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  play() {
    if (this.clipAction) {
      this.reset();
      this.clipAction.play();
    }
  }

  reset() {
    if (this.clipAction) {
      this.clipAction.stop();
      this.clipAction.reset();
    }
  }
}



