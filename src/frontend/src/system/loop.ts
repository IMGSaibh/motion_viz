import {Clock, Camera, Scene, WebGLRenderer} from 'three'

export interface Updatable 
{
  tick(delta: number): void
}

class Loop 
{
    private readonly camera: Camera
    private readonly scene: Scene
    private readonly renderer: WebGLRenderer

    private readonly clock = new Clock()
    public updatables: Updatable[] = []

    constructor(camera: Camera, scene: Scene, renderer: WebGLRenderer) 
    {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.updatables = [];
    }

    start()
    {
        this.renderer.setAnimationLoop(() => 
        {  
            // tell every animated object to tick forward one frame
            this.tick()
    
            // render a frame
            this.renderer.render(this.scene, this.camera)
            
        });
        
    }

    stop() 
    {
        this.renderer.setAnimationLoop(null);
    }

    private tick()
    {
        // only call the getDelta function once per frame!
        const delta = this.clock.getDelta()
        for (const obj of this.updatables) 
            obj.tick(delta)
    }  


}

export { Loop };