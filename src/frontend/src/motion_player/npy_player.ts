import { NPY_loader } from '@/motion_loader/npy_loader';
import { Loop, Updatable } from '@/system/loop';
import { PerspectiveCamera, WebGLRenderer, Scene} from 'three'

export class NPY_Player 
{
  npy_player_object: Updatable;
  npy_loader_object: NPY_loader;
  frameCount: number;
  container: HTMLElement;
  slider: HTMLInputElement;
  label: HTMLElement;
  frameIdx: number;
  elapsedTime: number;
  fps: number;
  frameDuration: number;
  loop: Loop;
  isPlaying: boolean = false;

  constructor(npy_loader_object: NPY_loader, loop: Loop) 
  {
    this.npy_loader_object = npy_loader_object;    
    this.frameCount = npy_loader_object.frameCount;
    const container = document.getElementById('timeline-container');
    if (!container) 
    {
      throw new Error("Element with id 'timeline-container' not found.");
    }
    this.container = container;
    const slider = document.getElementById('frame-slider');
    if (!slider || !(slider instanceof HTMLInputElement)) 
    {
      throw new Error("Element with id 'frame-slider' not found or is not an input element.");
    }
    this.slider = slider;
    const label = document.getElementById('frame-label');
    if (!label) 
    {
      throw new Error("Element with id 'frame-label' not found.");
    }
    this.label = label;
    this.slider.type = 'range';
    this.slider.min = '0';
    this.slider.max = this.frameCount.toString();
    this.slider.step = '1';
    this.slider.value = '0';

    this.frameIdx = 0;
    this.elapsedTime = 0;

    this.fps = npy_loader_object.fps;
    // 1 / fps gives us the duration of one frame in seconds
    // cause we use three.js delta, we need to convert it to seconds
    this.frameDuration = 1 / this.fps;

    this.container.appendChild(this.slider);
    this.label.textContent = `Frame: 0 / ${this.frameCount}`;

    this.loop = loop;

    window.addEventListener('keydown', (e) => 
    {
      if (e.code === 'Space') this.play_pause();
      if (e.code === 'KeyS') this.stop();
    });

    // input-Event executes always when the slider is moved
    this.slider.addEventListener('input', (e) => 
    {
        const target = e.target as HTMLInputElement;
        this.frameIdx = parseFloat(target.value);
        this.gotoFrame(this.frameIdx);
        this.label.textContent = `Frame: ${this.frameIdx} / ${this.frameCount}`;
    });

    this.npy_player_object = 
    {
      tick: (delta: number) => 
      {
        if (this.isPlaying) this.update(delta)
      }
    }

    this.loop.updatables.push(this.npy_player_object);
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
      this.slider.value = this.frameIdx.toString();
      this.label.textContent = `Frame: ${this.frameIdx} / ${this.frameCount}`;
    }
  }

  play_pause() 
  {
    // toggle play/pause
    this.isPlaying = !this.isPlaying;
    if (this.frameIdx >= this.frameCount) 
    {
      this.frameIdx = 0;
      this.slider.value = '0';
      this.label.textContent = `Frame: ${this.frameIdx} / ${this.frameCount}`;
    }
  }

  stop() 
  {
    this.frameIdx = 0;
    this.slider.value = '0';
    this.isPlaying = false;
    this.label.textContent = `Frame: ${this.frameIdx} / ${this.frameCount}`;
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

  dispose() 
  {
    const index = this.loop.updatables.indexOf(this.npy_player_object);
    if (index !== -1) 
    {
      this.loop.updatables.splice(index, 1);
    }
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
