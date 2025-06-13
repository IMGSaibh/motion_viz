export class BVH_Player 
{
  constructor(bvh_loader_object) 
  {
    this.bvh_player_object = {};
    this.bvh_loader_object = bvh_loader_object;
    this.container = document.getElementById('timeline-container');
    this.slider = document.getElementById('frame-slider');
    this.label = document.getElementById('frame-label');
    this.slider.max = this.bvh_loader_object.frameCount;
    this.slider.type = 'range';
    this.slider.min = 0;
    this.slider.step = 1;
    this.slider.value = 0;
    this.currentTime = 0;
    this.container.appendChild(this.slider);
    this.label.textContent = `Frame: 0 / ${this.bvh_loader_object.frameCount}`;
    
    window.addEventListener('keydown', (e) => 
    {
      if (e.code === 'Space') this.play_pause();
      if (e.code === 'KeyS') this.stop();
    });

    // input-Event executes always when the slider is moved
    this.slider.addEventListener('input', (e) => 
    {
      if (this.bvh_loader_object.mixer) 
      {
        this.bvh_loader_object.clipAction.play();
        this.currentTime = parseFloat(e.target.value);
        this.bvh_loader_object.mixer.setTime(this.currentTime / this.bvh_loader_object.fps);
        this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.bvh_loader_object.frameCount}`;
      }
    });

    this.bvh_player_object.tick = (delta) =>
    {
      if (this.bvh_loader_object.isPlaying) this.update(delta);
    }
  }

  update(delta) 
  {
    if (!this.bvh_loader_object.isPlaying) return;
    else if (this.getCurrentFrame() == this.bvh_loader_object.frameCount) 
    {
      this.bvh_loader_object.isPlaying = false;
    }
    this.bvh_loader_object.clipAction.play();
    this.bvh_loader_object.mixer.update(delta);
    this.currentTime = this.bvh_loader_object.mixer.time;
    this.slider.value = this.getCurrentFrame();
    this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.bvh_loader_object.frameCount}`;

  }


  play_pause() 
  {
    // toggle play/pause
    this.bvh_loader_object.isPlaying = !this.bvh_loader_object.isPlaying;

    if(this.getCurrentFrame() == this.bvh_loader_object.frameCount)
    {
      this.bvh_loader_object.mixer.setTime(0);
      this.slider.value = 0;
      this.currentTime = 0;
      this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.bvh_loader_object.frameCount}`;
    }
  }

  stop() 
  {
    this.currentTime = 0;
    this.slider.value = 0;
    this.bvh_loader_object.isPlaying = false;
    this.bvh_loader_object.mixer.time = 0;
    this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.bvh_loader_object.frameCount}`;
  }

  getCurrentFrame() 
  {
    return Math.floor(this.bvh_loader_object.mixer.time * this.bvh_loader_object.fps);
  }

}

