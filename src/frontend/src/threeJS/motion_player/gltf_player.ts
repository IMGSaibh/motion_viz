import { Updatable } from '@/threeJS/system/loop';
import { PerspectiveCamera, WebGLRenderer, Scene } from 'three';
import { GLTF_Loader } from '@/threeJS/motion_loader/gltf_loader';

export class GLTF_Player {
  public gltf_player_object: Updatable;
  public is_playing: boolean = false;
  private gltf_loader_object: GLTF_Loader;
  private frame_count: number;
  private frame_index: number = 0;
  private fps: number = 30;
  private duration: number = 0;
  private sampleRate: number = 1 / 30;

  private on_frame_changed_callback?: (frameIndex: number) => void;

  constructor(gltf_loader_object: GLTF_Loader) {
    this.gltf_loader_object = gltf_loader_object;
    this.duration = gltf_loader_object.duration;
    this.frame_count = Math.floor(this.duration * this.fps);
    this.is_playing = false;
    this.frame_index = 0;

    this.gltf_player_object = {
      tick: async (delta: number) => {
        if (this.is_playing) this.update(delta);
         this.gltf_loader_object.update_virtual_markers();
         this.gltf_loader_object.update_bone_markers();
      },
    };
  }

  set_on_frame_changed_callback(cb: (frameIndex: number) => void) {
    this.on_frame_changed_callback = cb;
  }

  go_to_frame(frame_index: number) {
    if (!this.gltf_loader_object.mixer) return;
    
    this.frame_index = Math.max(0, Math.min(frame_index, this.frame_count));
    
    // Simple time calculation - no track dependency!
    const time = this.frame_index * this.sampleRate;
    const clampedTime = Math.min(time, this.duration - 0.001);
    
    this.gltf_loader_object.mixer.setTime(clampedTime);
    
    if (this.on_frame_changed_callback) {
      this.on_frame_changed_callback(this.frame_index);
    }
  }

  update(delta: number) {
    if (!this.gltf_loader_object.mixer) return;
    
    this.gltf_loader_object.mixer.update(delta);
    
    // Calculate current frame based on time
    const currentTime = this.gltf_loader_object.mixer.time;
    const calculatedFrame = Math.floor(currentTime * this.fps);
    
    if (calculatedFrame !== this.frame_index) {
      this.frame_index = calculatedFrame;
      
      if (this.on_frame_changed_callback) {
        this.on_frame_changed_callback(this.frame_index);
      }
    }
    
    // Stop at the end
    if (currentTime >= this.duration) {
      this.is_playing = false;
      // this.gltf_loader_object.close_recording();
    }
  }

  async play_pause() {
        // toggle play/pause
    if (this.frame_index >= this.frame_count) {
      this.go_to_frame(0);
      this.is_playing = true;
      if (this.gltf_loader_object.clipAction) {
        this.gltf_loader_object.clipAction.play();
      }
      return;
    }
    this.is_playing = !this.is_playing;
    if (this.is_playing && this.gltf_loader_object.clipAction) {
      this.gltf_loader_object.clipAction.play();
    }
  }

  pause() {
    this.is_playing = false;
    if (this.gltf_loader_object.mixer) {
      this.gltf_loader_object.mixer.setTime(0);
    }
  }

  get_frame_count(): number {
    return this.frame_count;
  }

  get_frame_index(): number {
    return this.frame_index;
  }

  dispose() {
    if (this.gltf_loader_object.mixer) {
      this.gltf_loader_object.mixer.stopAllAction();
    }
  }

  async render_thumbnail(
    frameIndex: number,
    scene: Scene,
    camera: PerspectiveCamera,
    width: number = 260,
    height: number = 190,
    renderer: WebGLRenderer,
  ): Promise<string> {
    renderer.setSize(width, height, false);
    // save frame
    const previous_frame = this.frame_index;
    this.go_to_frame(frameIndex);

    renderer.render(scene, camera);

    const dataUrl = renderer.domElement.toDataURL();
    this.go_to_frame(previous_frame);
    return dataUrl;
  }
}