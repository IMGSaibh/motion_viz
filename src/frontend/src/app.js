
import { createCamera } from './components/camera.js';
import { createOrbitControls } from './components/orbitcontrol.js';
import { BVHPlayer } from './motionplayer/bvhPlayer.js';
import { FBXPlayer } from './motionplayer/fbxPlayer.js';
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

    
    // loop.updatables.push(torus);
    loop.updatables.push(orbitControls);
    
    // const bvhPlayer = new BVHPlayer();
    // bvhPlayer.load('http://127.0.0.1:8000/data/bvh/test.bvh').then((object3D) => {
    //   scene.add(object3D);
    //   loop.updatables.push(object3D);

    //   window.addEventListener('keydown', (e) => {
    //     if (e.code === 'Space') {
    //       bvhPlayer.play();
    //     }
    //   });

    //   window.addEventListener('keydown', (e) => {
    //     if (e.code === 'S') {
    //       bvhPlayer.stop();
    //       console.log('stop');
    //     }
    //   });

    //   window.addEventListener('keydown', (e) => {
    //     if (e.code === 'R') {
    //       bvhPlayer.reset();
    //     }
    //   });
    // });

  // Szene & Loop Setup
  const fbxPlayer = new FBXPlayer(scene);
  fbxPlayer.loadFBX('http://127.0.0.1:8000/data/fbx/test.fbx').then((fbxObject) => {
    // in Scene einfügen
    scene.add(fbxObject);
  
    // Tick in Loop verwenden
    loop.updatables.push(fbxObject);
  
    // Tasteneingaben
    window.addEventListener('keydown', (e) => {
      if (e.key === 'p') fbxPlayer.play();
      if (e.key === 's') fbxPlayer.stop();
      if (e.key === 'r') fbxPlayer.reset();
    });


  });





    // scene.add(torus);

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