export class TimelineFBX 
{
  constructor(fbxObject) 
  {
    this.fbxTimelineObject = {};
    this.fbxObject = fbxObject;
    // -1 because the last keyframe is not included in the slider
    // fbx is keyframe based, so the keyframe count is the number of keyframes minus one
    this.keyframeCount = fbxObject.keyframeCount-1; 
    this.container = document.getElementById('timeline-container');
    this.slider = document.getElementById('frame-slider');
    this.label = document.getElementById('frame-label');
    this.slider.type = 'range';
    this.slider.min = 0;
    this.slider.max = this.keyframeCount;
    this.slider.step = 1;
    this.slider.value = 0;

    this.currentKeyFrame = 0;
    this.elapsedTime = 0;
    
    this.container.appendChild(this.slider);
    this.label.textContent = `Keyframe: 0 / ${this.keyframeCount}`;

    window.addEventListener('keydown', (e) => 
    {
      if (e.code === 'Space') this.play_pause();
      if (e.code === 'KeyS') this.stop();
    });

    // input-Event executes always when the slider is moved
    this.slider.addEventListener('input', (e) => 
    {
        this.fbxObject.clipAction.play();
        this.currentKeyFrame = parseFloat(e.target.value);
        this.gotoFrame(this.currentKeyFrame);
        this.label.textContent = `Keyframe: ${this.currentKeyFrame} / ${this.keyframeCount}`;
    });

    this.fbxTimelineObject.tick = (delta) =>
    {
      if (this.fbxObject.isPlaying) this.update(delta);
    }
  }

      update(delta) 
    {   
        if (!this.fbxObject.mixer) return;
        this.fbxObject.clipAction.play();
        const time = this.fbxObject.mixer.time;
        // console.log(`Time ${time} from Keyframe: ${this.currentKeyFrame}`);
        // get the closest keyframe index based on the current time
        const track = this.fbxObject.clipAction.getClip().tracks[0];
        let closestIndex = 0;
        let minDiff = Infinity;

        for (let i = 0; i < track.times.length; i++) 
        {
            const diff = Math.abs(track.times[i] - time);
            if (diff < minDiff) 
            {
                minDiff = diff;
                closestIndex = i;
            }
        }

        // stop if the closest keyframe is the last one
        if (this.currentKeyFrame >= this.keyframeCount) 
        {
            this.currentKeyFrame = this.keyframeCount;
            this.fbxObject.isPlaying = false;
        }

        this.currentKeyFrame = closestIndex;
        this.slider.value = closestIndex;
        this.label.textContent = `Keyframe: ${closestIndex} / ${this.keyframeCount}`;
    }

  play_pause() 
  {
    // toggle play/pause
    this.fbxObject.isPlaying = !this.fbxObject.isPlaying;
    if (this.currentKeyFrame >= this.keyframeCount) 
    {
      this.currentKeyFrame = 0;
      this.slider.value = 0;
      this.label.textContent = `Keyframe: ${this.currentKeyFrame} / ${this.keyframeCount}`;
    }
  }

stop() 
  {
    this.slider.value = 0;
    this.currentKeyFrame = 0;
    this.fbxObject.isPlaying = false;
    this.fbxObject.mixer.stopAllAction();
    this.fbxObject.mixer.setTime(0);
    this.label.textContent = `Keyframe: ${this.currentKeyFrame} / ${this.keyframeCount}`;
  }

  truncateToTwoDecimals(num)
  {
    return Math.trunc(num * 100) / 100;
  }

  gotoFrame(frameIndex) 
  {
    if (!this.fbxObject.mixer || !this.fbxObject.clipAction) return;

    // Safety clamp
    frameIndex = Math.max(0, Math.min(frameIndex, this.keyframeCount));

    // Berechne den Zeitwert aus dem Keyframe-Index
    const track = this.fbxObject.clipAction.getClip().tracks[0];
    const time = track.times[frameIndex];
    // we need to handle last keyframe specially, because it leeds to reset the animation
    // three js doenst work with keyframes, so last keyfram jumps beyond setTime(animation duration) 
    // and resets the animation, maybe three js restart animation from the beginning when time is 
    // greater or euqal than duration
    if (time >= this.fbxObject.duration) 
    {
        this.fbxObject.mixer.setTime(this.fbxObject.duration-0.01);
        return;
    }
    this.fbxObject.mixer.setTime(time);
  }



} 