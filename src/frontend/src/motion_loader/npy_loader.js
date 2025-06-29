import npyjs from 'npyjs';
import * as THREE from 'three';


export class NPY_loader 
{
  constructor() 
  {
    this.npy_motion = new THREE.Group();

    this.numpy_data = null;
    this.currentFrame = 0;
    this.frameCount = 0;
    this.jointCount = 0;
    this.joints = [];
    this.npy_skeleton = [];
    this.elapsed = 0;
    this.speed = 1.0;
    this.fps = 60;
    this.joint_size = 1.0;
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
    const skeleton_json = await response.json();
    this._create_joints();
    this._create_bones(skeleton_json);
    
  }

  _create_joints() 
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

  _create_bones(skeleton, renderer = null)
  {
    const boneGeometry  = new THREE.CylinderGeometry(
      1.8,          // radiusTop
      0.8,          // radiusBottom
      1,            // height
      8             // radialSegments
    );

    const boneMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true
    });

    for (const [childIdx, parentIdx] of skeleton.hierarchy) 
    {
      const childJoint  = skeleton.joints[childIdx];
      const parentJoint = skeleton.joints[parentIdx];
      
      const bone_copy = new THREE.Mesh(boneGeometry, boneMaterial);      
      bone_copy.matrixAutoUpdate = false;
      this.npy_motion.add(bone_copy);

      this.npy_skeleton.push({ childIdx, parentIdx, parentJoint, childJoint, bone_copy });
      
    }
  }

  update_skeleton(frameIdx) 
  {

    const y_axis = new THREE.Vector3(0, 1, 0);
    const direction = new THREE.Vector3();
    const middle_point = new THREE.Vector3();

    const base = frameIdx * this.jointCount * 3;
    for (let i = 0; i < this.jointCount; i++) 
    {
      const x = this.numpy_data[base + i * 3 + 0];
      const y = this.numpy_data[base + i * 3 + 1];
      const z = this.numpy_data[base + i * 3 + 2];
      this.joints[i].position.set(x, y, z);
    }

    for (const elem of this.npy_skeleton) 
    {
      const start = this.joints[elem.parentIdx].position;
      const end = this.joints[elem.childIdx].position;
      
      // cylinder direction parent → child
      direction.subVectors(end, start);          
      const len = direction.length();
      direction.normalize();

      middle_point.addVectors(start, end).multiplyScalar(0.5);

      elem.bone_copy.position.copy(middle_point);
      elem.bone_copy.quaternion.setFromUnitVectors(y_axis, direction);

      // only scale height
      elem.bone_copy.scale.set(1, len, 1);                
      elem.bone_copy.updateMatrix();

    }
  }

}



