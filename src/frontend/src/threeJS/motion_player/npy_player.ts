import { NPY_loader } from '@/threeJS/motion_loader/npy_loader';
import { Loop, Updatable } from '@/threeJS/system/loop';
import { PerspectiveCamera, WebGLRenderer, Scene} from 'three'

export class NPY_Player 
{
  npy_player_object: Updatable;
  npy_loader_object: NPY_loader;
  frameCount: number;
  frameIdx: number;
  elapsedTime: number;
  fps: number;
  frameDuration: number;
  isPlaying: boolean = false;
  public onFrameChanged?: (frameIdx: number) => void;

  constructor(npy_loader_object: NPY_loader) 
  {
    this.npy_loader_object = npy_loader_object;    
    this.frameCount = npy_loader_object.frameCount;

    this.npy_player_object = 
    {
      tick: (delta: number) => 
      {
        if (this.isPlaying) this.update(delta)
      }
    }

    this.frameIdx = 0;
    this.elapsedTime = 0;

    this.fps = npy_loader_object.fps;
    // 1 / fps gives us the duration of one frame in seconds
    // cause we use three.js delta, we need to convert it to seconds
    this.frameDuration = 1 / this.fps;

    // // input-Event executes always when the slider is moved
    // this.slider.addEventListener('input', (e) => 
    // {
    //     const target = e.target as HTMLInputElement;
    //     this.frameIdx = parseFloat(target.value);
    //     this.gotoFrame(this.frameIdx);
    //     this.label.textContent = `Frame: ${this.frameIdx} / ${this.frameCount}`;
    // });
  }

  update(delta: number) 
  {
    if (!this.isPlaying) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.frameDuration) 
    {
      this.elapsedTime -= this.frameDuration;
      this.frameIdx++;
      
      if (this.frameIdx >= this.frameCount) 
      {
        this.frameIdx = this.frameCount;
        this.isPlaying = false;
      }
      this.gotoFrame(this.frameIdx);
      if (this.onFrameChanged) 
      {
            this.onFrameChanged(this.frameIdx);
      }
    }
  }

  play_pause() 
  {
    // toggle play/pause
    this.isPlaying = !this.isPlaying;
    console.log("this.isPlaying in player " + this.isPlaying)
    if (this.frameIdx >= this.frameCount) 
    {
      this.frameIdx = 0;
    }
  }

  stop() 
  {
    this.frameIdx = 0;
    this.isPlaying = false;
  }

  gotoFrame(frameIndex: number) 
  {
    this.frameIdx = Math.max(0, Math.min(frameIndex, this.frameCount));
    // avoid index mismatch in set_sphere_for_joint_positions()
    // last frameIdx leads last undefined joint positions 
    if (this.frameIdx < this.frameCount) 
    {
      this.npy_loader_object.update_skeleton(this.frameIdx);
    }
  }

  get_frame_index()
  {
    return this.frameIdx;
  }

  dispose() 
  {
    // const index = this.loop.updatables.indexOf(this.npy_player_object);
    // if (index !== -1) 
    // {
    //   this.loop.updatables.splice(index, 1);
    // }
  }

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
    const previousFrame = this.frameIdx;
    this.gotoFrame(frameIndex);

    renderer.render(scene, camera);

    const dataUrl = renderer.domElement.toDataURL();

    this.gotoFrame(previousFrame);

    return dataUrl;
  }

}
