export class FBX_Player 
{
  constructor(fbx_loader_object) 
  {
    this.fbx_player_object = {};
    this.fbx_loader_object = fbx_loader_object;
    // -1 because the last keyframe is not included in the slider
    // fbx is keyframe based, so the keyframe count is the number of keyframes minus one
    this.keyframeCount = fbx_loader_object.keyframeCount-1; 
    this.container = document.getElementById('timeline-container');
    this.slider = document.getElementById('frame-slider');
    this.label = document.getElementById('frame-label');
    this.slider.type = 'range';
    this.slider.min = 0;
    this.slider.max = this.keyframeCount;
    this.slider.step = 1;
    this.slider.value = 0;
    this.isPlaying = false;
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
        this.fbx_loader_object.clipAction.play();
        this.currentKeyFrame = parseFloat(e.target.value);
        this.gotoFrame(this.currentKeyFrame);
        this.label.textContent = `Keyframe: ${this.currentKeyFrame} / ${this.keyframeCount}`;
    });

    this.fbx_player_object.tick = (delta) =>
    {
      if (this.isPlaying) this.update(delta);
    }
  }

  update(delta) 
  {   
    if (!this.fbx_loader_object.mixer) return;

    this.fbx_loader_object.mixer.update(delta);
    this.fbx_loader_object.clipAction.play();
    const time = this.fbx_loader_object.mixer.time;
    // console.log(`Time ${time} from Keyframe: ${this.currentKeyFrame}`);
    // get the closest keyframe index based on the current time
    const track = this.fbx_loader_object.clipAction.getClip().tracks[0];
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
        this.isPlaying = false;
    }

    this.currentKeyFrame = closestIndex;
    this.slider.value = closestIndex;
    this.label.textContent = `Keyframe: ${closestIndex} / ${this.keyframeCount}`;

  }

  play_pause() 
  {
    // toggle play/pause
    this.isPlaying = !this.isPlaying;
    if (this.currentKeyFrame >= this.keyframeCount) 
    {
      this.currentKeyFrame = 0;
      this.slider.value = 0;
      this.fbx_loader_object.mixer.setTime(0);
      this.label.textContent = `Keyframe: ${this.currentKeyFrame} / ${this.keyframeCount}`;
    }
  }

stop() 
  {
    this.slider.value = 0;
    this.currentKeyFrame = 0;
    this.isPlaying = false;
    this.fbx_loader_object.mixer.stopAllAction();
    this.fbx_loader_object.mixer.setTime(0);
    this.label.textContent = `Keyframe: ${this.currentKeyFrame} / ${this.keyframeCount}`;
  }

  truncateToTwoDecimals(num)
  {
    return Math.trunc(num * 100) / 100;
  }

  gotoFrame(frameIndex) 
  {
    if (!this.fbx_loader_object.mixer || !this.fbx_loader_object.clipAction) return;

    // Safety clamp
    frameIndex = Math.max(0, Math.min(frameIndex, this.keyframeCount));

    // Berechne den Zeitwert aus dem Keyframe-Index
    const track = this.fbx_loader_object.clipAction.getClip().tracks[0];
    const time = track.times[frameIndex];
    // we need to handle last keyframe specially, because it leeds to reset the animation
    // three js doenst work with keyframes, so last keyfram jumps beyond setTime(animation duration) 
    // and resets the animation, maybe three js restart animation from the beginning when time is 
    // greater or euqal than duration
    if (time >= this.fbx_loader_object.duration) 
    {
        this.fbx_loader_object.mixer.setTime(this.fbx_loader_object.duration-0.01);
        return;
    }
    this.fbx_loader_object.mixer.setTime(time);
  }



} 