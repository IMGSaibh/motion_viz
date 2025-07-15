import {
  PerspectiveCamera, 
  WebGLRenderer,
  Scene
} from 'three'

import { Loop } from '@/system/loop';
import { Resizer } from '@/system/resizer';
import { createScene } from '@/components/scene';
import { createCamera } from '@/components/camera';
import { createRenderer } from '@/system/renderer';
import { createOrbitControls } from '@/components/orbitcontrol';

import { BVH_loader } from '@/motion_loader/bvh_loader';
import { FBX_Loader } from '@/motion_loader/fbx_loader';
import { NPY_loader } from '@/motion_loader/npy_loader';
import { BVH_Player } from '@/motion_player/bvh_player';
import { NPY_Player } from '@/motion_player/npy_player';
import { FBX_Player } from '@/motion_player/fbx_player';
import Utils from '@/utils';
import {ThumbnailGenerator} from '@/thumbnail_generator';

class App
{
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  loop: Loop;
  currentLoader: BVH_loader | FBX_Loader | NPY_loader | null;
  currentPlayer: BVH_Player | FBX_Player | NPY_Player | null;

  constructor(container: HTMLDivElement)
  {
    this.camera = createCamera();
    this.renderer = createRenderer();
    this.scene = createScene();
    this.loop = new Loop(this.camera, this.scene, this.renderer);
    container.append(this.renderer.domElement);

    const orbitControls = createOrbitControls(this.camera, this.renderer);
    this.loop.updatables.push(orbitControls);
    const resizer = new Resizer(container, this.camera, this.renderer);

    this.currentLoader = null;
    this.currentPlayer = null;

  }
  
  // use start and stop for animation and frame stream
  start()
  {
    this.loop.start();
  }
  
  stop()
  {
    this.loop.stop();
  }

  upload_files()
  {
    Utils.generic_inputbutton_fastAPI_with("upload_files_btn", 
      "client_uploads_status", 
      "upload_files", 
      "http://localhost:8000/motion/uploads");
  }

  convert_pv_style() 
  {
    Utils.generic_button_fastAPI("convert_pv_style_btn", 
      "convert_pv_style_status", 
      "http://localhost:8000/motion/convert_pv_style");
  }

  convert_bvh_to_npy() 
  {

    Utils.generic_button_fastAPI("convert_bvh_to_npy_btn", 
      "convert_bvh_to_npy_status", 
      "http://localhost:8000/motion/convert_bvh_to_npy");
  }

  convert_csv_kinect_v1_to_npy()
  {
    Utils.generic_button_fastAPI("convert_csv_kinectv1_to_npy_btn", 
      "convert_csv_kinectv1_to_npy_status",
      "http://localhost:8000/motion/convert_csv_kinectv1_to_npy");
  }

  convert_csv_c3d_to_npy()
  {
    Utils.generic_button_fastAPI("convert_csv_c3d_to_npy_btn", 
      "convert_csv_c3d_to_npy_status",
      "http://localhost:8000/motion/convert_csv_c3d_to_npy");

  }

  convert_csv_segmentbased_to_npy()
  {
    Utils.generic_button_fastAPI("convert_csv_sgementbased_to_npy_btn", 
      "convert_csv_sgementbased_to_npy_status",
      "http://localhost:8000/motion/convert_csv_segmentbased_to_npy");
  }

  async setup_file_dropdown() 
  {
    const file_selector = document.getElementById("file_selector") as HTMLDivElement | null;
    const dropdown = document.getElementById("file_dropdown") as HTMLSelectElement | null;
    const status = document.getElementById("file_selector_status") as HTMLDivElement | null;
    if (!file_selector || !dropdown || !status) 
    {
      console.error("File selector or dropdown or status element not found.");
      return;
    }
    
    try 
    {
      file_selector.addEventListener("mousedown", async () => {
        
        const response = await fetch("http://localhost:8000/motion/list_files", {
          method: "POST"
        });
  
        const files = await response.json();
        dropdown.innerHTML = '<option disabled selected>-- Datei auswählen --</option>';

  
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
        

      });

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
        if (error instanceof Error) 
        {
          status.textContent = `❌ error: ${error.message}`;
        } 
        else 
        {
          status.textContent = '❌ Unknown error';
        } 
    }
  }

  async load_motionfile_and_player(filename: string)
  {
    const file_extension = filename.split('.').pop()?.toLowerCase() ?? '';
    const fileUrl = `http://localhost:8000/data/${file_extension}/${filename}`;

    switch (file_extension) {
      case 'bvh':
        this.currentLoader = new BVH_loader(this.scene);
        await this.currentLoader.load_bvh_motion(fileUrl);
        this.currentPlayer = new BVH_Player(this.currentLoader, this.loop);
        break;

      case 'fbx':
        this.currentLoader = new FBX_Loader(this.scene);
        await this.currentLoader.load_fbx_animation(fileUrl);
        this.currentPlayer = new FBX_Player(this.currentLoader, this.loop);
        break;

      case 'npy':
        this.currentLoader = new NPY_loader(this.scene);
        await this.currentLoader.load_npy_animation(fileUrl);

        
        const skeletonPath = fileUrl
        .replace("/numpy_converted/", "/json/")
        .replace(".npy", "_skeleton_converted.json");
        await this.currentLoader.create_skeleton(skeletonPath);

        // const thumbnailGenerator = new ThumbnailGenerator(scene, camera, this.currentLoader, loop);
        // await thumbnailGenerator.loadAndPrepare();
        
        this.currentPlayer = new NPY_Player(this.currentLoader, this.loop);


        break;
    }
  }

  cleanup_scene() 
  {
    window.addEventListener('keydown', (e) => 
    {
      if (e.code === 'KeyR')
      {
        if (this.currentPlayer) 
        {
          this.currentLoader!.dispose();
          this.currentPlayer.dispose();

          this.currentPlayer = null;
          this.currentLoader = null;
          
          const label = document.getElementById('frame-label') as HTMLDivElement | null;
          const slider = document.getElementById('frame-slider')as HTMLInputElement | null;
          slider!.value = '0';
          label!.textContent = `Frame: 0 / 0`;
        }
      }
    });

  }

  print_updateables()
  {
    window.addEventListener('keydown', (e) => 
    {
      if(e.code == "KeyP")
      {
        for (let index = 0; index < this.scene.children.length; index++) 
        {
          const element = this.scene.children[index];
          console.log(`Object type: ${element.type} | Name: ${element.name}`);
        }

        console.log("loop.updatables.length ", this.loop.updatables.length);
        for (let index = 0; index < this.loop.updatables.length; index++) 
        {
          const element = this.loop.updatables[index];
          if (!element) 
          {
            console.log(element);
          }
          
        }
          console.log("loop.updatables ", this.loop.updatables)
          Utils.log_camera_position(this.camera);
          console.log("=================================================")
      
      }
    });
  }


  // TODO: implement slider preview when needed. Just uncomment the code below.
  slider_preview_frame()
  {
    const slider = document.getElementById("frame-slider") as HTMLInputElement | null;
    const preview = document.getElementById("preview-popup") as HTMLDivElement | null;
    const previewImg = document.getElementById("preview-img") as HTMLImageElement | null;

    if (!slider || !preview || !previewImg) 
    {
      console.error("Slider or preview elements not found.");
      return;
    }

    slider.addEventListener("mousemove", (e) => 
    {
      const rect = slider.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const frameIndex = Math.round(percent * (parseInt(slider.max) - parseInt(slider.min)));

      // preview window position 
      preview.style.left = `${e.clientX - rect.left + 60}px`;
      preview.style.display = "block";

      const base_url = "http://localhost:8000"; // FastAPI runs at 8000
      previewImg.src = `${base_url}/data/thumbnails/frame_${String(frameIndex).padStart(4, '0')}.jpg`;
    });

    slider.addEventListener("mouseleave", () => 
    {
      preview.style.display = "none";
    });

  }



}


export { App };