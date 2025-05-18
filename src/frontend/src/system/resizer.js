const setSize = (container, camera, renderer) =>
{
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  // A devicePixelRatio of 2 will render the scene at double resolution and scale down, while a devicePixelRatio of 0.5 will render at half resolution and scale up. 
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
};

class Resizer
{
  constructor(container, camera, renderer) 
  {
    // set initial size
    setSize(container, camera, renderer);

    window.addEventListener('resize', () => 
    {
      // set the size again if a resize occurs
      setSize(container, camera, renderer);

      // perform any custom actions
      this.onResize();
    });
  }
  
  onResize()
  {
    // nothing to do on resize for now
  } 

}

export { Resizer };