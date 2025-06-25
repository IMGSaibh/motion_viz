import * as THREE from 'three';
import npyjs from 'npyjs';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';



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
    this.fbxBones = new THREE.Group();
    this.boneMaterial = new LineMaterial({
      color: 0xff0000,
      linewidth: 1,   // pixel
      opacity: 1.0,
      // additional shader-uniforms possible like dashed, dashSize, gapSize, etc.
    });
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
      const geom = new THREE.SphereGeometry(2.02, 16, 16);
      const sphere = new THREE.Mesh(geom, material);
      this.npy_object.add(sphere);
      this.joints.push(sphere);
    }
  }

  async parse_hierarchy_file_bvh(url) 
  {
    const response = await fetch(url);
    const skeleton = await response.json();
    this.jointNames = skeleton.joints;
    this.create_skeleton_bones_bvh(skeleton.hierarchy)
  }

  async parse_hierarchy_file_csv_kinectv1(url) 
  {
    const response = await fetch(url);
    const skeleton = await response.json();
    this.jointNames = skeleton.joints;
    this.create_skeleton_lines_csv_kinect_v1(skeleton.joints ,skeleton.hierarchy);
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
    if (this.bones) 
    {
      for (const bone of this.bones) 
      {
        const start = this.joints[bone.parentIdx].position;
        const end = this.joints[bone.childIdx].position;
        bone.line.geometry.setFromPoints([start.clone(), end.clone()]);
        bone.line.geometry.verticesNeedUpdate = true;
      }
    }
  }

  create_skeleton_lines_csv_kinect_v1(joints, hierarchy) 
  {

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

  create_skeleton_bones_bvh(hierarchy, renderer = null) 
  {
    // TODO: set resolution and pass render to this function 
    if (renderer) 
    {
      const { width, height } = renderer.getSize(new THREE.Vector2());
      this.boneMaterial.resolution.set(width, height);
    }

    for (const [childIdx, parentIdx] of hierarchy) {
      // init 2 points with each XYZ
      const positions = [0, 0, 0, 0, 0, 0]; 

      const geometry = new LineGeometry();
      geometry.setPositions(positions);

      const line = new Line2(geometry, this.boneMaterial);
      line.computeLineDistances(); // for correct dash / clipping

      this.npy_object.add(line);
      this.bones.push({ line, childIdx, parentIdx });
    }

    return this.bones;
  }


}



