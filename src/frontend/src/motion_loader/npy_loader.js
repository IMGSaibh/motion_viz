import npyjs from 'npyjs';
import * as THREE from 'three';
import { FBX_Loader } from './fbx_loader.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';


export class NPY_loader 
{
  constructor() 
  {
    this.npy_motion = new THREE.Group();
    this.fbx_loader = new FBX_Loader();

    this.numpy_data = null;
    this.currentFrame = 0;
    this.frameCount = 0;
    this.jointCount = 0;
    this.joints = [];
    this.npy_skeleton = [];
    this.elapsed = 0;
    this.speed = 1.0;
    this.fps = 60;


    this.joint_size = 1.2;
    this.fbx_bones = [];
    this.boneMaterial = new LineMaterial({
      color: 0xff0000,
      linewidth: 5,   // pixel
      opacity: 1.0,
      // additional shader-uniforms possible like dashed, dashSize, gapSize, etc.
    });


    // geometries
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

  async load_bones_mixamo_fbx() 
  {
      await this.fbx_loader.loadFBXModel('../public/bones.fbx');
      let fbx_bones = this.fbx_loader.fbx_object.children[0]; 
      const scaleFactor = 0.2;
      this.head             = fbx_bones.children.find(c => c.name === 'head');
      this.right_upper_arm  = fbx_bones.children.find(c => c.name === 'right_upper_arm');
      this.right_under_arm  = fbx_bones.children.find(c => c.name === 'right_under_arm');
      this.left_upper_arm   = fbx_bones.children.find(c => c.name === 'left_upper_arm');
      this.left_under_arm   = fbx_bones.children.find(c => c.name === 'left_under_arm');
      this.chest            = fbx_bones.children.find(c => c.name === 'chest');
      this.left_under_leg   = fbx_bones.children.find(c => c.name === 'left_under_leg');
      this.left_upper_leg   = fbx_bones.children.find(c => c.name === 'left_upper_leg');
      this.right_upper_leg  = fbx_bones.children.find(c => c.name === 'right_upper_leg');
      this.right_under_leg  = fbx_bones.children.find(c => c.name === 'right_under_leg');
      

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

      // this.npy_object.add(this.head);
      // this.npy_object.add(this.right_upper_arm);
      // this.npy_object.add(this.right_under_arm);
      // this.npy_object.add(this.left_upper_arm);
      // this.npy_object.add(this.left_under_arm);
      // this.npy_object.add(this.chest);
      // this.npy_object.add(this.left_under_leg);
      // this.npy_object.add(this.left_upper_leg);
      // this.npy_object.add(this.right_upper_leg);
      // this.npy_object.add(this.right_under_leg);
  }

  async load_npy_motion(fileUrl) 
  {
    const loader = new npyjs();
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const parsed_npy = loader.parse(arrayBuffer);

    this.numpy_data = parsed_npy.data;
    const [frameCount, jointCount, _] = parsed_npy.shape;
    this.frameCount = frameCount;
    this.jointCount = jointCount;

    return this.npy_motion;
  }

  async create_skeleton(skeletonPath, renderer = null) 
  {
    const response = await fetch(skeletonPath);
    const skeleton = await response.json();
    const fbxModel = await this.fbx_loader.loadFBXModel('/bone.fbx');
    let bone = fbxModel.getObjectByName('Bone') ?? fbxModel;

    this.fbx_bones.push(clone(bone));
    this.fbx_bones.push(clone(bone));
    
    this.create_joints();
    this.create_bones(skeleton, bone);
    
  }

  create_joints() 
  {
    const material = new THREE.MeshStandardMaterial({ color: 0x000000 });

    for (let i = 0; i < this.jointCount; i++) 
    {
      const geom = new THREE.SphereGeometry(this.joint_size, 8, 8);
      const sphere = new THREE.Mesh(geom, material);
      this.npy_motion.add(sphere);
      this.joints.push(sphere);
    }
  }

  create_bones(skeleton, bone = null, renderer = null)
  {
    // TODO: set resolution and pass render to this function 
    if (renderer) 
    {
      const { width, height } = renderer.getSize(new THREE.Vector2());
      this.boneMaterial.resolution.set(width, height);
    }

    for (const [childIdx, parentIdx] of skeleton.hierarchy) 
    {
      // initialize 2 points with each XYZ
      const positions = [0, 0, 0, 0, 0, 0]; 

      const geometry = new LineGeometry();
      geometry.setPositions(positions);

      const line = new Line2(geometry, this.boneMaterial);
      line.computeLineDistances(); // for correct dash / clipping

      const childJoint  = skeleton.joints[childIdx];
      const parentJoint = skeleton.joints[parentIdx];

      this.npy_motion.add(line);
      this.npy_skeleton.push({ line, childIdx, parentIdx, parentJoint, childJoint });
      
    }

    if(bone)
    {
      
    }
    else
    {

    }

  }

  update_skeleton(frameIdx) 
  {
    const base = frameIdx * this.jointCount * 3;
    for (let i = 0; i < this.jointCount; i++) 
    {
      const x = this.numpy_data[base + i * 3 + 0];
      const y = this.numpy_data[base + i * 3 + 1];
      const z = this.numpy_data[base + i * 3 + 2];
      this.joints[i].position.set(x, y, z);
    }

    for (const bone of this.npy_skeleton) 
    {
      const start = this.joints[bone.parentIdx].position;
      const end = this.joints[bone.childIdx].position;
      bone.line.geometry.setFromPoints([start.clone(), end.clone()]);
      bone.line.geometry.verticesNeedUpdate = true;

      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

      if (bone.childJoint === "Head") 
      {
        // console.log(bone.childJoint)
        // this.head.position.copy(midpoint);

        // turn head in direction of bone
        // this.head.lookAt(end);
      }
      else if(bone.childJoint === "Head")
      {
          
      }
    }
  }

}



