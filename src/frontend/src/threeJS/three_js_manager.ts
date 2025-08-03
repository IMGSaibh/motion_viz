import {PerspectiveCamera, WebGLRenderer, Scene } from 'three'
import { BVH_loader } from '@/threeJS/motion_loader/bvh_loader';
import { FBX_Loader } from '@/threeJS/motion_loader/fbx_loader';
import { NPY_loader } from '@/threeJS/motion_loader/npy_loader';
import { BVH_Player } from '@/threeJS/motion_player/bvh_player';
import { NPY_Player } from '@/threeJS/motion_player/npy_player';
import { FBX_Player } from '@/threeJS/motion_player/fbx_player';
import { Loop } from '@/threeJS/system/loop';
import { Resizer } from '@/threeJS/system/resizer';
import { createScene } from '@/threeJS/components/scene';
import { createCamera } from '@/threeJS/components/camera';
import { createRenderer } from '@/threeJS/system/renderer';
import { createOrbitControls } from '@/threeJS/components/orbitcontrol';
import Utils from '@/threeJS/utils';

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
        this.currentLoader = null;
        this.currentPlayer = null;
        this.camera = createCamera();
        this.renderer = createRenderer();
        this.scene = createScene();
        this.loop = new Loop(this.camera, this.scene, this.renderer);
        this.container = container;
        this.container.append(this.renderer.domElement);

        const orbitControls = createOrbitControls(this.camera, this.renderer);
        this.loop.updatables.push(orbitControls);
        const resizer = new Resizer(container, this.camera, this.renderer);


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

    async load_motionfile_and_player(filename: string)
    {
        const file_extension = filename.split('.').pop()?.toLowerCase() ?? '';
        const fileUrl = `http://localhost:8000/data/${file_extension}/${filename}`;
        switch (file_extension) 
        {
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

    async getThumbnailForFrame(frameIndex: number) 
    {
        if (this.currentPlayer instanceof NPY_Player) 
        {
            return await this.currentPlayer.renderThumbnail(frameIndex, this.scene, this.camera, 260, 190, this.previewRenderer);
        }
        return null;
    }

    async frame_range_change(min: number, max: number)
    {
        const timeline = document.getElementById('timeline-container_2');
        const startframe_handle = document.getElementById("startframe_handle") as HTMLDivElement | null
        const endframe_handle = document.getElementById("endframe_handle") as HTMLDivElement | null
        const previewImg = document.getElementById("preview-img_2") as HTMLImageElement | null;
        

        if (this.currentPlayer instanceof NPY_Player) 
        {
            const thumbDataUrl = await this.currentPlayer.renderThumbnail(min, this.scene, this.camera, 260, 190, this.previewRenderer);
            if (thumbDataUrl && previewImg)
            {
                previewImg.src = thumbDataUrl;
            }
        }

    }
    
    get_frame_count_of_npy_player()
    {
        if (this.currentPlayer instanceof NPY_Player)
        {
            return this.currentPlayer.frameCount   
        }
        return 0;
    }



    slider_preview_mouseleave()
    {
        const slider = document.getElementById("frame-slider") as HTMLInputElement | null;
        const preview = document.getElementById("preview-popup") as HTMLDivElement | null;
        console.log("what")

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