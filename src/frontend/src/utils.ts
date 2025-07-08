import * as THREE from 'three'

export default class Utils 
{
  static is_in_scene(obj: THREE.Object3D | null | undefined, scene: THREE.Scene | null | undefined): boolean
  {
    if (!obj || !scene) return false;

    let node: THREE.Object3D | null | undefined = obj;
    while (node) 
    {
      if (node === scene) return true;
      node = node.parent;
    }
    return false;
  }
  
  static is_in_scene_by_UUID(obj: THREE.Object3D | null | undefined, scene: THREE.Scene | null | undefined) 
  {
    return !!obj && !!scene && !!scene.getObjectByProperty('uuid', obj.uuid);
  }

  static log_camera_position(camera: THREE.Camera | null | undefined, label = 'Camera') 
  {
    if (!camera || !camera.position) return;

    const { x, y, z } = camera.position;
    console.log(`${label} position → x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}`);
    console.log(`${label} rotation → x: ${camera.rotation.x.toFixed(2)}, y: ${camera.rotation.y.toFixed(2)}, z: ${camera.rotation.z.toFixed(2)}`);
  }

  // Pro tipp
  // function getById<T extends HTMLElement>(id: string): T {
  //   const el = document.getElementById(id);
  //   if (!el) throw new Error(`Element #${id} not found`);
  //   return el as T;
  // }

  // // Nutzung
  // const input = getById<HTMLInputElement>('upload_files');
  // const status = getById<HTMLElement>('client_uploads_status');


}