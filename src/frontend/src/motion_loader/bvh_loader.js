import * as THREE from 'three';
import { BVHLoader } from '../../node_modules/three/examples/jsm/loaders/BVHLoader.js';

export class BVH_loader 
{
  constructor() 
  {
    this.loader = new BVHLoader();
    this.bvh_object = new THREE.Group();
    this.skeletonHelper = null;
    this.clipAction = null;
    this.frameCount = 0;
    this.frameTime = 0;
    this.duration = 0;
    this.mixer = null;
    this.fps = 0;
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
        this.bvh_object.add(result.skeleton.bones[0]);
        this.bvh_object.add(this.skeletonHelper);

        this.mixer = new THREE.AnimationMixer(result.skeleton.bones[0]);
        this.clipAction = this.mixer.clipAction(result.clip);

        // terminate Promise and return this.bvhObject
        resolve(this.bvh_object);

      }, undefined, (error) => reject(error));
    })
  }
}



