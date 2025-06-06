export class NumpyTimeline 
{
  constructor(npyMotionObject) 
  {
    this.npyMotionObject = npyMotionObject;
    this.frameCount = npyMotionObject.frameCount;
    this.container = document.getElementById('timeline-container');
    this.slider = document.getElementById('frame-slider');
    this.label = document.getElementById('frame-label');
    this.slider.type = 'range';
    this.slider.min = 0;
    this.slider.max = this.frameCount;
    this.slider.step = 1;
    this.slider.value = 0;

    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.isUserDragging = false;

    this.fps = npyMotionObject.fps;
    // 1 / fps gives us the duration of one frame in seconds
    // cause we use three.js delta, we need to convert it to seconds
    this.frameDuration = 1 / this.fps;

    this._onFrameChange = null;
    this.npyTimelineObject = {};
    this.container.appendChild(this.slider);
    this.label.textContent = `Frame: 0 / ${this.frameCount}`;

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') this.play_pause();
      if (e.code === 'KeyS') this.stop();
    });

    // input-Event executes always when the slider is moved
    this.slider.addEventListener('input', (e) => 
    {
        this.currentFrame = parseFloat(e.target.value);
        this.gotoFrame(this.currentFrame);
        this.label.textContent = `Frame: ${this.currentFrame} / ${this.frameCount}`;
    });

    this.npyTimelineObject.tick = (delta) =>
    {
      if (this.npyMotionObject.isPlaying) this.update(delta);
    }

  }

  update(delta) 
  {
    if (this.isUserDragging || !this.npyMotionObject.isPlaying) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.frameDuration) 
    {
      this.elapsedTime -= this.frameDuration;
      this.currentFrame++;
      
      if (this.currentFrame >= this.frameCount) 
      {
        this.currentFrame = this.frameCount;
        this.npyMotionObject.isPlaying = false;
      }
      this.gotoFrame(this.currentFrame);
      this.slider.value = this.currentFrame;
      this.label.textContent = `Frame: ${this.currentFrame} / ${this.frameCount}`;
    }
  }

  play_pause() 
  {
    // toggle play/pause
    this.npyMotionObject.isPlaying = !this.npyMotionObject.isPlaying;
    if (this.currentFrame >= this.frameCount) 
    {
      this.currentFrame = 0;
      this.slider.value = 0;
      this.label.textContent = `Frame: ${this.currentFrame} / ${this.frameCount}`;
    }
  }

  stop() 
  {
    this.currentFrame = 0;
    this.slider.value = 0;
    this.npyMotionObject.isPlaying = false;
    this.label.textContent = `Frame: ${this.currentFrame} / ${this.frameCount}`;
  }


  gotoFrame(frameIndex) 
  {
    this.currentFrame = Math.max(0, Math.min(frameIndex, this.frameCount));
    // avoid index mismatch
    if (this.currentFrame < this.frameCount) 
    {
      this.npyMotionObject.gotoFrame(this.currentFrame);
    }
  }
}
