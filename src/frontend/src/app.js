
import { createCamera } from './components/camera.js';
import { createOrbitControls } from './components/orbitcontrol.js';
import { BVHPlayer } from './motionplayer/bvhPlayer.js';
import { createTorus } from './components/torus.js';
import { createScene } from './components/scene.js';
import { createRenderer } from './system/renderer.js';
import { Resizer } from './system/resizer.js';
import { Loop } from './system/loop.js';

let camera;
let renderer;
let scene;
let loop;

class App
{
  constructor(container)
  {
    camera = createCamera();
    renderer = createRenderer();
    scene = createScene();
    loop = new Loop(camera, scene, renderer);
    container.append(renderer.domElement);

    const torus = createTorus();
    const orbitControls = createOrbitControls(camera, renderer);

    loop.updatables.push(torus);
    loop.updatables.push(orbitControls);
    
    const bvhPlayer = new BVHPlayer(scene);
    bvhPlayer.loadBVH('http://127.0.0.1:8000/data/bvh/test.bvh');
    scene.add(torus);

    // TODO: implement resizer
    const resizer = new Resizer(container, camera, renderer);

  }

  // use start and stop for animation and frame stream
  start()
  {
    loop.start();
  }
  
  stop()
  {
    loop.stop();
  }
}

export { App };