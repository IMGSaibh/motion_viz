import * as THREE from 'three';
import { Timeline } from '../components/timeline.js';
import { FBXLoader } from '../../node_modules/three/examples/jsm/loaders/FBXLoader.js';

export class FBXPlayer 
{
  constructor() 
  {
    this.loader = new FBXLoader();
    this.fbxObject = new THREE.Group();
    this.mixer = null;
    this.clipAction = null;
    this.skeletonHelper = null;
    this.isPlaying = false;
    // in fbx there are no frames. fbx uses keyframes, so frameTime is not necessarily constant.
    this.frameCount = 0;
    this.frameTime = 0;
    this.duration = 0;
    this.fps = 0;

    this.fbxObject.tick = (delta) => 
    {
      if (this.mixer && this.isPlaying) this.mixer.update(delta);
    };
  }

  async loadFBX(url) 
  {
    return new Promise((resolve, reject) => 
    {
      this.loader.load(url, (result) => 
      {
        this.fbxObject.add(result);


        this.mixer = new THREE.AnimationMixer(result);
        this.clipAction = this.mixer.clipAction(result.animations[0]);
        this.duration = this.clipAction.getClip().duration;


        const track = this.clipAction.getClip().tracks[0];
        this.frameCount = track.times.length;
        
        // Keyframes can be irregularly distributed, so frameTime is not necessarily constant.
        this.frameTime = track.times[1] - track.times[0];

        if (track.times.length >= 2) 
        {
          this.fps = (1 / this.frameTime).toFixed(2);
        } 
        else 
        {
          console.log('Nicht genug Keyframes zum Berechnen der FPS.');
        }

        // show skeleton
        this.skeletonHelper = new THREE.SkeletonHelper(result);
        this.fbxObject.add(this.skeletonHelper);

        // terminate Promise and return this.fbxObject
        resolve(this.fbxObject);
      }, undefined, (error) => reject(error));
    });
  }
}
