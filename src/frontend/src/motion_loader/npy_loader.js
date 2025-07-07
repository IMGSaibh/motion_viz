import npyjs from 'npyjs';
import * as THREE from 'three';
import { JointAxesVisualizer } from '../components/JointOrientation.js';



export class NPY_loader 
{
  constructor(scene) 
  {
    this.npy_motion = new THREE.Group();
    this.npy_motion.name = "npy_motion";

    this.numpy_data = null;
    this.currentFrame = 0;
    this.frameCount = 0;
    this.jointCount = 0;
    this.joints = [];
    this.npy_skeleton = [];
    this.elapsed = 0;
    this.speed = 1.0;
    this.fps = 60;
    this.joint_size = 0.2;
    this.scene = scene;
    this.jointAxisVisualizer = null;
    this.jointAxisOrientations = [];


  }

  async load_npy_animation(fileUrl) 
  {
    const loader = new npyjs();
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const parsed_npy = loader.parse(arrayBuffer);

    this.numpy_data = parsed_npy.data;
    const [frameCount, jointCount, _] = parsed_npy.shape;
    this.frameCount = frameCount;
    this.jointCount = jointCount;

    // // TODO: uncomment to use this
    // this.jointAxisOrientations = Array.from({ length: this.jointCount }, () => ({
    //   position:   [0, 0, 0],      
    //   quaternion: [0, 0, 0, 1]    
    // }));
    this.scene.add(this.npy_motion);
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

    this.jointAxisVisualizer = new JointAxesVisualizer(this.scene, this.jointCount, { axesSize: 10.4 });
  }

  _create_bones(skeleton, renderer = null)
  {
    const boneGeometry  = new THREE.CylinderGeometry(
      1.0,          // radiusTop
      1.0,          // radiusBottom
      1,            // height
      8             // radialSegments
    );

    // const boneMaterial = new THREE.MeshBasicMaterial({
    //   color: 0xff0000,
    //   wireframe: false
    // });

    const boneMaterial = new THREE.MeshNormalMaterial();

    for (const [childIdx, parentIdx] of skeleton.hierarchy) 
    {
      const childJoint  = skeleton.joints[childIdx];
      const parentJoint = skeleton.joints[parentIdx];
      
      const bone = new THREE.Mesh(boneGeometry, boneMaterial);      
      bone.matrixAutoUpdate = false;
      this.npy_motion.add(bone);

      this.npy_skeleton.push({ childIdx, parentIdx, parentJoint, childJoint, bone });
      
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

      // jointAxisPoint is a reference to the position of the joint axis orientation
      // // TODO: uncomment to use this
      // const jointAxisPoint = this.jointAxisOrientations[i].position;
      // jointAxisPoint[0] = x;
      // jointAxisPoint[1] = y;
      // jointAxisPoint[2] = z;
    }
    


    for (const elem of this.npy_skeleton) 
    {
      const start = this.joints[elem.parentIdx].position;
      const end = this.joints[elem.childIdx].position;
      
      // cylinder direction parent → child
      direction.subVectors(end, start);          
      const length = direction.length();
      direction.normalize();

      middle_point.addVectors(start, end).multiplyScalar(0.5);

      elem.bone.position.copy(middle_point);
      elem.bone.quaternion.setFromUnitVectors(y_axis, direction);

      // only scale height
      elem.bone.scale.set(1, length, 1);                
      elem.bone.updateMatrix();

      // jointAxisPoint is a reference to the quaternion of the joint axis orientation
      // // TODO: uncomment to use this
      // const quat = new THREE.Quaternion().setFromUnitVectors(y_axis, direction);
      // const q = this.jointAxisOrientations[elem.childIdx].quaternion;
      // q[0] = quat.x;
      // q[1] = quat.y;
      // q[2] = quat.z;
      // q[3] = quat.w;

    }

    // // TODO: uncomment to use this
    // this.jointAxisVisualizer.update(this.jointAxisOrientations); 

  }

  dispose() 
  {
    if (!this.npy_motion) return;

    // free gpu‑ressources
    this.npy_motion.traverse(obj => 
    {
      if (obj.isMesh) 
      {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) 
        {
          obj.material.forEach(m => m.dispose());
        } 
        else
        {
          obj.material.dispose();
        }
      }
    });

    this.npy_motion.clear();
    this.scene.remove(this.npy_motion);
    this.npy_motion = null;

    // // TODO: uncomment to use this
    // this.jointAxisVisualizer.dispose();
  }

}



