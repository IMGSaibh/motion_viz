import { PerspectiveCamera, WebGLRenderer, Scene } from 'three';
import { BVH_loader } from '@/threeJS/motion_loader/bvh_loader';
import { FBX_Loader } from '@/threeJS/motion_loader/fbx_loader';
import { NPY_loader } from '@/threeJS/motion_loader/npy_loader';
import { GLTF_Loader } from '@/threeJS/motion_loader/gltf_loader';
import {MotionRecorder} from '@/threeJS/motion_loader/motion_recorder'
import { BVH_Player } from '@/threeJS/motion_player/bvh_player';
import { NPY_Player } from '@/threeJS/motion_player/npy_player';
import { FBX_Player } from '@/threeJS/motion_player/fbx_player';
import { GLTF_Player } from '@/threeJS/motion_player/gltf_player';
import { SkeletonMapper } from './motion_loader/skeleton_mapper';
import { Loop } from '@/threeJS/system/loop';
import { Resizer } from '@/threeJS/system/resizer';
import { createScene } from '@/threeJS/components/scene';
import { createCamera } from '@/threeJS/components/camera';
import { createRenderer } from '@/threeJS/system/renderer';
import { createOrbitControls } from '@/threeJS/components/orbitcontrol';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { api_get_base_url } from '@/hooks/hook_endpoints';
import Utils from '@/threeJS/utils';
import * as THREE from 'three';

export class ThreeJSEngine {
  private npy_loader: NPY_loader | null;
  private npy_player: NPY_Player | null;

  private bvh_loader: BVH_loader | null;
  private bvh_player: BVH_Player | null;

  private fbx_loader: FBX_Loader | null;
  private fbx_player: FBX_Player | null;

  private gltf_loader: GLTF_Loader | null;
  private gltf_player: GLTF_Player | null;

  private scene: Scene;
  private renderer: WebGLRenderer;
  private scene_container: HTMLDivElement;
  private camera: PerspectiveCamera;
  private thumbnail_renderer: WebGLRenderer;

  // copy to remove updateables from scene loop
  private _orbitControls: OrbitControls | null;

  loop: Loop;
  record: boolean = true;

  constructor(scene_container: HTMLDivElement) {
    this.npy_player = null;
    this.npy_loader = null;

    this.bvh_loader = null;
    this.bvh_player = null;

    this.fbx_player = null;
    this.fbx_loader = null;

    this.gltf_loader = null;
    this.gltf_player = null;

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

    let skeletonMapper = new SkeletonMapper();
    skeletonMapper.mapSkeletons('http://localhost:8000/data/json/example.json', 'http://localhost:8000/data/json/A_test.json');

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
    const fileUrl = api_get_base_url(`/data/${file_extension}/${filename}`);

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
        
      case 'glb': 
        this.gltf_loader = new GLTF_Loader(this.scene);
        await this.gltf_loader.load_gltf_animation(fileUrl);
        this.gltf_player = new GLTF_Player(this.gltf_loader);
        if(this.record) {
          const motionRecorder: MotionRecorder = new MotionRecorder(this.gltf_loader);
          await motionRecorder.convert_to_xsens_format()
        }
        this.loop.updatables.push(this.gltf_player.gltf_player_object);
        break;
      }
      
  }

  get_current_player(): NPY_Player | BVH_Player | FBX_Player | GLTF_Player | null {
    if (this.npy_player) return this.npy_player;
    else if (this.bvh_player) return this.bvh_player;
    else if (this.fbx_player) return this.fbx_player;
    else if (this.gltf_player) return this.gltf_player;
    return null;
  }

  async get_thumbnail_for_frame(frame_index: number) {
    if (!this.thumbnail_renderer) {
      this.thumbnail_renderer = new WebGLRenderer({ preserveDrawingBuffer: true, alpha: true });
      this.thumbnail_renderer.setSize(260, 190, false);
    }
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
    else if (this.gltf_player)      
      return await this.gltf_player.render_thumbnail(
        frame_index,
        this.scene,
        this.camera,
        260,
        190,
        this.thumbnail_renderer,
    );
    return null;
  }

  is_playing() {
    if (this.npy_player) return this.npy_player.is_playing;
    else if (this.bvh_player) return this.bvh_player.is_playing;
    else if (this.fbx_player) return this.fbx_player.is_playing;
    else if (this.gltf_player) return this.gltf_player.is_playing;
  }

  play_pause() {
    if (this.npy_player) this.npy_player.play_pause();
    else if (this.bvh_player) this.bvh_player.play_pause();
    else if (this.fbx_player) this.fbx_player.play_pause();
    else if (this.gltf_player) this.gltf_player.play_pause();
  }

  pause() {
    if (this.npy_player) this.npy_player.pause();
    else if (this.bvh_player) this.bvh_player.pause();
    else if (this.fbx_player) this.fbx_player.pause();
    else if (this.gltf_player) this.gltf_player.pause();
  }

  go_to_frame(frame_index: number) {
    if (this.npy_player) this.npy_player.go_to_frame(frame_index);
    else if (this.bvh_player) this.bvh_player.go_to_frame(frame_index);
    else if (this.fbx_player) this.fbx_player.go_to_frame(frame_index);
    else if (this.gltf_player) this.gltf_player.go_to_frame(frame_index);
  }

  get_frame_count(): number {
    if (this.npy_player) return this.npy_player.get_frame_count();
    else if (this.bvh_player) return this.bvh_player.get_frame_count();
    else if (this.fbx_player) return this.fbx_player.get_frame_count();
    else if (this.gltf_player) return this.gltf_player.get_frame_count();
    return 0;
  }

  get_frame_index() {
    if (this.npy_player) return this.npy_player.get_frame_index();
    else if (this.bvh_player) return this.bvh_player.get_frame_index();
    else if (this.fbx_player) return this.fbx_player.get_frame_index();
    else if (this.gltf_player) return this.gltf_player.get_frame_index();
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
      this.npy_loader?.dispose();
      this.npy_player = null;
    } else if (this.bvh_player) {
      this.bvh_player.dispose();
      this.bvh_loader?.dispose();
      this.bvh_player = null;
    } else if (this.fbx_player) {
      this.fbx_player.dispose();
      this.fbx_loader?.dispose();
      this.fbx_player = null;
    } else if (this.gltf_player) {
      this.gltf_player.dispose();
      this.gltf_loader?.dispose();
      this.gltf_player = null;
    }
  }

  cleanup_loop() {
    this.loop.updatables = this.loop.updatables.filter((obj) => obj === this._orbitControls);
  }

  cleanup_thumbnail_render() {
    if (this.thumbnail_renderer) {
      this.thumbnail_renderer.dispose();
      this.thumbnail_renderer = null as any;
    }
  }

  dispose() {
    // TODO: dispose other stuff too
    this.cleanup_player();
    this.stop_engine_cycle();
    this.renderer.dispose();
    this.scene_container.removeChild(this.renderer.domElement);
  }

    // Get vertex under mouse
getVertexUnderMouse(
  event: MouseEvent, 
  camera: THREE.Camera, 
  skinnedMesh: THREE.SkinnedMesh,
  renderer : THREE.WebGLRenderer
): { face: THREE.Face, vertices: { index: number, position: THREE.Vector3 }[], point: THREE.Vector3 } | null {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  const rendererDomElement = renderer.domElement;
  
  mouse.x = (event.clientX / rendererDomElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / rendererDomElement.clientHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(skinnedMesh);
  
  if (intersects.length > 0) {
    const intersect = intersects[0];
    const face = intersect.face;
    if (!face) return null;
    
    const geometry = skinnedMesh.geometry;
    const positions = geometry.attributes.position.array;
    
    // Get the three vertices of the triangle
    const vertexIndices = [face.a, face.b, face.c];
    const vertices = vertexIndices.map(idx => ({
      index: idx,
      position: new THREE.Vector3(
        positions[idx * 3],
        positions[idx * 3 + 1],
        positions[idx * 3 + 2]
      )
    }));
    
    return { face, vertices, point: intersect.point };
  }
  return null;
}

}
