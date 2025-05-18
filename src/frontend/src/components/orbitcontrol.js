import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';


function createOrbitControls(camera, renderer)
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