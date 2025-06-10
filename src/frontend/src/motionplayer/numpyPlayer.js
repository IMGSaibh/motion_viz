import * as THREE from 'three';
import npyjs from 'npyjs';

export class NumpyPlayer 
{
  constructor() 
  {
    this.npyObject = new THREE.Group();
    this.motionArray = null;
    this.currentFrame = 0;
    this.frameCount = 0;
    this.jointCount = 0;
    this.joints = [];
    this.elapsed = 0;
    this.speed = 1.0;
    this.fps = 60;
  }

  async load(url) 
  {
    return new Promise(async (resolve, reject) => 
    {
      try 
      {
        const loader = new npyjs();
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const parsed = loader.parse(arrayBuffer);

        this.motionArray = parsed.data;
        const [frameCount, jointCount, _] = parsed.shape;
        this.frameCount = frameCount;
        this.jointCount = jointCount;

        this.createSpheres();

        resolve(this.npyObject);

      } catch (e) 
      {
        reject(e);
      }
    });
  }

  createSpheres() 
  {
    const material = new THREE.MeshStandardMaterial({ color: 0x000000 });

    for (let i = 0; i < this.jointCount; i++) 
    {
      const geom = new THREE.SphereGeometry(2, 16, 16);
      const sphere = new THREE.Mesh(geom, material);
      this.npyObject.add(sphere);
      this.joints.push(sphere);
    }
  }

  setJointPositions(frameIdx) 
  {
    const base = frameIdx * this.jointCount * 3;
    for (let i = 0; i < this.jointCount; i++) 
    {
      const x = this.motionArray[base + i * 3 + 0];
      const y = this.motionArray[base + i * 3 + 1];
      const z = this.motionArray[base + i * 3 + 2];
      this.joints[i].position.set(x, y, z);
    }
  }

}
