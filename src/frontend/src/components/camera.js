import { PerspectiveCamera } from 'three';

function createCamera() {
  
  const camera = new PerspectiveCamera(
    75,                                       // fov = Field Of View
    window.innerWidth / window.innerHeight,   // aspect ratio (dummy value)
    0.1,                                      // near clipping plane
    5000,                                     // far clipping plane
  );

  camera.position.set(200, 0, 0);
  camera.rotation.set(0, 0, 0);

  return camera;
}

export { createCamera };