export class Timeline 
{
  constructor(motionObject) 
  {
    this.motionObject = motionObject;
    this.container = document.getElementById('timeline-container');
    this.slider = document.getElementById('frame-slider');
    this.label = document.getElementById('frame-label');
    this.slider.type = 'range';
    this.slider.min = 0;
    this.slider.max = this.motionObject.frameCount;
    this.slider.step = 1;
    this.slider.value = 0;
    this.currentTime = 0;
    this.timelineObject = {};
    this.container.appendChild(this.slider);
    this.label.textContent = `Frame: 0 / ${this.motionObject.frameCount}`;
    
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') this.play_pause();
      if (e.code === 'KeyS') this.stop();
    });

    // input-Event executes always when the slider is moved
    this.slider.addEventListener('input', (e) => 
    {
      if (this.motionObject.mixer) 
      {
        this.motionObject.clipAction.play();
        this.currentTime = parseFloat(e.target.value);
        this.motionObject.mixer.setTime(this.currentTime / this.motionObject.fps);
        this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.motionObject.frameCount}`;
      }
    });

    this.timelineObject.tick = (delta) =>
    {
      if (this.motionObject.isPlaying) this.update(delta);
    }
  }

  update(delta) 
  {
    if (!this.motionObject.isPlaying) return;
    else if (this.getCurrentFrame() == this.motionObject.frameCount) 
    {
      this.motionObject.isPlaying = false;
    }
    this.motionObject.clipAction.play();
    this.currentTime = this.motionObject.mixer.time;
    this.slider.value = this.getCurrentFrame();
    this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.motionObject.frameCount}`;

  }


  play_pause() 
  {
    // toggle play/pause
    this.motionObject.isPlaying = !this.motionObject.isPlaying;
    if(this.getCurrentFrame() == this.motionObject.frameCount)
    {
      this.motionObject.mixer.setTime(0);
      this.slider.value = 0;
      this.currentTime = 0;
      this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.motionObject.frameCount}`;
    }
  }

  stop() 
  {
    this.currentTime = 0;
    this.slider.value = 0;
    this.motionObject.isPlaying = false;
    this.motionObject.mixer.time = 0;
    this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.motionObject.frameCount}`;
  }

  getCurrentFrame() 
  {
    return Math.floor(this.motionObject.mixer.time * this.motionObject.fps);
  }

}

