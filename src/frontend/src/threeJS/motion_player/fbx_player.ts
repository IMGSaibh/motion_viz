import { Updatable } from '@/threeJS/system/loop';
import { PerspectiveCamera, WebGLRenderer, Scene } from 'three';
import { FBX_Loader } from '@/threeJS/motion_loader/fbx_loader';

export class FBX_Player {
  public fbx_player_object: Updatable;
  public is_playing: boolean = false;
  private fbx_loader_object: FBX_Loader;
  private frame_count: number;
  private frame_index: number = 0;

  private on_frame_changed_callback?: (frameIndex: number) => void;

  constructor(fbx_loader_object: FBX_Loader) {
    this.fbx_loader_object = fbx_loader_object;
    // The terminal FBX keyframe represents the clip boundary and is excluded from the slider.
    this.frame_count = fbx_loader_object.keyframeCount - 1;
    this.is_playing = false;
    this.frame_index = 0;

    this.fbx_player_object = {
      tick: (delta: number) => {
        if (this.is_playing) this.update(delta);
      },
    };
  }

  set_on_frame_changed_callback(cb: (frameIndex: number) => void) {
    this.on_frame_changed_callback = cb;
  }

  update(delta: number) {
    this.fbx_loader_object.mixer!.update(delta);
    const time = this.fbx_loader_object.mixer!.time;
    // Convert mixer time back to the nearest discrete slider frame.
    const track = this.fbx_loader_object.clipAction!.getClip().tracks[0];

    let closest_index = 0;
    let min_diff = Infinity;

    for (let i = 0; i < track.times.length; i++) {
      const diff = Math.abs(track.times[i] - time);
      if (diff < min_diff) {
        min_diff = diff;
        closest_index = i;
      }
    }

    if (this.frame_index >= this.frame_count) {
      this.frame_index = this.frame_count;
      this.is_playing = false;
    }

    this.frame_index = closest_index;

    if (this.on_frame_changed_callback) {
      this.on_frame_changed_callback(this.frame_index);
    }
    this.go_to_frame(this.frame_index);
  }

  play_pause() {
    // toggle play/pause
    if (this.frame_index >= this.frame_count) {
      this.go_to_frame(0);
      this.is_playing = true;
      return;
    }
    this.is_playing = !this.is_playing;
    if (this.is_playing) {
      this.fbx_loader_object.clipAction!.play();
    }
  }

  pause() {
    this.is_playing = false;
    // this.fbx_loader_object.mixer!.setTime(0);
  }

  go_to_frame(frame_index: number) {
    if (!this.fbx_loader_object.mixer || !this.fbx_loader_object.clipAction) return;

    // Safety clamp
    this.frame_index = Math.max(0, Math.min(frame_index, this.frame_count));

    // Calculate the time value from the keyframe index
    const track = this.fbx_loader_object.clipAction.getClip().tracks[0];
    const time = track.times[this.frame_index];
    // Avoid seeking exactly to the clip duration because Three.js wraps it to the animation start.
    if (time >= this.fbx_loader_object.duration) {
      this.fbx_loader_object.mixer.setTime(this.fbx_loader_object.duration - 0.01);
      return;
    }

    this.fbx_loader_object.mixer.setTime(time);
  }

  get_frame_count(): number {
    return this.frame_count;
  }

  get_frame_index(): number {
    return this.frame_index;
  }

  dispose() {
    this.fbx_loader_object.mixer!.stopAllAction();
  }

  // Thumbnail rendering temporarily changes the player frame and restores it before returning.
  async render_thumbnail(
    frameIndex: number,
    scene: Scene,
    camera: PerspectiveCamera,
    width: number = 260,
    height: number = 190,
    renderer: WebGLRenderer,
  ): Promise<string> {
    renderer.setSize(width, height, false);
    // Preserve interactive playback state while rendering the requested frame off-screen.
    const previous_frame = this.frame_index;
    this.go_to_frame(frameIndex);

    renderer.render(scene, camera);

    const dataUrl = renderer.domElement.toDataURL();
    this.go_to_frame(previous_frame);
    return dataUrl;
  }
}
