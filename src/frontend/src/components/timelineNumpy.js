

export class NumpyTimeline {
  constructor(npyMotionObject) {
    this.npyMotionObject = npyMotionObject;
    this.currentFrame = 0;
    this.totalFrames = this.npyMotionObject.frameCount;
    this.isPlaying = false;
    this.fps = this.npyMotionObject.fps;
    this.interval = null;
    
    this.container = document.getElementById('timeline-container');
    this.slider = document.getElementById('frame-slider');
    this.label = document.getElementById('frame-label');
    
    this.slider.type = 'range';
    this.slider.min = 0;
    this.slider.max = this.npyMotionObject.frameCount;
    this.slider.step = 1;
    this.slider.value = 0;

    this.container.appendChild(this.slider);
    this.label.textContent = `Frame: 0 / ${this.npyMotionObject.frameCount}`;

    this.onPlayCallback = null;
    this.onPauseCallback = null;
    this.onFrameChangeCallback = null;


    document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        timeline.toggle(); // Start/Pause
    } else if (e.code === 'ArrowRight') {
        timeline.gotoFrame(timeline.getFrame() + 1);
    } else if (e.code === 'ArrowLeft') {
        timeline.gotoFrame(timeline.getFrame() - 1);
    }
    });


  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this._startInterval();
    if (this.onPlayCallback) this.onPlayCallback();
  }

  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    clearInterval(this.interval);
    if (this.onPauseCallback) this.onPauseCallback();
  }

  toggle() {
    this.isPlaying ? this.pause() : this.play();
  }

    // The npyMotionObject.setJointPositions(frameIdx) adjusts the scene directly, so no interpolation is necessary
    // Pausing, jumping and resetting thus remain synchronized frame-exactly
  _startInterval() 
  {
    const frameDuration = 1000 / this.fps;
    this.interval = setInterval(() => {
        if (this.currentFrame >= this.totalFrames - 1) 
        {
            this.pause();
            return;
        }
        this.currentFrame++;
        this.npyMotionObject.gotoFrame(this.currentFrame);
      if (this.onFrameChangeCallback) this.onFrameChangeCallback(this.currentFrame);
        this.label.textContent = `Frame: ${this.currentFrame} / ${this.npyMotionObject.frameCount}`;
    
    }, frameDuration);
  }

  gotoFrame(frame) {
    this.currentFrame = Math.max(0, Math.min(frame, this.totalFrames - 1));
    this.npyMotionObject.gotoFrame(this.currentFrame);
    if (this.onFrameChangeCallback) this.onFrameChangeCallback(this.currentFrame);
  }

  onPlay(callback) {
    this.onPlayCallback = callback;
  }

  onPause(callback) {
    this.onPauseCallback = callback;
  }

  onFrameChange(callback) {
    this.onFrameChangeCallback = callback;
  }

  reset() {
    this.pause();
    this.gotoFrame(0);
  }

  getFrame() {
    return this.currentFrame;
  }

  getFrameCount() {
    return this.totalFrames;
  }

  setFPS(fps) {
    this.fps = fps;
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }
}
