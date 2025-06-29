import * as THREE from 'three';
import { BVHLoader } from '../../node_modules/three/examples/jsm/loaders/BVHLoader.js';

export class BVH_loader 
{
  constructor(scene) 
  {
    this.bvh_loader = new BVHLoader();
    this.bvh_motion = new THREE.Group();
    this.skeletonHelper = null;
    this.clipAction = null;
    this.frameCount = 0;
    this.frameTime = 0;
    this.duration = 0;
    this.mixer = null;
    this.fps = 0;
    this.scene = scene;
  }


  async load_bvh_motion(fileUrl)
  {
    const result = await this.bvh_loader.loadAsync(fileUrl);

    const track          = result.clip.tracks[0];
    this.frameCount      = track.times.length;
    this.frameTime       = track.times[1] - track.times[0];
    this.duration        = this.frameCount * this.frameTime;
    this.fps             = (1 / this.frameTime).toFixed(2);

    this.skeletonHelper = new THREE.SkeletonHelper(result.skeleton.bones[0]);
    this.bvh_motion.add(result.skeleton.bones[0]);
    this.bvh_motion.add(this.skeletonHelper);

    this.mixer = new THREE.AnimationMixer(result.skeleton.bones[0]);
    this.clipAction = this.mixer.clipAction(result.clip);
    this.scene.add(this.bvh_motion);
  }

  dispose() 
  {
    if (!this.bvh_motion) return;

    if (this.mixer) 
    {
      this.mixer.stopAllAction(); 
      this.mixer = null;
    }

    // free gpu‑ressources
    this.bvh_motion.traverse(obj => 
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

    this.bvh_motion.clear();
    this.scene.remove(this.bvh_motion);
    this.clipAction = null;
    this.bvh_motion = null;
    this.skeletonHelper = null;
  }

}



