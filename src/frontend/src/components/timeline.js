

export class Timeline {
  constructor(motionObject) 
  {
    this.container = document.getElementById('timeline-container');

    this.slider = document.getElementById('frame-slider');
    this.label = document.getElementById('frame-label');
    this.slider.type = 'range';
    this.fps = motionObject.fps;
    this.mixer = motionObject.mixer;
    this.frameCount = motionObject.frameCount;
    this.duration = motionObject.duration;
    this.clipAction = motionObject.clipAction;
    this.slider.min = 0;
    this.slider.max = this.frameCount;
    this.slider.step = 1;
    this.slider.value = 0;
    
    this.currentTime = 0;
    this.isUserDragging = false;

    this.container.appendChild(this.slider);
    this.label.textContent = `Frame: 0 / ${this.frameCount}`;


    // Events for Drag
    this.slider.addEventListener('pointerdown', () => 
    {
      this.isUserDragging = true;
    });

    document.addEventListener('pointerup', () => 
    {
      this.isUserDragging = false;
    });

    // input-Event executes always when the slider is moved
    this.slider.addEventListener('input', (e) => 
    {
      if (this.mixer) 
      {
        this.currentTime = parseFloat(e.target.value);
        this.mixer.setTime(this.currentTime / this.fps);
        this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.frameCount}`;

      }
    });

    // Timeline object, which ticks within the animation loop
    this.timelineObject = 
    {
      tick: (delta) => this.update(delta)
    };
  }

  update(delta) 
  {
    if (!this.mixer || this.isUserDragging) return;
    else if (this.mixer.time >= this.duration) 
    {
      this.reset();
      return;
    }
    this.clipAction.play();
    this.currentTime = this.mixer.time;
    this.slider.value = this.getCurrentFrame();
    this.label.textContent = `Frame: ${this.getCurrentFrame()} / ${this.frameCount}`;

  }

  getCurrentFrame() 
  {
    if (!this.mixer) return 0;
    return Math.floor(this.mixer.time * this.fps);
  }

  reset() 
  {
    this.currentTime = 0;
    if (this.mixer) this.mixer.setTime(0);
    this.slider.value = 0;
    this.clipAction.reset();
    this.clipAction.stop();
  }
}

