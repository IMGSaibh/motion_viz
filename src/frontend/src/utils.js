export default class Utils 
{
  static is_in_scene(obj, scene) 
  {
    if (!obj || !scene) return false;

    let node = obj;
    while (node) 
    {
      if (node === scene) return true;
      node = node.parent;
    }
    return false;
  }
  
  static is_in_scene_by_UUID(obj, scene) 
  {
    return !!obj && !!scene && !!scene.getObjectByProperty('uuid', obj.uuid);
  }

  static log_camera_position(camera, label = 'Camera') 
  {
    if (!camera || !camera.position) return;

    const { x, y, z } = camera.position;
    console.log(`${label} position → x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}`);
    console.log(`${label} rotation → x: ${camera.rotation.x.toFixed(2)}, y: ${camera.rotation.y.toFixed(2)}, z: ${camera.rotation.z.toFixed(2)}`);
  }
}