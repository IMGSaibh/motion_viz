import { PerspectiveCamera, WebGLRenderer, Scene } from 'three';
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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Utils from '@/threeJS/utils';
import { apiUrl } from '@/api/api_client';

export class ThreeJSEngine {
  private npy_loader: NPY_loader | null;
  private npy_player: NPY_Player | null;

  private bvh_loader: BVH_loader | null;
  private bvh_player: BVH_Player | null;

  private fbx_loader: FBX_Loader | null;
  private fbx_player: FBX_Player | null;

  private scene: Scene;
  private renderer: WebGLRenderer;
  private scene_container: HTMLDivElement;
  private camera: PerspectiveCamera;
  private thumbnail_renderer: WebGLRenderer;

  // copy to remove updateables from scene loop
  private _orbitControls: OrbitControls | null;

  loop: Loop;

  constructor(scene_container: HTMLDivElement) {
    this.npy_player = null;
    this.npy_loader = null;

    this.bvh_loader = null;
    this.bvh_player = null;

    this.fbx_player = null;
    this.fbx_loader = null;

    this.camera = createCamera();
    this.renderer = createRenderer();
    this.scene = createScene();
    this.loop = new Loop(this.camera, this.scene, this.renderer);
    this.scene_container = scene_container;
    this.scene_container.append(this.renderer.domElement);

    const orbitControls = createOrbitControls(this.camera, this.renderer);
    this._orbitControls = orbitControls;
    this.loop.updatables.push(orbitControls);
    const resizer = new Resizer(scene_container, this.camera, this.renderer);

    this.thumbnail_renderer = new WebGLRenderer({ preserveDrawingBuffer: true, alpha: true });
    this.thumbnail_renderer.setSize(260, 190, false);
  }

  start_engine_cycle() {
    this.loop.start();
  }

  stop_engine_cycle() {
    this.loop.stop();
  }

  async load_motionfile_and_player(filename: string | null) {
    if (!filename) {
      console.log('no motion file selected');
      return;
    }
    const file_extension = filename.split('.').pop()?.toLowerCase() ?? '';
    // const fileUrl = `http://localhost:8000/data/${file_extension}/${filename}`;
    const fileUrl = apiUrl(`/data/${file_extension}/${filename}`);
    switch (file_extension) {
      case 'bvh':
        this.bvh_loader = new BVH_loader(this.scene);
        await this.bvh_loader.load_bvh_motion(fileUrl);
        this.bvh_player = new BVH_Player(this.bvh_loader);
        this.loop.updatables.push(this.bvh_player.bvh_player_object);
        break;

      case 'fbx':
        this.fbx_loader = new FBX_Loader(this.scene);
        await this.fbx_loader.load_fbx_animation(fileUrl);
        this.fbx_player = new FBX_Player(this.fbx_loader);
        this.loop.updatables.push(this.fbx_player.fbx_player_object);
        break;

      case 'npy':
        this.npy_loader = new NPY_loader(this.scene);
        await this.npy_loader.load_npy_animation(fileUrl);

        const skeletonPath = fileUrl.replace('/data/npy/', '/data/json/').replace(/\.npy$/i, '.json');
        await this.npy_loader.create_skeleton(skeletonPath);
        this.npy_player = new NPY_Player(this.npy_loader);
        this.loop.updatables.push(this.npy_player.npy_player_object);
        break;
    }
  }

  get_current_player(): NPY_Player | BVH_Player | FBX_Player | null {
    if (this.npy_player) return this.npy_player;
    else if (this.bvh_player) return this.bvh_player;
    else if (this.fbx_player) return this.fbx_player;
    return null;
  }

  async get_thumbnail_for_frame(frame_index: number) {
    if (this.npy_player)
      return await this.npy_player.render_thumbnail(
        frame_index,
        this.scene,
        this.camera,
        260,
        190,
        this.thumbnail_renderer,
      );
    else if (this.fbx_player)
      return await this.fbx_player.render_thumbnail(
        frame_index,
        this.scene,
        this.camera,
        260,
        190,
        this.thumbnail_renderer,
      );
    else if (this.bvh_player)
      return await this.bvh_player.render_thumbnail(
        frame_index,
        this.scene,
        this.camera,
        260,
        190,
        this.thumbnail_renderer,
      );
    return null;
  }

  play_pause() {
    if (this.npy_player) this.npy_player.play_pause();
    else if (this.bvh_player) this.bvh_player.play_pause();
    else if (this.fbx_player) this.fbx_player.play_pause();
  }

  pause() {
    if (this.npy_player) this.npy_player.pause();
    else if (this.bvh_player) this.bvh_player.pause();
    else if (this.fbx_player) this.fbx_player.pause();
  }

  go_to_frame(frame_index: number) {
    if (this.npy_player) this.npy_player.go_to_frame(frame_index);
    else if (this.bvh_player) this.bvh_player.go_to_frame(frame_index);
    else if (this.fbx_player) this.fbx_player.go_to_frame(frame_index);
  }

  get_frame_count(): number {
    if (this.npy_player) return this.npy_player.get_frame_count();
    else if (this.bvh_player) return this.bvh_player.get_frame_count();
    else if (this.fbx_player) return this.fbx_player.get_frame_count();
    return 0;
  }

  get_frame_index() {
    if (this.npy_player) return this.npy_player.get_frame_index();
    else if (this.bvh_player) return this.bvh_player.get_frame_index();
    else if (this.fbx_player) return this.fbx_player.get_frame_index();
    return 0;
  }

  print_scene_components() {
    if (!this.scene || !this.loop || !this.camera) {
      console.log('Scene, loop oder camera nicht bereit.');
      return;
    }
    Utils.print_scene_components(this.scene, this.loop, this.camera);
  }

  cleanup_player() {
    if (this.npy_player) {
      this.npy_player.dispose();
      this.npy_player = null;
      this.npy_loader?.dispose();
    } else if (this.bvh_player) {
      this.bvh_player.dispose();
      this.bvh_player = null;
      this.bvh_loader?.dispose();
    } else if (this.fbx_player) {
      this.fbx_player.dispose();
      this.fbx_player = null;
      this.fbx_loader?.dispose();
    }
  }

  cleanup_loop() {
    this.loop.updatables = this.loop.updatables.filter((obj) => obj === this._orbitControls);
  }

  cleanup_thumbnail_render() {
    if (this.thumbnail_renderer) {
      this.thumbnail_renderer.dispose();
    }
  }

  dispose() {
    // TODO: dispose other stuff too
    this.cleanup_player();
    this.stop_engine_cycle();
    this.renderer.dispose();
    this.scene_container.removeChild(this.renderer.domElement);
  }
}
