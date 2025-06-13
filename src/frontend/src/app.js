
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
    // await this.bvhPlayer.load('http://127.0.0.1:8000/data/bvh/Combo_Punch.bvh')
    // scene.add(this.bvhPlayer.bvhObject);
    
    // const timeline = new Timeline(this.bvhPlayer);
    // loop.updatables.push(timeline.timelineObject);
    
    
    // ==============================================================================================
    
    // await this.fbxPlayer.loadFBX('http://127.0.0.1:8000/data/fbx/test_2.fbx');
    // scene.add(this.fbxPlayer.fbxObject);
    
    // const timelineFBX = new TimelineFBX(this.fbxPlayer);
    // loop.updatables.push(timelineFBX.fbxTimelineObject);
    
    // ==============================================================================================
    
    await this.numpyPlayer.load('//127.0.0.1:8000/data/numpy_groundtruth/test.npy');
    scene.add(this.numpyPlayer.npyObject);

    this.numpyPlayer.createSpheres();
    this.numpyPlayer.parseHierarchyFileBVH("//127.0.0.1:8000/data/json/test_skeleton_groundtruth.json");
    
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

  upload_files()
  {
    document.getElementById("client_uploads_btn").addEventListener("click", async () => 
    {
      const input = document.getElementById("upload_files");
      const status = document.getElementById("client_uploads_status");
      const files = input.files;
      if (files.length === 0) 
      {
        alert("❌ Please choose one or more motion capture files.");
        return;
      }

      const formData = new FormData();
      for (const file of files) 
      {
        formData.append("files", file);
      }
      
      try 
      {
      const serverResponse = await fetch("http://localhost:8000/motion/uploads", {
        method: "POST",
        body: formData,
      });

      
      if (!serverResponse.ok) 
        {
          throw new Error(`${serverResponse.statusText}` || "unknown error");
        }
        
        const apiResponse = await serverResponse.json();
        status.textContent = `✅ ${apiResponse.message} ❌ ${apiResponse.not_supported_files}`;
      } 
      catch (error) 
      {
        status.textContent = `❌ error: ${error.message}`;
      }

    });
  }

  process_bvh_files() 
  {
    document.getElementById("process_bvh_files_btn").addEventListener("click", async () => 
    {
      const status = document.getElementById("process_bvh_files_status");
      try 
      {
        const serverResponse = await fetch("http://localhost:8000/motion/process_bvh_files", {
          method: "POST"
        });

        if (!serverResponse.ok) 
        {
          throw new Error(`${serverResponse.statusText}` || "unknown error");
        }
        
        const apiResponse = await serverResponse.json();
        status.textContent = `✅ ${apiResponse.message}!`;

      }
      catch (error) 
      {
        status.textContent = `❌${error.message}`;
      }

    });
  }

  process_csv_files()
  {
    document.getElementById("process_csv_files_btn").addEventListener("click", async () => 
    {
      const status = document.getElementById("process_csv_files_status");

      try 
      {
        const serverResponse = await fetch("http://localhost:8000/motion/process_csv_files", {
          method: "POST"
        });

        if (!serverResponse.ok) 
        {
          throw new Error(`${serverResponse.statusText}` || "unknown error");
        }
        
        const apiResponse = await serverResponse.json();
        status.textContent = `✅ ${apiResponse.message}!`;

      }
      catch (error) 
      {
        status.textContent = `❌${error.message}`;
      }

    });
  }
}


export { App };