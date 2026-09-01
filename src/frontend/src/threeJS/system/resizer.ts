import {PerspectiveCamera, WebGLRenderer } from 'three'

/**
 * Synchronizes a Three.js camera and renderer with the size of their DOM container.
 *
 * This system-level class is the integration point for viewport resize behavior. Camera
 * composition belongs in the camera component, renderer creation belongs in the renderer
 * module, and React layout decisions remain outside the Three.js engine layer.
 */
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

    // A devicePixelRatio of 2 will render the scene at double resolution and scale down, 
    // while a devicePixelRatio of 0.5 will render at half resolution and scale up. 
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  
  private _onResize()
  {
    // nothing to do on resize for now
  } 

}

export { Resizer };
