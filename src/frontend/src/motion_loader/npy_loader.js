import npyjs from 'npyjs';
import * as THREE from 'three';
import { FBX_Loader } from './fbx_loader.js';
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
    this.spheres_for_joints = [];
    this.bones = [];
    this.elapsed = 0;
    this.speed = 1.0;
    this.fps = 60;
    this.boneMaterial = new LineMaterial({
      color: 0xff0000,
      linewidth: 5,   // pixel
      opacity: 1.0,
      // additional shader-uniforms possible like dashed, dashSize, gapSize, etc.
    });

    this.fbx_loader = new FBX_Loader();
    this.fbx_bones = [];

    this.head             = {};
    this.right_upper_arm  = {};
    this.right_under_arm  = {};
    this.left_upper_arm   = {};
    this.left_under_arm   = {};
    this.chest            = {};
    this.left_under_leg   = {};
    this.left_upper_leg   = {};
    this.right_upper_leg  = {};
    this.right_under_leg  = {}; 


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

        await this.fbx_loader.loadFBXModel('../public/bones.fbx');
        this.fbx_bones = this.fbx_loader.fbx_object.children[0]; 
        const scaleFactor = 0.2;
        
        this.head             = this.fbx_bones.children.find(c => c.name === 'head');
        this.right_upper_arm  = this.fbx_bones.children.find(c => c.name === 'right_upper_arm');
        this.right_under_arm  = this.fbx_bones.children.find(c => c.name === 'right_under_arm');
        this.left_upper_arm   = this.fbx_bones.children.find(c => c.name === 'left_upper_arm');
        this.left_under_arm   = this.fbx_bones.children.find(c => c.name === 'left_under_arm');
        this.chest            = this.fbx_bones.children.find(c => c.name === 'chest');
        this.left_under_leg   = this.fbx_bones.children.find(c => c.name === 'left_under_leg');
        this.left_upper_leg   = this.fbx_bones.children.find(c => c.name === 'left_upper_leg');
        this.right_upper_leg  = this.fbx_bones.children.find(c => c.name === 'right_upper_leg');
        this.right_under_leg  = this.fbx_bones.children.find(c => c.name === 'right_under_leg');
        
        this.head.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.right_upper_arm.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.right_under_arm.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.left_upper_arm.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.left_under_arm.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.chest.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.left_under_leg.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.left_upper_leg.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.right_upper_leg.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.right_under_leg.scale.set(scaleFactor, scaleFactor, scaleFactor);
        

        this.npy_object.add(this.head);
        this.npy_object.add(this.right_upper_arm);
        this.npy_object.add(this.right_under_arm);
        this.npy_object.add(this.left_upper_arm);
        this.npy_object.add(this.left_under_arm);
        this.npy_object.add(this.chest);
        this.npy_object.add(this.left_under_leg);
        this.npy_object.add(this.left_upper_leg);
        this.npy_object.add(this.right_upper_leg);
        this.npy_object.add(this.right_under_leg);
      
      } 
      catch (e) 
      {
        reject(e);
      }
    });
  }

  create_spheres_for_joints() 
  {
    const material = new THREE.MeshStandardMaterial({ color: 0x000000 });

    for (let i = 0; i < this.jointCount; i++) 
    {
      const geom = new THREE.SphereGeometry(0.02, 16, 16);
      const sphere = new THREE.Mesh(geom, material);
      this.npy_object.add(sphere);
      this.spheres_for_joints.push(sphere);
    }
  }

  update_joint_positions(frameIdx) 
  {
    const base = frameIdx * this.jointCount * 3;
    for (let i = 0; i < this.jointCount; i++) 
    {
      const x = this.motionArray[base + i * 3 + 0];
      const y = this.motionArray[base + i * 3 + 1];
      const z = this.motionArray[base + i * 3 + 2];
      this.spheres_for_joints[i].position.set(x, y, z);
    }

    // Update Skeleton Bones
    if (this.bones) 
    {
      for (const bone of this.bones) 
      {
        
        
        const start = this.spheres_for_joints[bone.parentIdx].position;
        const end = this.spheres_for_joints[bone.childIdx].position;
        bone.line.geometry.setFromPoints([start.clone(), end.clone()]);
        bone.line.geometry.verticesNeedUpdate = true;

        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

        if (bone.childJoint === "Head") 
        {
          console.log(bone.childJoint)
          this.head.position.copy(midpoint);

          // turn head in direction of bone
          // this.head.lookAt(end);
        }
        else if(bone.childJoint === "Head")
        {
            
        }
      }
    }
  }

  async create_skeleton(url, renderer = null) 
  {
    const response = await fetch(url);
    const skeleton = await response.json();

    // TODO: set resolution and pass render to this function 
    if (renderer) 
    {
      const { width, height } = renderer.getSize(new THREE.Vector2());
      this.boneMaterial.resolution.set(width, height);
    }

    for (const [childIdx, parentIdx] of skeleton.hierarchy) {
      // initialize 2 points with each XYZ
      const positions = [0, 0, 0, 0, 0, 0]; 

      const geometry = new LineGeometry();
      geometry.setPositions(positions);

      const line = new Line2(geometry, this.boneMaterial);
      line.computeLineDistances(); // for correct dash / clipping

      const childJoint  = skeleton.joints[childIdx];
      const parentJoint = skeleton.joints[parentIdx];

      this.npy_object.add(line);
      this.bones.push({ line, childIdx, parentIdx, parentJoint, childJoint });
    }
  }
}



