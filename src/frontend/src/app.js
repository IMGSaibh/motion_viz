
import { createCamera } from './components/camera.js';
import { createOrbitControls } from './components/orbitcontrol.js';
import { BVH_loader } from './motion_loader/bvh_loader.js';
import { FBX_Loader } from './motion_loader/fbx_loader.js';
import { NPY_loader } from './motion_loader/npy_loader.js';
import { createScene } from './components/scene.js';
import { createRenderer } from './system/renderer.js';
import { Resizer } from './system/resizer.js';
import { Loop } from './system/loop.js';
import { BVH_Player } from './motion_player/bvh_player.js';
import { NPY_Player } from './motion_player/npy_player.js';
import { FBX_Player } from './motion_player/fbx_player.js';

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

        
    this.bvh_loader = new BVH_loader();
    this.fbx_loader = new FBX_Loader();
    this.npy_loader = new NPY_loader();
    const resizer = new Resizer(container, camera, renderer);

  }

  async initialize()
  {
    await this.bvh_loader.load('http://127.0.0.1:8000/data/bvh/Combo_Punch.bvh')
    scene.add(this.bvh_loader.bvh_object);
    
    const bvh_player = new BVH_Player(this.bvh_loader);
    loop.updatables.push(bvh_player.bvh_player_object);
    
    
    // ==============================================================================================
    
    // await this.fbx_loader.loadFBX('http://127.0.0.1:8000/data/fbx/test.fbx');
    // scene.add(this.fbx_loader.fbx_object);
    
    // const fbx_player = new FBX_Player(this.fbx_loader);
    // loop.updatables.push(fbx_player.fbx_player_object);
    
    // ==============================================================================================
    
    // await this.npy_loader.load('//127.0.0.1:8000/data/numpy_groundtruth/Combo_Punch.npy');
    // scene.add(this.npy_loader.npy_object);

    // this.npy_loader.createSpheres();
    // this.npy_loader.parseHierarchyFileBVH("//127.0.0.1:8000/data/json/Combo_Punch_skeleton_groundtruth.json");
    
    // const npy_player = new NPY_Player(this.npy_loader);
    // loop.updatables.push(npy_player.npy_player_object);

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
        status.textContent = `✅ ${apiResponse.message} ${apiResponse.not_supported_files && '❌ ' + apiResponse.not_supported_files}`;
      } 
      catch (error) 
      {
        status.textContent = `❌ error: ${error.message}`;
      }

    });
  }

  convert_bvh_to_npy() 
  {
    document.getElementById("process_bvh_files_btn").addEventListener("click", async () => 
    {
      const status = document.getElementById("process_bvh_files_status");
      try 
      {
        const serverResponse = await fetch("http://localhost:8000/motion/convert_bvh_to_npy", {
          method: "POST"
        });

        if (!serverResponse.ok) 
        {
          throw new Error(`${serverResponse.statusText}` || "unknown error");
        }
        
        const apiResponse = await serverResponse.json();
        status.textContent = apiResponse.warning
          ? `⚠️ ${apiResponse.warning}`
          : `✅ ${apiResponse.message}`;
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
        status.textContent = apiResponse.warning
          ? `⚠️ ${apiResponse.warning}`
          : `✅ ${apiResponse.message}`;

      }
      catch (error) 
      {
        status.textContent = `❌${error.message}`;
      }

    });
  }
}


export { App };