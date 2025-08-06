import { NPY_loader } from '@/threeJS/motion_loader/npy_loader';
import { Loop, Updatable } from '@/threeJS/system/loop';
import { PerspectiveCamera, WebGLRenderer, Scene} from 'three'

export class NPY_Player 
{
  npy_player_object: Updatable;
  private npy_loader_object: NPY_loader;
  private fps: number;
  private frame_index: number;
  private frame_count: number = 0;
  private elapsedTime: number;
  private frameDuration: number;
  private isPlaying: boolean = false;

  constructor(npy_loader_object: NPY_loader) 
  {
    this.npy_loader_object = npy_loader_object;    
    this.frame_count = npy_loader_object.frameCount;

    this.npy_player_object = 
    {
      tick: (delta: number) => 
      {
        if (this.isPlaying) this.update(delta)
      }
    }

    this.frame_index = 0;
    this.elapsedTime = 0;
    this.fps = npy_loader_object.fps;
    // 1 / fps gives us the duration of one frame in seconds
    // cause we use three.js delta, we need to convert it to seconds
    this.frameDuration = 1 / this.fps;
  }

  update(delta: number) 
  {
    if (!this.isPlaying) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.frameDuration) 
    {
      this.elapsedTime -= this.frameDuration;
      this.frame_index++;
      
      if (this.frame_index >= this.frame_count) 
      {
        this.frame_index = this.frame_count;
        this.isPlaying = false;
      }
      this.go_to_frame(this.frame_index);
    }
  }

  get_frame_count(): number
  {
    return this.frame_count;
  }

  get_frame_index(): number
  {
    return this.frame_index;
  }

  play_pause() 
  {
    // toggle play/pause
    this.isPlaying = !this.isPlaying;
    if (this.frame_index >= this.frame_count) 
    {
      this.frame_index = 0;
    }
  }

  stop() 
  {
    this.frame_index = 0;
    this.isPlaying = false;
  }

  go_to_frame(frameIndex: number) 
  {
    this.frame_index = Math.max(0, Math.min(frameIndex, this.frame_count));
    // avoid index mismatch in set_sphere_for_joint_positions()
    // last frameIdx leads last undefined joint positions 
    if (this.frame_index < this.frame_count) 
    {
      this.npy_loader_object.update_skeleton(this.frame_index);
    }
  }

  dispose() 
  {
    // const index = this.loop.updatables.indexOf(this.npy_player_object);
    // if (index !== -1) 
    // {
    //   this.loop.updatables.splice(index, 1);
    // }
  }

  // needs to be a seperate class with dispose and pi pa po
  async renderThumbnail(
    frameIndex: number,
    scene: Scene,
    camera: PerspectiveCamera,
    width: number = 260,
    height: number = 190,
    renderer: WebGLRenderer
  ): Promise<string> 
  {
    renderer.setSize(width, height, false);

    // save frame
    const previousFrame = this.frame_index;
    this.go_to_frame(frameIndex);

    renderer.render(scene, camera);

    const dataUrl = renderer.domElement.toDataURL();

    this.go_to_frame(previousFrame);

    return dataUrl;
  }

}
