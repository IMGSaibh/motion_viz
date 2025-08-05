import {PerspectiveCamera, WebGLRenderer, Scene } from 'three'
import { BVH_loader } from '@/threeJS/motion_loader/bvh_loader';
import { FBX_Loader } from '@/threeJS/motion_loader/fbx_loader';
import { NPY_loader } from '@/threeJS/motion_loader/npy_loader';
import { BVH_Player } from '@/threeJS/motion_player/bvh_player';
import { NPY_Player } from '@/threeJS/motion_player/npy_player';
import { FBX_Player } from '@/threeJS/motion_player/fbx_player';
import { Loop, Updatable } from '@/threeJS/system/loop';
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
    npy_player: NPY_Player | null;

    constructor(container: HTMLDivElement)
    {
        this.currentLoader = null;
        this.currentPlayer = null;
        this.npy_player = null;
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
                this.npy_player = new NPY_Player(this.currentLoader);
                this.loop.updatables.push(this.npy_player.npy_player_object);

                break;
        }
    }

    async getThumbnailForFrame(frameIndex: number) 
    {
        if (this.npy_player instanceof NPY_Player) 
        {
            return await this.npy_player.renderThumbnail(frameIndex, this.scene, this.camera, 260, 190, this.previewRenderer);
        }
        return null;
    }

    play_pause()
    {
        if (this.npy_player instanceof NPY_Player)
        {
            // this.currentPlayer.play_pause()
            this.npy_player.play_pause()
        }
    }

    player_stop()
    {
        if (this.currentPlayer instanceof NPY_Player)
        {
            this.currentPlayer.stop()
        }
    }

    go_to_frame(frameIndex: number)
    {
        if (this.npy_player instanceof NPY_Player)
        {
            return this.npy_player.gotoFrame(frameIndex)
        }
        return 0;
    }
    
    get_frame_count()
    {
        if (this.npy_player instanceof NPY_Player)
        {
            return this.npy_player.frameCount
        }
        return 0;
    }

    get_frame_index()
    {
        if (this.npy_player instanceof NPY_Player)
        {
            return this.npy_player.frameIdx   
        }
        return 0;
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
            // slider!.value = '0';
            label!.textContent = `Frame: 0 / 0`;
            if (this.previewRenderer) 
            {
                this.previewRenderer.dispose();
            }

        }
        const index = this.loop.updatables.indexOf(this.npy_player!.npy_player_object);
        this.currentLoader!.dispose();

        if (index !== -1) 
        {
            console.log("remove NPY motion")
            this.loop.updatables.splice(index, 1);
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