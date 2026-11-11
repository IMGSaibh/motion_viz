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
  private resize_observer: ResizeObserver;
  private handle_window_resize: () => void;

  constructor(container: HTMLDivElement, camera: PerspectiveCamera, renderer: WebGLRenderer) 
  {
    this.handle_window_resize = () =>
    {
      this._setSize(container, camera, renderer);
      this._onResize();
    };
    this.resize_observer = new ResizeObserver(this.handle_window_resize);
    this.resize_observer.observe(container);
    window.addEventListener('resize', this.handle_window_resize);
    this.handle_window_resize();
  }

  dispose()
  {
    this.resize_observer.disconnect();
    window.removeEventListener('resize', this.handle_window_resize);
  }

  private _setSize(container: HTMLDivElement, camera: PerspectiveCamera, renderer: WebGLRenderer)
  {
    if (container.clientWidth === 0 || container.clientHeight === 0) return;
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
