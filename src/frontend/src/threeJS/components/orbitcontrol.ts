import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PerspectiveCamera, WebGLRenderer } from 'three';


declare module 'three/examples/jsm/controls/OrbitControls.js' {
  interface OrbitControls {
    /**
     * Called once per frame by the main loop.
     */
    tick(delta: number): void
  }
}

function createOrbitControls(camera: PerspectiveCamera, renderer: WebGLRenderer)
{
    const controls = new OrbitControls( camera, renderer.domElement );

    // this method will be called once per frame
    controls.tick = (delta) => 
    {
        controls.update();
    };

    return controls;
}

export { createOrbitControls };
