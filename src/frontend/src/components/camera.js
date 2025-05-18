import { PerspectiveCamera } from 'three';

function createCamera() {
  
  const camera = new PerspectiveCamera(
    75,                                       // fov = Field Of View
    window.innerWidth / window.innerHeight,   // aspect ratio (dummy value)
    0.1,                                      // near clipping plane
    2000,                                     // far clipping plane
  );

  // move the camera back so we can view the scene
  camera.position.set(0, 80, 160);
  camera.rotation.set(-Math.PI / 4, 0, 0);

  return camera;
}

export { createCamera };