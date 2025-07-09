import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class FBX_Loader 
{
  fbx_loader: FBXLoader;
  fbx_motion: THREE.Group | null;
  mixer: THREE.AnimationMixer | null;
  clipAction: THREE.AnimationAction | null;
  skeletonHelper: THREE.SkeletonHelper | null;
  keyframeCount: number;
  duration: number;
  scene: THREE.Scene;


  constructor(scene: THREE.Scene) 
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

  async load_fbx_animation(fileUrl: string) 
  {    
    const result = await this.fbx_loader.loadAsync(fileUrl);
    if (this.fbx_motion) 
    {
      this.fbx_motion.add(result);
    }
    this.mixer = new THREE.AnimationMixer(result);
    this.clipAction = this.mixer.clipAction(result.animations[0]);
    this.duration = this.clipAction.getClip().duration;
    const track = this.clipAction.getClip().tracks[0];
    this.keyframeCount = track.times.length;

    this.skeletonHelper = new THREE.SkeletonHelper(result);
    if (this.fbx_motion) 
    {
      this.fbx_motion.add(this.skeletonHelper);
    }
    if (this.fbx_motion) 
    {
      this.scene.add(this.fbx_motion);
    }

  }

  async loadFBXModel(url: string) 
  {
    return new Promise((resolve, reject) => 
    {
      this.fbx_loader.load(url, (result) => 
      {
        if (this.fbx_motion) 
        {
          this.fbx_motion.add(result);
        }
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
      if ((obj as THREE.Mesh).isMesh) 
      {
        const mesh = obj as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) 
        {
          mesh.material.forEach(m => m.dispose());
        } 
        else
        {
          mesh.material.dispose();
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
