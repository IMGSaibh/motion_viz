import * as THREE from 'three';
import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader.js';

export class BVHPlayer {
  constructor(scene) {
    this.scene = scene;
    this.loader = new BVHLoader();
    this.mixer = null;
    this.skeletonHelper = null;
    this.boneContainer = new THREE.Group();

    this.scene.add(this.boneContainer);
  }

  loadBVH(url) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (result) => {
          const { skeleton, clip } = result;

          // Skelett als Helper anzeigen
          this.skeletonHelper = new THREE.SkeletonHelper(skeleton.bones[0]);
          this.skeletonHelper.skeleton = skeleton;

          this.boneContainer.add(skeleton.bones[0]);
          this.scene.add(this.skeletonHelper);

          // Animation einrichten
          this.mixer = new THREE.AnimationMixer(skeleton.bones[0]);
          this.mixer.clipAction(clip).play();

          // this method will be called once per frame
          this.mixer.tick = (delta) => {    
            if (this.mixer) { this.mixer.update(delta); }
          };

          resolve();
        },
        undefined,
        (error) => reject(error)
      );
    });
  }
}


