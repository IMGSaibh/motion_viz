import {PerspectiveCamera, WebGLRenderer } from 'three'

class Resizer
{
  constructor(container: HTMLDivElement, camera: PerspectiveCamera, renderer: WebGLRenderer) 
  {
    // set initial size
    this._setSize(container, camera, renderer);

    window.addEventListener('resize', () => 
    {
      // set the size again if a resize occurs
      this._setSize(container, camera, renderer);

      // perform any custom actions
      this._onResize();
    });
  }

  private _setSize(container: HTMLDivElement, camera: PerspectiveCamera, renderer: WebGLRenderer)
  {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    // A devicePixelRatio of 2 will render the scene at double resolution and scale down, while a devicePixelRatio of 0.5 will render at half resolution and scale up. 
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  
  private _onResize()
  {
    // nothing to do on resize for now
  } 

}

export { Resizer };