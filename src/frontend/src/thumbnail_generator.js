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

    async loadAndPrepare() {
      // A · Haupt‑Player für Animation
      const mainRenderer = new THREE.WebGLRenderer({ antialias: true });
      document.body.appendChild(mainRenderer.domElement);
    
      const player = new NPY_Player(this.npy_loader_object, this.loop);
      player.play_pause();                          

      // B · Versteckte Mini‑Renderer für Thumbnails
      const thumbRenderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,          // <— wichtig für .toBlob()
        alpha: false,
      });

      thumbRenderer.setSize(640, 480);         // Thumbnail‑Größe
      thumbRenderer.domElement.style.display = 'none';  // unsichtbar
      document.body.appendChild(thumbRenderer.domElement);
    
      await generateThumbnails({
        renderer: thumbRenderer,
        scene : this.scene,
        camera : this.camera,
        player: player,
        every: 1,              // nur jeden 5. Frame speichern
      });
    }

} 



async function generateThumbnails({ renderer, scene, camera, player, every }) {
  const total = player.frameCount;

  for (let f = 0; f < total; f += every) {
    player.gotoFrame(f);             // Pose auf gewünschten Frame setzen
    renderer.render(scene, camera);  // Off‑screen rendern

    const blob = await new Promise(res =>
      renderer.domElement.toBlob(res, 'image/jpeg', 0.8)
    );

    // ➜ an FastAPI schicken; Dateiname ins Header legen
    await fetch('http://localhost:8000/motion/thumbnails', {
      method: 'POST',
      headers: { 'X-File-Name': `frame_${f.toString().padStart(4, '0')}.jpg` },
      body: blob,
    });
  }
}
