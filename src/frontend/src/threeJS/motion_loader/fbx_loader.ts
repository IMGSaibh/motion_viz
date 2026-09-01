import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/**
 * Loads an FBX asset and prepares the Three.js objects required for playback.
 *
 * This loader owns the FBX scene group, animation mixer/action, skeleton helper, and
 * resources created during loading. It exposes animation metadata to `FBX_Player`, which
 * is responsible for timing, seeking, and play/pause behavior. React components should
 * access this layer through existing managers, containers, or hooks rather than handling
 * Three.js objects directly. Add FBX import, scene-setup, or resource-lifecycle behavior
 * here, and mirror new resource ownership in `dispose()`.
 */
export class FBX_Loader {
  fbx_loader: FBXLoader;
  fbx_motion: THREE.Group | null;
  mixer: THREE.AnimationMixer | null;
  clipAction: THREE.AnimationAction | null;
  skeletonHelper: THREE.SkeletonHelper | null;
  keyframeCount: number;
  duration: number;
  scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.fbx_loader = new FBXLoader();
    this.fbx_motion = new THREE.Group();
    this.fbx_motion.name = 'fbx_motion';
    this.mixer = null;
    this.clipAction = null;
    this.skeletonHelper = null;
    // in fbx there are no frames. fbx uses keyframes,
    // so frameTime is not necessarily constant.
    this.keyframeCount = 0;
    this.duration = 0;
    this.scene = scene;
  }

  async load_fbx_animation(fileUrl: string) {
    const result = await this.fbx_loader.loadAsync(fileUrl);
    if (this.fbx_motion) {
      this.fbx_motion.add(result);
      this.fbx_motion.name = fileUrl;
    }
    this.mixer = new THREE.AnimationMixer(result);
    this.clipAction = this.mixer.clipAction(result.animations[0]);
    this.duration = this.clipAction.getClip().duration;
    const track = this.clipAction.getClip().tracks[0];
    this.keyframeCount = track.times.length;

    this.skeletonHelper = new THREE.SkeletonHelper(result);
    if (this.fbx_motion) {
      this.fbx_motion.add(this.skeletonHelper);
    }
    if (this.fbx_motion) {
      this.scene.add(this.fbx_motion);
    }
  }

  async loadFBXModel(url: string) {
    return new Promise((resolve, reject) => {
      this.fbx_loader.load(
        url,
        (result) => {
          if (this.fbx_motion) {
            this.fbx_motion.add(result);
          }
          // Resolve only after the scene object and animation metadata are ready.
          resolve(this.fbx_motion);
        },
        undefined,
        (error) => reject(error),
      );
    });
  }

  dispose() {
    if (!this.fbx_motion) return;
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }

    // Release GPU resources owned by this loader.
    this.fbx_motion.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
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
