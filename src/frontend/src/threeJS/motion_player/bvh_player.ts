import { BVH_loader } from '@/threeJS/motion_loader/bvh_loader';
import { Loop, Updatable } from '@/threeJS/system/loop';

export class BVH_Player 
{
    bvh_player_object: Updatable;
    bvh_loader_object: BVH_loader;
    container: HTMLElement;
    slider: HTMLInputElement;
    label: HTMLElement;
    currentTime: number;
    frameCount: number; 
    isPlaying: boolean;
    loop: Loop;


  constructor(bvh_loader_object: BVH_loader, loop: Loop) 
  {
    this.bvh_loader_object = bvh_loader_object;
    this.frameCount = bvh_loader_object.frameCount;

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
    this.slider = slider as HTMLInputElement;
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
    this.currentTime = 0;
    this.isPlaying = false;
    this.container.appendChild(this.slider);
    this.label.textContent = `Frame: 0 / ${this.bvh_loader_object.frameCount}`;
    this.loop = loop;

    
    window.addEventListener('keydown', (e) => 
    {
      if (e.code === 'Space') this.play_pause();
      if (e.code === 'KeyS') this.stop();
    });

    // input-Event executes always when the slider is moved
    this.slider.addEventListener('input', (e) => 
    {
      if (this.bvh_loader_object.mixer && this.bvh_loader_object.clipAction) 
      {
        this.bvh_loader_object.clipAction.play();
        const targetValue = parseFloat((e.target as HTMLInputElement).value);
        // this.currentTime = parseFloat(e.target.value);
        this.currentTime = targetValue; 
        this.bvh_loader_object.mixer!.setTime(this.currentTime / this.bvh_loader_object.fps);
        this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.bvh_loader_object.frameCount}`;
      }
    });

    this.bvh_player_object = 
    {
      tick: (delta: number) => 
      {
        if (this.isPlaying) this.update(delta)
      }
    }

    this.loop.updatables.push(this.bvh_player_object);

  }

  update(delta: number) 
  {
    this.bvh_loader_object.clipAction!.play();
    this.bvh_loader_object.mixer!.update(delta);
    this.currentTime = this.bvh_loader_object.mixer!.time;

    if (!this.isPlaying) return;
    else if (this.getCurrentFrame() >= this.bvh_loader_object.frameCount) 
    {
      this.isPlaying = false;
    }


    this.slider.value = this.getCurrentFrame().toString();
    this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.bvh_loader_object.frameCount}`;

  }


  play_pause() 
  {
    // toggle play/pause
    this.isPlaying = !this.isPlaying;
    if(this.getCurrentFrame() >= this.bvh_loader_object.frameCount)
    {
      this.bvh_loader_object.mixer!.setTime(0);
      this.slider.value = '0';
      this.currentTime = 0;
      this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.bvh_loader_object.frameCount}`;
    }
  }

  stop() 
  {
    this.currentTime = 0;
    this.slider.value = '0';
    this.isPlaying = false;
    this.bvh_loader_object.mixer!.time = 0;
    this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.bvh_loader_object.frameCount}`;
  }

  getCurrentFrame() 
  {
    if (!this.bvh_loader_object.mixer) return 0;
    return Math.floor(this.bvh_loader_object.mixer!.time * this.bvh_loader_object.fps);
  }

  dispose() 
  {
    const index = this.loop.updatables.indexOf(this.bvh_player_object);
    if (index !== -1) 
    {
      this.loop.updatables.splice(index, 1);
    }
    this.bvh_loader_object.mixer?.stopAllAction();
    this.bvh_loader_object.mixer = null;
  }


}

