export class Timeline {
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
    this.isUserDragging = false;
    this.timelineObject = {};
    this.container.appendChild(this.slider);
    this.label.textContent = `Frame: 0 / ${this.motionObject.frameCount}`;
    
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') this.play();
      if (e.code === 'KeyS') this.stop();
      if (e.code === 'KeyP') this.pause();
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
    if (this.isUserDragging || !this.motionObject.isPlaying) return;
    else if (this.getCurrentFrame() == this.motionObject.frameCount) 
    {
      this.stop();
      return;
    }
    this.motionObject.clipAction.play();
    this.currentTime = this.motionObject.mixer.time;
    this.slider.value = this.getCurrentFrame();
    this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.motionObject.frameCount}`;

  }

  getCurrentFrame() 
  {
    return Math.floor(this.motionObject.mixer.time * this.motionObject.fps);
  }

  play() 
  {
    this.motionObject.isPlaying = true;
    this.motionObject.clipAction.play();
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

  pause() 
  {
    this.motionObject.isPlaying = false;
  }
}

