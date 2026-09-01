import { NPY_loader } from '@/threeJS/motion_loader/npy_loader';
import { Updatable } from '@/threeJS/system/loop';
import { PerspectiveCamera, WebGLRenderer, Scene } from 'three';

export class NPY_Player {
  public npy_player_object: Updatable;
  public is_playing: boolean = false;
  private npy_loader_object: NPY_loader;
  private fps: number = 0;
  private frame_index: number = 0;
  private frame_count: number = 0;
  private elapsedTime: number = 0;
  private frameDuration: number = 0;

  private on_frame_changed_callback?: (frameIndex: number) => void;

  constructor(npy_loader_object: NPY_loader) {
    this.npy_loader_object = npy_loader_object;
    this.frame_count = npy_loader_object.frameCount;

    this.npy_player_object = {
      tick: (delta: number) => {
        if (this.is_playing) this.update(delta);
      },
    };

    this.frame_index = 0;
    this.elapsedTime = 0;
    this.fps = npy_loader_object.fps;
    // Three.js supplies delta time in seconds, so 1 / fps is the playback duration of one frame.
    this.frameDuration = 1 / this.fps;
  }

  set_on_frame_changed_callback(cb: (frameIndex: number) => void) {
    this.on_frame_changed_callback = cb;
  }

  update(delta: number) {
    if (!this.is_playing) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.frameDuration) {
      this.elapsedTime -= this.frameDuration;
      this.frame_index++;

      if (this.frame_index >= this.frame_count) {
        this.frame_index = this.frame_count;
        this.is_playing = false;
      }
      this.go_to_frame(this.frame_index);
      if (this.on_frame_changed_callback) {
        this.on_frame_changed_callback(this.frame_index);
      }
    }
  }

  get_frame_count(): number {
    return this.frame_count;
  }

  get_frame_index(): number {
    return this.frame_index;
  }

  play_pause() {
    // toggle play/pause
    this.is_playing = !this.is_playing;
    if (this.frame_index >= this.frame_count) {
      this.frame_index = 0;
    }
  }

  pause() {
    this.is_playing = false;
  }

  go_to_frame(frame_index: number) {
    this.frame_index = Math.max(0, Math.min(frame_index, this.frame_count));
    // The terminal frame index marks playback completion and has no matching joint-position entry.
    if (this.frame_index < this.frame_count) {
      this.npy_loader_object.update_skeleton(this.frame_index);
    }
  }

  dispose() {
    // TODO: Let only the manager dispose the loader to keep resource ownership unambiguous.
    this.npy_loader_object.dispose();
  }

  // Thumbnail rendering temporarily changes the player frame and restores it before returning.
  async render_thumbnail(
    frame_index: number,
    scene: Scene,
    camera: PerspectiveCamera,
    width: number = 260,
    height: number = 190,
    renderer: WebGLRenderer,
  ): Promise<string> {
    renderer.setSize(width, height, false);

    // Preserve interactive playback state while rendering the requested frame off-screen.
    const previous_frame = this.frame_index;
    this.go_to_frame(frame_index);

    renderer.render(scene, camera);

    const dataUrl = renderer.domElement.toDataURL();

    this.go_to_frame(previous_frame);

    return dataUrl;
  }
}
