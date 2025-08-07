import { BVH_loader } from '@/threeJS/motion_loader/bvh_loader';
import { Updatable } from '@/threeJS/system/loop';
import { PerspectiveCamera, WebGLRenderer, Scene} from 'three'

export class BVH_Player 
{
  public bvh_player_object: Updatable;
  private bvh_loader_object: BVH_loader;
  private currentTime: number;
  private frame_count: number;
  private is_playing: boolean;
  private frame_index: number;

  private on_frame_changed_callback?: (frameIndex: number) => void;

  constructor(bvh_loader_object: BVH_loader) 
  {
    this.bvh_loader_object = bvh_loader_object;
    this.frame_count = bvh_loader_object.frameCount;
    this.frame_index = 0;
    this.currentTime = 0;
    this.is_playing = false;

    this.bvh_player_object = 
    {
      tick: (delta: number) => 
      {
        if (this.is_playing) this.update(delta)
      }
    }
  }

  set_on_frame_changed_callback(cb: (frameIndex: number) => void)
  {
    this.on_frame_changed_callback = cb;
  }

  update(delta: number) 
  {
    this.bvh_loader_object.clipAction!.play();
    this.bvh_loader_object.mixer!.update(delta);
    this.currentTime = this.bvh_loader_object.mixer!.time;

    if (!this.is_playing) return;
    else if (this.get_frame_index() >= this.bvh_loader_object.frameCount) 
    {
      this.is_playing = false;
    }

    if (this.on_frame_changed_callback) 
    {
      this.on_frame_changed_callback(this.frame_index);
    }

  }

  play_pause() 
  {
    // toggle play/pause
    this.is_playing = !this.is_playing;

    this.go_to_frame(this.frame_index);

    if(this.get_frame_index() >= this.bvh_loader_object.frameCount)
    {
      this.bvh_loader_object.mixer!.setTime(0);
      this.currentTime = 0;
      this.frame_index = 0;
    }
  }

  stop() 
  {
    // this.currentTime = 0;
    this.is_playing = false;
    // this.bvh_loader_object.mixer!.time = 0;
  }

  get_frame_index() 
  {
    if (!this.bvh_loader_object.mixer) return 0;
    this.frame_index = Math.floor(this.bvh_loader_object.mixer!.time * this.bvh_loader_object.fps);
    return this.frame_index;
  }

  get_frame_count(): number
  {
    return this.frame_count;
  }

  go_to_frame(frame_index: number) 
  {
    if(this.bvh_loader_object.mixer && this.bvh_loader_object.clipAction)
    {
      this.currentTime = frame_index; 
      this.bvh_loader_object.mixer!.setTime(frame_index / this.bvh_loader_object.fps);
    }
  }

  dispose() 
  { 

    this.bvh_loader_object.mixer?.stopAllAction();
    this.bvh_loader_object.mixer = null;
  }

    // needs to be a seperate class with dispose and pi pa po
    async render_thumbnail(
      frameIndex: number,
      scene: Scene,
      camera: PerspectiveCamera,
      width: number = 260,
      height: number = 190,
      renderer: WebGLRenderer
    ): Promise<string> 
    {
      renderer.setSize(width, height, false)
      // save frame
      const previous_frame = this.frame_index
      this.go_to_frame(frameIndex)
  
      renderer.render(scene, camera)
  
      const dataUrl = renderer.domElement.toDataURL()
      this.go_to_frame(previous_frame)
      return dataUrl
    }

}

