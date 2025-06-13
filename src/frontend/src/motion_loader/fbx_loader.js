import * as THREE from 'three';
import { FBXLoader } from '../../node_modules/three/examples/jsm/loaders/FBXLoader.js';

export class FBX_Loader 
{
  constructor() 
  {
    this.loader = new FBXLoader();
    this.fbx_object = new THREE.Group();
    this.mixer = null;
    this.clipAction = null;
    this.skeletonHelper = null;
    // in fbx there are no frames. fbx uses keyframes, 
    // so frameTime is not necessarily constant.
    this.keyframeCount = 0;
    this.duration = 0;
  }

  async loadFBX(url) 
  {
    return new Promise((resolve, reject) => 
    {
      this.loader.load(url, (result) => 
      {
        this.fbx_object.add(result);


        this.mixer = new THREE.AnimationMixer(result);
        this.clipAction = this.mixer.clipAction(result.animations[0]);
        this.duration = this.clipAction.getClip().duration;
        const track = this.clipAction.getClip().tracks[0];
        this.keyframeCount = track.times.length;

        this.skeletonHelper = new THREE.SkeletonHelper(result);
        this.fbx_object.add(this.skeletonHelper);

        // terminate Promise and return this.fbxObject
        resolve(this.fbx_object);
      }, undefined, (error) => reject(error));
    });
  }
}
