import * as THREE from 'three';
import { NPY_Player } from './motion_player/npy_player.js';

export class ThumbnailGenerator
{
    constructor(scene, camera, npy_loader_object, loop)
    {
        this.scene = scene;
        this.camera = camera;
        this.npy_loader_object = npy_loader_object;
        this.loop = loop;
    }

    async loadAndPrepare() 
    {
 
      const player = new NPY_Player(this.npy_loader_object, this.loop);
      player.play_pause();     

      // hidden mini‑renderer for thumbnails
      const thumbRenderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,          // important for toBlob()
        alpha: false,
      });

      thumbRenderer.setSize(640, 480);         // thumbnail‑size 
      thumbRenderer.domElement.style.display = 'none';  // invisible
      document.body.appendChild(thumbRenderer.domElement);
    
      await generateThumbnails({
        renderer: thumbRenderer,
        scene : this.scene,
        camera : this.camera,
        player: player,
        every: 1,              // save every 5th frame
      });
    }

} 



async function generateThumbnails({ renderer, scene, camera, player, every }) 
{
  // we add one cause slider starts from 0 and this avoid index error when we load preview images 
  const total = player.frameCount + 1;

  for (let frameIndex = 0; frameIndex < total; frameIndex += every) 
  {
    player.gotoFrame(frameIndex);             // set pose to frame
    renderer.render(scene, camera);           // off‑screen rendern

    const blob = await new Promise(res =>
      renderer.domElement.toBlob(res, 'image/jpeg', 0.8)
    );

    // send to FastAPI backend and add file name to header
    await fetch('http://localhost:8000/motion/thumbnails', 
    {
      method: 'POST',
      headers: { 'X-File-Name': `frame_${frameIndex.toString().padStart(4, '0')}.jpg` },
      body: blob,
    });
  }
}
