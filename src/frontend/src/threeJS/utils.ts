import * as THREE from 'three';
import { Loop } from '@/threeJS/system/loop';

/**
 * Stateless diagnostics and scene-inspection helpers for the Three.js layer.
 *
 * Keep helpers here only when they do not own resources or application state and are
 * useful across multiple engine modules. Format-specific behavior belongs in its loader
 * or player, and production orchestration belongs in `ThreeJSEngine`.
 */
export default class Utils {
  static is_in_scene(obj: THREE.Object3D | null | undefined, scene: THREE.Scene | null | undefined): boolean {
    if (!obj || !scene) return false;

    let node: THREE.Object3D | null | undefined = obj;
    while (node) {
      if (node === scene) return true;
      node = node.parent;
    }
    return false;
  }

  static is_in_scene_by_UUID(obj: THREE.Object3D | null | undefined, scene: THREE.Scene | null | undefined) {
    return !!obj && !!scene && !!scene.getObjectByProperty('uuid', obj.uuid);
  }

  static log_camera_position(camera: THREE.Camera | null | undefined, label = 'Camera') {
    if (!camera || !camera.position) return;

    const { x, y, z } = camera.position;
    console.log(`${label} position → x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}`);
    console.log(
      `${label} rotation → x: ${camera.rotation.x.toFixed(2)}, y: ${camera.rotation.y.toFixed(
        2,
      )}, z: ${camera.rotation.z.toFixed(2)}`,
    );
  }

  static print_scene_components(scene: THREE.Scene, loop: Loop, camera: THREE.Camera) {
    if (!scene || !loop || !camera) {
      console.log('Scene, loop, or camera is not ready.');
      return;
    }

    scene.children.forEach((element: any) => {
      console.log(`Object type: ${element.type} | Name: ${element.name}`);
    });

    console.log('loop.updatables.length ', loop.updatables.length);
    loop.updatables.forEach((element, idx) => {
      if (!element) {
        console.log(`Empty updatable at index ${idx}:`, element);
      }
    });
    console.log('loop.updatables ', loop.updatables);
    Utils.log_camera_position(camera);
    console.log('=================================================');
  }
}
