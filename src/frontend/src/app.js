
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
let currentPlayer = null;

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

  convert_csv_to_npy()
  {
    document.getElementById("convert_csv_to_npy_btn").addEventListener("click", async () => 
    {
      const status = document.getElementById("convert_csv_to_npy_status");

      try 
      {
        const serverResponse = await fetch("http://localhost:8000/motion/convert_csv_to_npy", {
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

  async setup_file_dropdown() 
  {
    const dropdown = document.getElementById("file_dropdown");
    const status = document.getElementById("file_selector_status");

    try 
    {
      const response = await fetch("http://localhost:8000/motion/list_files", {
        method: "POST"
      });

      const files = await response.json();

      for (const [type, list] of Object.entries(files)) 
      {
        if (!Array.isArray(list)) continue;

        list.forEach(filename => {
          const option = document.createElement("option");
          option.value = filename;
          option.dataset.type = type;
          option.textContent = `${filename} (${type})`;
          dropdown.appendChild(option);
        });
      }

      // directly start player when user choosed motion file
      dropdown.addEventListener("change", async () => {
      const selected = dropdown.selectedOptions[0];
      const filename = selected.value;
      const type = selected.dataset.type;

      if (!filename || !type) return;

        await this.load_motionfile_and_player(filename);
      });

    } 
    catch (error) 
    {
      status.textContent = `❌${error.message}`;
    }
  }


  async load_motionfile_and_player(filename) 
  {
    const file_extension = filename.split('.').pop().toLowerCase();
    const folder = this.get_folder_by_extension(file_extension);
    const fileUrl = `http://localhost:8000/data/${folder}/${filename}`;

    switch (file_extension) {
      case 'bvh':
        this.bvh_loader = new BVH_loader();
        await this.bvh_loader.load(fileUrl);
        scene.add(this.bvh_loader.bvh_object);

        currentPlayer = new BVH_Player(this.bvh_loader);
        loop.updatables.push(currentPlayer.bvh_player_object);
        break;

      case 'fbx':
        this.fbx_loader = new FBX_Loader();
        await this.fbx_loader.loadFBX(fileUrl);
        scene.add(this.fbx_loader.fbx_object);

        currentPlayer = new FBX_Player(this.fbx_loader);
        loop.updatables.push(currentPlayer.fbx_player_object);
        break;

      case 'npy':
        this.npy_loader = new NPY_loader();
        await this.npy_loader.load(fileUrl);
        scene.add(this.npy_loader.npy_object);
        this.npy_loader.createSpheres();

        const skeletonPath = fileUrl
        .replace("/numpy_groundtruth/", "/json/")
        .replace(".npy", "_skeleton_groundtruth.json");
        await this.npy_loader.parse_hierarchy_file_bvh(skeletonPath);
        // await this.npy_loader.parse_hierarchy_file_csv(skeletonPath);

        currentPlayer = new NPY_Player(this.npy_loader);
        loop.updatables.push(currentPlayer.npy_player_object);
        break;
    }
  }


  get_folder_by_extension(ext) 
  {
    switch (ext) 
    {
      case 'bvh': return 'bvh';
      case 'fbx': return 'fbx';
      case 'npy': return 'numpy_groundtruth';
      default: return '';
    }
}

  cleanup_scene() 
  {

    window.addEventListener('keydown', (e) => 
    {
      if (e.code === 'KeyR')
      {
        if (currentPlayer) 
        {
          // remove all player from loop
          const playerObject =  currentPlayer.bvh_player_object ||
                                currentPlayer.fbx_player_object ||
                                currentPlayer.npy_player_object;
          
          const index = loop.updatables.indexOf(playerObject);
          if (index !== -1) 
          {
            loop.updatables.splice(index, 1);
          }
    
          // remove player from Szene
          scene.remove(playerObject);
          currentPlayer = null;
        }
    
        // remove loader from scene
        if (this.bvh_loader?.bvh_object) scene.remove(this.bvh_loader.bvh_object);
        if (this.fbx_loader?.fbx_object) scene.remove(this.fbx_loader.fbx_object);
        if (this.npy_loader?.npy_object) scene.remove(this.npy_loader.npy_object);
      }
    });
  }

  print_updateables()
  {
    window.addEventListener('keydown', (e) => 
    {
      if(e.code == "KeyP")
      {
        console.log("scene children ", scene.children.length)
        console.log("loop updates", loop.updatables.length)
        const groupObject = scene.children.find(child => child.type === "Group");

        if (groupObject) 
        {
          console.log("scene.children: ", groupObject.children.length);
        } 
        else 
        {
          console.log("Keine Group in der Szene gefunden.");
        }

      }

    });
  }

}


export { App };