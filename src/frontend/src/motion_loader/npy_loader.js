import * as THREE from 'three';
import npyjs from 'npyjs';

export class NPY_loader 
{
  constructor() 
  {
    this.npy_object = new THREE.Group();
    this.motionArray = null;
    this.currentFrame = 0;
    this.frameCount = 0;
    this.jointCount = 0;
    this.joints = [];
    this.bones = [];
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
        this.boneMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        
        resolve(this.npy_object);

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
      const geom = new THREE.SphereGeometry(1.2, 16, 16);
      const sphere = new THREE.Mesh(geom, material);
      this.npy_object.add(sphere);
      this.joints.push(sphere);
    }
  }

  async parseHierarchyFileBVH(url) 
  {
    const response = await fetch(url);
    const skeleton = await response.json();
    this.jointNames = skeleton.joints;
    this.createSkeletonLines(skeleton.hierarchy);
    // this.createSkeletonLinesCSV_KinectV1(skeleton.joints ,skeleton.hierarchy);
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

    // Update Skeleton Bones
    if (this.bones) {
      for (const bone of this.bones) {
        const start = this.joints[bone.parentIdx].position;
        const end = this.joints[bone.childIdx].position;
        bone.line.geometry.setFromPoints([start.clone(), end.clone()]);
        bone.line.geometry.verticesNeedUpdate = true;
      }
    }


  }

  createSkeletonLines(hierarchy) 
  {
    this.bones = [];
    // TODO: improve performance
    for (const [childIdx, parentIdx] of hierarchy) 
    {
      // const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(), new THREE.Vector3()
      ]);
      const line = new THREE.Line(geometry, this.boneMaterial);
      this.npy_object.add(line);
      this.bones.push({ line, childIdx, parentIdx });
    }
  }

  createSkeletonLinesCSV_KinectV1(joints, hierarchy) 
  {
    this.bones = [];

    for (const [parentName, childName] of hierarchy) 
    {
      const parentIdx = joints.indexOf(parentName);
      const childIdx = joints.indexOf(childName);

      if (parentIdx === -1 || childIdx === -1) 
      {
        console.warn(`Invalid joint name in hierarchy: ${parentName} -> ${childName}`);
        continue;
      }

      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(), new THREE.Vector3()
      ]);
      const line = new THREE.Line(geometry, this.boneMaterial);
      this.npy_object.add(line);
      this.bones.push({ line, parentIdx, childIdx });
    }
  }

}
