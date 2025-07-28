import {PerspectiveCamera, WebGLRenderer, Scene } from 'three'
import { BVH_loader } from '@/motion_loader/bvh_loader';
import { FBX_Loader } from '@/motion_loader/fbx_loader';
import { NPY_loader } from '@/motion_loader/npy_loader';
import { BVH_Player } from '@/motion_player/bvh_player';
import { NPY_Player } from '@/motion_player/npy_player';
import { FBX_Player } from '@/motion_player/fbx_player';
import { Loop } from '@/system/loop';
import { Resizer } from '@/system/resizer';
import { createScene } from '@/components/scene';
import { createCamera } from '@/components/camera';
import { createRenderer } from '@/system/renderer';
import { createOrbitControls } from '@/components/orbitcontrol';
import Utils from '@/utils';

export class ThreeManager 
{
    private scene: Scene;
    private camera: PerspectiveCamera;
    private renderer: WebGLRenderer;
    private previewRenderer: WebGLRenderer; 
    private container: HTMLDivElement;

    loop: Loop;
    currentLoader: BVH_loader | FBX_Loader | NPY_loader | null;
    currentPlayer: BVH_Player | FBX_Player | NPY_Player | null;

    constructor(container: HTMLDivElement)
    {
        this.camera = createCamera();
        this.renderer = createRenderer();
        this.scene = createScene();
        this.loop = new Loop(this.camera, this.scene, this.renderer);
        this.container = container;
        this.container.append(this.renderer.domElement);

        const orbitControls = createOrbitControls(this.camera, this.renderer);
        this.loop.updatables.push(orbitControls);
        const resizer = new Resizer(container, this.camera, this.renderer);

        this.currentLoader = null;
        this.currentPlayer = null;

        this.previewRenderer = new WebGLRenderer({ preserveDrawingBuffer: true, alpha: true });
        this.previewRenderer.setSize(260, 190, false);
    }

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
        Utils.generic_inputbutton_fastAPI_inputelement(
            "upload_files_btn", 
            "client_uploads_status", 
            "upload_files", 
            "http://localhost:8000/motion/uploads");
    }

    toggle_config_panel()
    {
        const toggleBtn = document.getElementById('motion-config-toggle');
        const panel = document.getElementById('motion-config-panel');
        if (toggleBtn == null) return;
        if (panel == null) return;

        if (panel.style.display === "none" || !panel.style.display) 
        {
            panel.style.display = "block";
            toggleBtn.style.borderRadius = "8px 8px 0 0";
        } 
        else 
        {
            panel.style.display = "none";
            toggleBtn.style.borderRadius = "6px";
        }
    }

    submit_config_panel()
    {
        Utils.button_motion_config("submit_motion_config", 
        "config_status", 
        "http://localhost:8000/motion/motion_config");
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

    async file_selection_dropwown()
    {
        const elem = await Utils.file_selection_dropdown();
        const str = await Utils.load_dropdown_element(elem) as string
        this.load_motionfile_and_player(str);
        
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
            .replace("/npy/", "/json/")
            .replace(".npy", "_skeleton.json");
            await this.currentLoader.create_skeleton(skeletonPath);
            this.currentPlayer = new NPY_Player(this.currentLoader, this.loop);
            break;
        }
    }

    async slider_preview_mousemove(e: React.MouseEvent<HTMLInputElement, MouseEvent>)
    {
        const slider = document.getElementById("frame-slider") as HTMLInputElement | null;
        const preview = document.getElementById("preview-popup") as HTMLDivElement | null;
        const previewImg = document.getElementById("preview-img") as HTMLImageElement | null;

        if (!slider || !preview || !previewImg) 
        {
            console.error("Slider or preview elements not found.");
            return;
        }


        const rect = slider.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const frameIndex = Math.round(percent * (parseInt(slider.max) - parseInt(slider.min)));

        preview.style.left = `${e.clientX - rect.left + 60}px`;
        preview.style.display = "block";
        if (this.currentPlayer instanceof NPY_Player) 
        {
            const thumbDataUrl = await this.currentPlayer.renderThumbnail(frameIndex, this.scene, this.camera, 260, 190, this.previewRenderer);
            if (thumbDataUrl)
            {
                previewImg.src = thumbDataUrl;
            }
        }
    }  

    slider_preview_mouseleave()
    {
        const slider = document.getElementById("frame-slider") as HTMLInputElement | null;
        const preview = document.getElementById("preview-popup") as HTMLDivElement | null;
        if (!slider || !preview) 
        {
            console.error("Slider or preview elements not found.");
            return;
        }

        preview.style.display = "none";
    }

    print_scene_components()
    {
        if (!this.scene || !this.loop || !this.camera) 
        {
            console.log("Scene, loop oder camera nicht bereit.");
            return;  
        }
        Utils.print_scene_components(this.scene, this.loop, this.camera)
    }

    cleanup_scene()
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
            if (this.previewRenderer) 
            {
                this.previewRenderer.dispose();
            }
        }
    }

    dispose() 
    {
        // TODO: dispose other stuff too
        this.stop();
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }

}