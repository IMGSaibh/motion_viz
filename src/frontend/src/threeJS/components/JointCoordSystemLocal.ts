import * as THREE from 'three';

  interface JointData 
  {
    position: [number, number, number];
    quaternion?: [number, number, number, number];
  }

export class JointCoordsystemLocal 
{
  scene: THREE.Scene;
  jointCount: number;
  axesSize: number;
  jointGroups: THREE.Object3D[];

  constructor(scene: THREE.Scene, jointCount: number, opts: { axesSize?: number } = {}) 
  {
    this.scene      = scene;
    this.jointCount = jointCount;
    this.axesSize   = opts.axesSize ?? 20.2; 
    this.jointGroups = [];

    this.createAxesHelpers();
  }

  update(joints: JointData[]) 
  {
    const n = Math.min(joints.length, this.jointGroups.length);
    
    if (joints.length !== this.jointCount)
    {
      console.warn(`[JointAxesVisualizer] Expected ${this.jointCount} joints, received ${joints.length}.`);
    }

    for (let i = 0; i < n; i++) 
    {
      const { position, quaternion } = joints[i];
      const jointGroup = this.jointGroups[i];

      jointGroup.position.set(position[0], position[1], position[2]);

      if (quaternion?.length === 4) 
      {
        jointGroup.quaternion.set(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
      }
      else
      {
        jointGroup.quaternion.identity();
      }
    }
  }

  resizeAxes(newSize: number) 
  {
    if (newSize <= 0) return;
    const factor = newSize / this.axesSize;
    this.axesSize = newSize;

    this.jointGroups.forEach(group => 
    {
      group.children.forEach(child => 
      {
        if (child instanceof THREE.AxesHelper) 
        {
          child.scale.multiplyScalar(factor);
        }
      });
    });
  }

  createAxesHelpers() 
  {
    for (let i = 0; i < this.jointCount; i++) 
      {
        const group = new THREE.Object3D();
        const axes  = new THREE.AxesHelper(this.axesSize);
        group.add(axes);
        this.scene.add(group);
        this.jointGroups.push(group);
      }
    }

    dispose() 
    {
      this.jointGroups.forEach(g => this.scene.remove(g));
      this.jointGroups.length = 0;
    }
}
