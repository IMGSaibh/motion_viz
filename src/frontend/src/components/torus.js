import 
{ 
  Mesh,
  MathUtils,
  MeshBasicMaterial,
  TorusGeometry,
} from 'three';

const uniforms = 
{   u_resolution: { value: { x: null, y: null } },
    u_time: {  value: 0.0 }
};

function createTorus()
{
  const geometry = new TorusGeometry(10, 3, 16, 100);
  // const material = createMaterial();
  const material = new MeshBasicMaterial({ color: 0xff0000 });
  const torus = new Mesh(geometry, material);

  const radiansPerSecond = MathUtils.degToRad(30);

    // this method will be called once per frame
    torus.tick = (delta) => 
    {
        
        uniforms.u_time.value += 0.01;
        if (uniforms.u_resolution !== undefined)
        {
          uniforms.u_resolution.value.x = window.innerWidth;
          uniforms.u_resolution.value.y = window.innerHeight;
        }
        // increase rotation each frame
        torus.rotation.z += radiansPerSecond * delta;
        torus.rotation.x += radiansPerSecond * delta;
        torus.rotation.y += radiansPerSecond * delta;
    };

    return torus;
}

export { createTorus };