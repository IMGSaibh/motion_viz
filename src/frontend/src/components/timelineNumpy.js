export class NumpyTimeline 
{
  constructor(npyObject) 
  {
    this.npyTimelineObject = {};
    this.npyObject = npyObject;
    this.frameCount = npyObject.frameCount;
    this.container = document.getElementById('timeline-container');
    this.slider = document.getElementById('frame-slider');
    this.label = document.getElementById('frame-label');
    this.slider.type = 'range';
    this.slider.min = 0;
    this.slider.max = this.frameCount;
    this.slider.step = 1;
    this.slider.value = 0;

    this.frameIdx = 0;
    this.elapsedTime = 0;

    this.fps = npyObject.fps;
    // 1 / fps gives us the duration of one frame in seconds
    // cause we use three.js delta, we need to convert it to seconds
    this.frameDuration = 1 / this.fps;

    this._onFrameChange = null;
    this.container.appendChild(this.slider);
    this.label.textContent = `Frame: 0 / ${this.frameCount}`;

    window.addEventListener('keydown', (e) => 
    {
      if (e.code === 'Space') this.play_pause();
      if (e.code === 'KeyS') this.stop();
    });

    // input-Event executes always when the slider is moved
    this.slider.addEventListener('input', (e) => 
    {
        this.frameIdx = parseFloat(e.target.value);
        this.gotoFrame(this.frameIdx);
        this.label.textContent = `Frame: ${this.frameIdx} / ${this.frameCount}`;
    });

    this.npyTimelineObject.tick = (delta) =>
    {
      if (this.npyObject.isPlaying) this.update(delta);
    }

  }

  update(delta) 
  {
    if (!this.npyObject.isPlaying) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.frameDuration) 
    {
      this.elapsedTime -= this.frameDuration;
      this.frameIdx++;
      
      if (this.frameIdx >= this.frameCount) 
      {
        this.frameIdx = this.frameCount;
        this.npyObject.isPlaying = false;
      }
      this.gotoFrame(this.frameIdx);
      this.slider.value = this.frameIdx;
      this.label.textContent = `Frame: ${this.frameIdx} / ${this.frameCount}`;
    }
  }

  play_pause() 
  {
    // toggle play/pause
    this.npyObject.isPlaying = !this.npyObject.isPlaying;
    if (this.frameIdx >= this.frameCount) 
    {
      this.frameIdx = 0;
      this.slider.value = 0;
      this.label.textContent = `Frame: ${this.frameIdx} / ${this.frameCount}`;
    }
  }

  stop() 
  {
    this.frameIdx = 0;
    this.slider.value = 0;
    this.npyObject.isPlaying = false;
    this.label.textContent = `Frame: ${this.frameIdx} / ${this.frameCount}`;
  }


  gotoFrame(frameIndex) 
  {
    this.frameIdx = Math.max(0, Math.min(frameIndex, this.frameCount));
    // avoid index mismatch in setJointPositions()
    // last frameIdx leads last undefined joint positions 
    if (this.frameIdx < this.frameCount) 
    {
      this.npyObject.setJointPositions(this.frameIdx);
    }
  }
}
