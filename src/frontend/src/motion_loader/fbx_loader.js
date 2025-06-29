import * as THREE from 'three';
import { FBXLoader } from '../../node_modules/three/examples/jsm/loaders/FBXLoader.js';

export class FBX_Loader 
{
  constructor(scene) 
  {
    this.fbx_loader = new FBXLoader();
    this.fbx_motion = new THREE.Group();
    this.mixer = null;
    this.clipAction = null;
    this.skeletonHelper = null;
    // in fbx there are no frames. fbx uses keyframes, 
    // so frameTime is not necessarily constant.
    this.keyframeCount = 0;
    this.duration = 0;
    this.scene = scene;

  }

  async load_fbx_animation(fileUrl) 
  {    
    const result = await this.fbx_loader.loadAsync(fileUrl);
    this.fbx_motion.add(result);
    this.mixer = new THREE.AnimationMixer(result);
    this.clipAction = this.mixer.clipAction(result.animations[0]);
    this.duration = this.clipAction.getClip().duration;
    const track = this.clipAction.getClip().tracks[0];
    this.keyframeCount = track.times.length;

    this.skeletonHelper = new THREE.SkeletonHelper(result);
    this.fbx_motion.add(this.skeletonHelper);
    this.scene.add(this.fbx_motion);

  }

  async loadFBXModel(url) 
  {
    return new Promise((resolve, reject) => 
    {
      this.fbx_loader.load(url, (result) => 
      {
        this.fbx_motion.add(result);
        // terminate Promise and return this.fbxObject
        resolve(this.fbx_motion);
      }, undefined, (error) => reject(error));
    });
  }

  dispose() 
  {
    if (!this.fbx_motion) return;
    if (this.mixer) 
    {
      this.mixer.stopAllAction(); 
      this.mixer = null;
    }

    // free gpu‑ressources
    this.fbx_motion.traverse(obj => 
    {
      if (obj.isMesh) 
      {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) 
        {
          obj.material.forEach(m => m.dispose());
        } 
        else
        {
          obj.material.dispose();
        }
      }
    });

    this.fbx_motion.clear();
    this.scene.remove(this.fbx_motion);
    this.clipAction = null;
    this.fbx_motion = null;
    this.skeletonHelper = null;
  }

}
