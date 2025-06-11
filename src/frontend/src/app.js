
import { createCamera } from './components/camera.js';
import { createOrbitControls } from './components/orbitcontrol.js';
import { BVHPlayer } from './motionplayer/bvhPlayer.js';
import { FBXPlayer } from './motionplayer/fbxPlayer.js';
import { NumpyPlayer } from './motionplayer/numpyPlayer.js';
import { createScene } from './components/scene.js';
import { createRenderer } from './system/renderer.js';
import { Resizer } from './system/resizer.js';
import { Loop } from './system/loop.js';
import { Timeline } from './components/timeline.js';
import { NumpyTimeline } from './components/timelineNumpy.js';
import { TimelineFBX } from './components/timelineFBX.js';

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
    this.numpyPlayer = new NumpyPlayer();
    const resizer = new Resizer(container, camera, renderer);

  }

  async initialize()
  {
    await this.bvhPlayer.load('http://127.0.0.1:8000/data/bvh/Combo_Punch.bvh')
    scene.add(this.bvhPlayer.bvhObject);
    
    const timeline = new Timeline(this.bvhPlayer);
    loop.updatables.push(timeline.timelineObject);
    
    
    // ==============================================================================================
    
    // await this.fbxPlayer.loadFBX('http://127.0.0.1:8000/data/fbx/test_2.fbx');
    // scene.add(this.fbxPlayer.fbxObject);
    
    // const timelineFBX = new TimelineFBX(this.fbxPlayer);
    // loop.updatables.push(timelineFBX.fbxTimelineObject);
    
    // ==============================================================================================
    
    await this.numpyPlayer.load('//127.0.0.1:8000/data/numpy/Combo_Punch.npy');
    scene.add(this.numpyPlayer.npyObject);

    this.numpyPlayer.createSpheres();
    this.numpyPlayer.parserHierarchyFile("//127.0.0.1:8000/data/json/Combo_Punch_skeleton.json");
    
    const timelineNumpy = new NumpyTimeline(this.numpyPlayer);
    loop.updatables.push(timelineNumpy.npyTimelineObject);

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

  upload_file()
  { 
    document.getElementById("upload-btn").addEventListener("click", async () => 
    {
      const input = document.getElementById("bvh-upload");
      const upload_status = document.getElementById("process-status");
      const file = input.files[0];
      if (!file) 
      {
        alert("Bitte eine .bvh-Datei auswählen.");
        return;
      }
  
      const formData = new FormData();
      formData.append("file", file);
  
      try 
      {
        const response = await fetch("http://localhost:8000/motion/upload_bvh_numpy", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) 
      {
        const error = await response.json();
        throw new Error(error.detail || "Unbekannter Fehler");
      }
  
        const result = await response.json();
        upload_status.textContent =`✅ Hochgeladen & gespeichert als: ${result.filename}.npy`;
      } 
      catch (error) 
      {
        upload_status.textContent = `❌ Fehler: ${error.message}`;
      }
    });
  }

  process_csv2numpy()
  {
    document.getElementById("process-btn").addEventListener("click", async () => 
    {
      const input = document.getElementById("csv-upload");
      const upload_status = document.getElementById("upload-status");

      try 
      {
        const response = await fetch("http://localhost:8000/motion/process_csv2numpy", {
          method: "POST",
        });
  
        if (!response.ok) 
        {
          const error = await response.json();
          throw new Error(error.detail || "Unbekannter Fehler");
        }
  
        upload_status.textContent = `✅ Finshed: CSV zu Numpy konvertiert!`;
      } 
      catch (error) 
      {
        upload_status.textContent = `❌ Fehler: ${error.message}`;
      }
    });
  }

}


export { App };