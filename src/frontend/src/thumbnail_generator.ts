import * as THREE from 'three';
import { Loop } from '@/system/loop';
import { NPY_Player } from '@/motion_player/npy_player';

export class ThumbnailGenerator
{
    scene: THREE.Scene;
    camera: THREE.Camera;
    npy_loader_object: any;
    loop: Loop;

    constructor(scene: THREE.Scene, camera: THREE.Camera, npy_loader_object: any, loop: Loop)
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
      const thumbnailRenderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,          // important for toBlob()
        alpha: false,
      });

      thumbnailRenderer.setSize(640, 480);         // thumbnail‑size 
      thumbnailRenderer.domElement.style.display = 'none';  // invisible
      document.body.appendChild(thumbnailRenderer.domElement);
    
      await generateThumbnails(thumbnailRenderer, this.scene, this.camera, player, 1);
    }

} 



async function generateThumbnails( renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, player: NPY_Player, every: number = 5) 
{
  // we add one cause slider starts from 0 and this avoid index error when we load preview images 
  const total = player.frameCount + 1;

  for (let frameIndex = 0; frameIndex < total; frameIndex += every) 
  {
    player.gotoFrame(frameIndex);             // set pose to frame
    renderer.render(scene, camera);           // off‑screen rendern

    const blob = await new Promise<Blob>((resolve, reject) => {
      renderer.domElement.toBlob(resultBlob => {
        if (resultBlob) resolve(resultBlob);
        else reject(new Error('toBlob() returned null'));
      }, 'image/jpeg', 0.8);
    });

    // send to FastAPI backend and add file name to header
    await fetch('http://localhost:8000/motion/thumbnails', 
    {
      method: 'POST',
      headers: { 'X-File-Name': `frame_${frameIndex.toString().padStart(4, '0')}.jpg` },
      body: blob,
    });
  }
}
