export class Timeline {
  constructor(motionObject) 
  {
    this.container = document.getElementById('timeline-container');
    this.motionObject = motionObject;
    this.slider = document.getElementById('frame-slider');
    this.label = document.getElementById('frame-label');
    this.slider.type = 'range';
    this.slider.min = 0;
    this.slider.max = this.motionObject.frameCount;
    this.slider.step = 1;
    this.slider.value = 0;
    this.currentTime = 0;
    this.isUserDragging = false;
    this.timelineObject = {};
    this.container.appendChild(this.slider);
    this.label.textContent = `Frame: 0 / ${this.motionObject.frameCount}`;
    
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') this.motionObject.play();
      if (e.code === 'KeyS') this.motionObject.stop();
      if (e.code === 'KeyP') this.motionObject.pause();
    });


    this.slider.addEventListener('pointerdown', () => 
    {
      this.isUserDragging = true;
      this.motionObject.isPlaying = false;
    });

    document.addEventListener('pointerup', () => 
    {
      this.isUserDragging = false;
      this.motionObject.isPlaying = false;
    });

    // input-Event executes always when the slider is moved
    this.slider.addEventListener('input', (e) => 
    {
      if (this.motionObject.mixer) 
      {
        // TODO: check if this can be implemented without clipAction.Play() 
        this.motionObject.clipAction.play();
        this.currentTime = parseFloat(e.target.value);
        this.motionObject.mixer.setTime(this.currentTime / this.motionObject.fps);
        this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.motionObject.frameCount}`;
        console.log(`Slider is moved`);
      }
    });

    this.timelineObject.tick = (delta) =>
    {
      if (this.motionObject.isPlaying) this.update(delta);
    }
  }

  update(delta) 
  {
    if (!this.motionObject.mixer || this.isUserDragging || !this.motionObject.isPlaying) return;
    else if (this.motionObject.mixer.time >= this.motionObject.duration) 
    {
      this.stop();
      return;
    }
    this.motionObject.play();
    this.currentTime = this.motionObject.mixer.time;
    this.slider.value = this.getCurrentFrame();
    this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.motionObject.frameCount}`;

  }

  getCurrentFrame() 
  {
    return Math.floor(this.motionObject.mixer.time * this.motionObject.fps);
  }

  stop() 
  {
    this.currentTime = 0;
    this.slider.value = 0;
    this.motionObject.isPlaying = false;
    this.motionObject.clipAction.stop();
    this.motionObject.mixer.time = 0;
    this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.motionObject.frameCount}`;
  }
}

