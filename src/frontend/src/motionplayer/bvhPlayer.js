import * as THREE from 'three';
import { BVHLoader } from '../../node_modules/three/examples/jsm/loaders/BVHLoader.js';

export class BVHPlayer 
{
  constructor() 
  {
    this.loader = new BVHLoader();
    this.bvhObject = new THREE.Group();
    this.mixer = null;
    this.clipAction = null;
    this.skeletonHelper = null;
    this.isPlaying = false;
    this.frameCount = 0;
    this.frameTime = 0;
    this.duration = 0;
    this.fps = 0;

    this.bvhObject.tick = (delta) => 
    {
      if (this.mixer && this.isPlaying) this.mixer.update(delta);
    };
  }


  async load(url)
  {
    return new Promise((resolve, reject) => 
    {
      this.loader.load(url, (result) => 
      {
        const track = result.clip.tracks[0];
        this.frameCount = track.times.length;
        this.frameTime = track.times[1] - track.times[0];
        this.duration = this.frameCount * this.frameTime;
        this.fps = (1 / this.frameTime).toFixed(2);

        this.skeletonHelper = new THREE.SkeletonHelper(result.skeleton.bones[0]);
        this.bvhObject.add(result.skeleton.bones[0]);
        this.bvhObject.add(this.skeletonHelper);

        this.mixer = new THREE.AnimationMixer(result.skeleton.bones[0]);
        this.clipAction = this.mixer.clipAction(result.clip);

        // terminate Promise and return this.bvhObject
        resolve(this.bvhObject);

      }, undefined, (error) => reject(error));
    })
  }

  play() 
  {
    this.isPlaying = true;
    if (this.clipAction) this.clipAction.play();
  }

  stop() 
  {
    if (this.clipAction) this.clipAction.stop();
  }

  reset() 
  {
    if (this.clipAction) this.clipAction.reset();
  }
  pause() 
  {
    this.isPlaying = false;
  }
}



