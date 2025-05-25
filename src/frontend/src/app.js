
import { createCamera } from './components/camera.js';
import { createOrbitControls } from './components/orbitcontrol.js';
import { BVHPlayer } from './motionplayer/bvhPlayer.js';
import { FBXPlayer } from './motionplayer/fbxPlayer.js';
import { createScene } from './components/scene.js';
import { createRenderer } from './system/renderer.js';
import { Resizer } from './system/resizer.js';
import { Loop } from './system/loop.js';
import { Timeline } from './components/timeline.js';

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

    const orbitControls = createOrbitControls(camera, renderer);
    loop.updatables.push(orbitControls);

        
    this.bvhPlayer = new BVHPlayer();
    this.fbxPlayer = new FBXPlayer();
    const resizer = new Resizer(container, camera, renderer);

  }

  // use start and stop for animation and frame stream
  async start()
  {



    // await this.bvhPlayer.load('http://127.0.0.1:8000/data/bvh/test.bvh')
    // scene.add(this.bvhPlayer.bvhObject);
    // loop.updatables.push(this.bvhPlayer.bvhObject);

    // window.addEventListener('keydown', (e) => {
    //   if (e.code === 'Space') this.bvhPlayer.play();
    //   if (e.code === 'KeyS') this.bvhPlayer.stop();
    //   if (e.code === 'KeyP') this.bvhPlayer.pause();
    //   if (e.code === 'KeyR') this.bvhPlayer.reset();
    // });


    await this.fbxPlayer.loadFBX('http://127.0.0.1:8000/data/fbx/test.fbx');
    scene.add(this.fbxPlayer.fbxObject);
    loop.updatables.push(this.fbxPlayer.fbxObject);
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') this.fbxPlayer.play();
      if (e.code === 'KeyD') this.fbxPlayer.stop();
      if (e.code === 'KeyA') this.fbxPlayer.pause();
      if (e.code === 'KeyR') this.fbxPlayer.reset();
    });

    const timeline = new Timeline(this.fbxPlayer);
    loop.updatables.push(timeline.timelineObject);
    loop.start();
  }
  
  stop()
  {
    loop.stop();
  }
}

export { App };