import { PerspectiveCamera } from 'three';

function createCamera() {
  
  const camera = new PerspectiveCamera(
    75,                                       // fov = Field Of View
    window.innerWidth / window.innerHeight,   // aspect ratio (dummy value)
    0.1,                                      // near clipping plane
    5000,                                     // far clipping plane
  );

  // move the camera back so we can view the scene
  // camera.position.set(0, 80, 260);
  // camera.rotation.set(-Math.PI / 4, 0, 0);
  
  // camera.position.set( -156.66,  52.09, -119.37);
  // camera.rotation.set(-1.48, -1.48, -1.48);

  camera.position.set(200,0,0);
  camera.rotation.set(0, 0, 0);

  return camera;
}

export { createCamera };