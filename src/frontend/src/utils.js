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
}