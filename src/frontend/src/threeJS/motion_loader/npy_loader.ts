import npyjs from 'npyjs';
import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { JointCoordsystemLocal } from '@/threeJS/components/JointCoordSystemLocal';

// Define the joint categories with their colors
export const JOINT_CATEGORIES = {
  HIP: 'hip',
  SPINE: 'spine',
  HEAD: 'head',
  ARM_L: 'armL',
  ARM_R: 'armR',
  HAND_L: 'handL',
  HAND_R: 'handR',
  LEG_L: 'legL',
  LEG_R: 'legR',
  FOOT_L: 'footL',
  FOOT_R: 'footR',
} as const;

export type JointCategory = typeof JOINT_CATEGORIES[keyof typeof JOINT_CATEGORIES];

// Color mapping for each category (with same colors for left and rigth)
export const CATEGORY_COLORS: Record<JointCategory, number> = {
  [JOINT_CATEGORIES.HIP]: 0xFF6B6B,      // Soft Red
  [JOINT_CATEGORIES.SPINE]: 0x4ECDC4,    // Turquoise
  [JOINT_CATEGORIES.HEAD]: 0xFFE66D,     // Warm Yellow
  [JOINT_CATEGORIES.ARM_L]: 0x95E77E,    // Light Green
  [JOINT_CATEGORIES.ARM_R]: 0x95E77E,    // Light Green (same for both arms)
  [JOINT_CATEGORIES.HAND_L]: 0x6C91B0,   // Steel Blue
  [JOINT_CATEGORIES.HAND_R]: 0x6C91B0,   // Steel Blue
  [JOINT_CATEGORIES.LEG_L]: 0xFF9F4A,    // Orange
  [JOINT_CATEGORIES.LEG_R]: 0xFF9F4A,    // Orange
  [JOINT_CATEGORIES.FOOT_L]: 0xE28F6E,   // Terracotta
  [JOINT_CATEGORIES.FOOT_R]: 0xE28F6E,   // Terracotta
};

// Color mapping for each category (with slightly different colors for left and right)
export const CATEGORY_COLORS_DISTINCT: Record<JointCategory, number> = {
  [JOINT_CATEGORIES.HIP]: 0xFF6B6B,
  [JOINT_CATEGORIES.SPINE]: 0x4ECDC4,
  [JOINT_CATEGORIES.HEAD]: 0xFFE66D,
  [JOINT_CATEGORIES.ARM_L]: 0x95E77E,    // Light Green
  [JOINT_CATEGORIES.ARM_R]: 0x6BCB77,    // Medium Green (different)
  [JOINT_CATEGORIES.HAND_L]: 0x6C91B0,   // Steel Blue
  [JOINT_CATEGORIES.HAND_R]: 0x4A7C9E,   // Darker Steel Blue
  [JOINT_CATEGORIES.LEG_L]: 0xFF9F4A,    // Orange
  [JOINT_CATEGORIES.LEG_R]: 0xFF8C42,    // Darker Orange
  [JOINT_CATEGORIES.FOOT_L]: 0xE28F6E,   // Terracotta
  [JOINT_CATEGORIES.FOOT_R]: 0xD47C58,   // Darker Terracotta
};

//lädt json und npy

export class NPY_loader {
  npy_motion: THREE.Group; //This holds all the bones and joints
  numpy_data: any;
  currentFrame: number;
  frameCount: number;
  jointCount: number;
  joints: THREE.Mesh[];
  npy_skeleton: any[];
  elapsed: number;
  speed: number;
  fps: number;
  joint_size: number;
  scene: THREE.Scene;
  joint_indices_names: Text[] = [];
  joint_indices_names_text = new THREE.Group();
  jointGroupMap: JointCategory[] = []; //Array that holds the joint category for each joint index

  // joint_coordsystem_local: JointCoordsystemLocal | null;
  // joint_orientations: any[];

  constructor(scene: THREE.Scene) {
    this.npy_motion = new THREE.Group();
    this.npy_motion.name = 'npy_motion';

    this.numpy_data = null;
    this.currentFrame = 0;
    this.frameCount = 0;
    this.jointCount = 0;
    this.joints = [];
    this.npy_skeleton = [];
    this.elapsed = 0;
    this.speed = 1.0;
    this.fps = 60;
    this.joint_size = 0.8;
    this.scene = scene;
    this.joint_indices_names = []; //
    this.joint_indices_names_text = new THREE.Group(); //Text labels that get displayed next to the joints
    // this.joint_coordsystem_local = null;
    // this.joint_orientations = [];
  }

  _assign_categories(skeleton_json : any) {
    const jointGraph = skeleton_json["joint-graph"];
      if (!jointGraph || !Array.isArray(jointGraph)) {
    console.error('Invalid skeleton JSON: missing joint-graph');
    return [];
  }
  
    const categories: JointCategory[] = [];

    for (const joint of jointGraph) {
    const name = joint.name;
    const category = JOINT_NAME_PATTERNS[name];
    
    if (category) {
      categories.push(category);
    } else {
      console.warn(`No category found for joint: ${name}, assigning to SPINE as default`);
      categories.push(JOINT_CATEGORIES.SPINE);
    }
  }
  
  return categories;  

  }

  _get_color_by_joint_id(jointId: number, categories: JointCategory[]): number {
  // Check if jointId is valid
  if (jointId < 0 || jointId >= categories.length) {
    console.warn(`Invalid joint ID: ${jointId}. Available joints: 0-${categories.length - 1}`);
    return 0xCCCCCC; // Default gray
  }
  
  const category = categories[jointId];
  const color = CATEGORY_COLORS[category];
  
  if (!color) {
    console.warn(`No color defined for category: ${category} (joint ${jointId})`);
    return 0xCCCCCC; // Default gray
  }
  
  return color;
}

  _print_joint_categories(categories: JointCategory[]): void {
  console.log('========== JOINT CATEGORIES ==========');
  console.log(`Total Joints: ${categories.length}`);
  console.log('');
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const jointName = `Joint ${i}`;
    
    // Get color for this category to show in console (using ANSI colors for visual reference)
    const colorHex = CATEGORY_COLORS[category].toString(16).padStart(6, '0');
    
    console.log(`  ${i.toString().padStart(3)} | ${jointName.padEnd(20)} → ${category} (${colorHex})`);
  }
  
  console.log('=======================================');
}

  async load_npy_animation(file_url: string) {
    //TODO: lädt numpy aus dem backend
    const loader = new npyjs();
    const response = await fetch(file_url);
    const arrayBuffer = await response.arrayBuffer();
    const parsed_npy = loader.parse(arrayBuffer);

    this.npy_motion.name = file_url;
    this.numpy_data = parsed_npy.data;
    const [frameCount, jointCount, _] = parsed_npy.shape;
    this.frameCount = frameCount;
    this.jointCount = jointCount;
    console.log("Joint Count: " + this.jointCount);

    this.joint_indices_names = Array.from({ length: jointCount }, () => new Text());

    // // TODO: uncomment to use this
    // this.joint_orientations = Array.from({ length: this.jointCount }, () => ({
    //   position:   [0, 0, 0],
    //   quaternion: [0, 0, 0, 1]
    // }));
    this.scene.add(this.npy_motion);
  }

  async create_skeleton(skeletonPath: string, renderer = null) {
    const response = await fetch(skeletonPath);
    const skeleton_json = await response.json();
    this.jointGroupMap =  this._assign_categories(skeleton_json); //fills up the JointGroupmap array so it can be used in _create_bones to color the bones differently
    this._print_joint_categories(this.jointGroupMap);
    this._create_joints();
    this._create_bones(skeleton_json);
  }

  _create_joints() {
    const material = new THREE.MeshStandardMaterial({ color: 0x000000 });

    for (let i = 0; i < this.jointCount; i++) {
      const geom = new THREE.SphereGeometry(this.joint_size, 8, 8);
      const sphere = new THREE.Mesh(geom, material);
      this.npy_motion.add(sphere);
      this.joints.push(sphere);

      this.joint_indices_names[i].text = String(i);
      this.joint_indices_names[i].fontSize = 2.2;
      this.joint_indices_names[i].anchorX = 'center';
      this.joint_indices_names[i].anchorY = 'middle';
      this.joint_indices_names[i].color = 0x000000;
      this.joint_indices_names[i].sync(); // <— wichtig
      this.joint_indices_names_text.add(this.joint_indices_names[i] as unknown as THREE.Object3D);
      this.joint_indices_names_text.name = 'joint_indices_text';
    }

    this.scene.add(this.joint_indices_names_text);

    // this.joint_coordsystem_local = new JointCoordsystemLocal(this.scene, this.jointCount, { axesSize: 10 });
  }

  //This creates the visible cilindrical geometry that visualize the different bones
  _create_bones(skeleton_json: any, renderer: THREE.WebGLRenderer | null = null) {
    const boneGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.7, 8);
    // const boneMaterial = new THREE.MeshNormalMaterial({
    //   // wireframe: true,
    // });

    const jointGraph = skeleton_json['joint-graph'];
    if (!jointGraph) {
      console.error("ERROR: Skeleton JSON besitzt kein 'joint-graph'!");
      return;
    }

    // npy_skeleton neu aufbauen
    this.npy_skeleton = [];

    for (const joint of jointGraph) {
      const childIdx = joint.id;
      const parentIdx = joint.pid;

      // Parent -1? → Root, diesen überspringen wir für Bones
      if (parentIdx === -1) continue;

      const mat_color: number = this._get_color_by_joint_id(childIdx, this.jointGroupMap);

      const boneMaterial = new THREE.MeshBasicMaterial({
        color: mat_color,
        wireframe: false,
      });

      const bone = new THREE.Mesh(boneGeometry, boneMaterial);
      bone.matrixAutoUpdate = false;

      this.npy_motion.add(bone);

      // wir speichern exakt das, was die update_skeleton() erwartet
      this.npy_skeleton.push({
        childIdx,
        parentIdx,
        bone,
      });
    }
  }

  update_skeleton(frameIdx: number) {
    const y_axis = new THREE.Vector3(0, 1, 0);
    const direction = new THREE.Vector3();
    const middle_point = new THREE.Vector3();

    const base = frameIdx * this.jointCount * 3;
    for (let i = 0; i < this.jointCount; i++) {
      const x = this.numpy_data[base + i * 3 + 0];
      const y = this.numpy_data[base + i * 3 + 1];
      const z = this.numpy_data[base + i * 3 + 2];
      this.joints[i].position.set(x, y, z);

      this.joint_indices_names[i].position.set(x, y + this.joint_size * 2.2, z);
      // // jointAxisPoint is a reference to the position of the joint axis orientation
      // // TODO: uncomment to use this
      // const jointAxisPoint = this.joint_orientations[i].position;
      // jointAxisPoint[0] = x;
      // jointAxisPoint[1] = y;
      // jointAxisPoint[2] = z;
    }

    for (const elem of this.npy_skeleton) {
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

      // // jointAxisPoint is a reference to the quaternion of the joint axis orientation
      // // TODO: uncomment to use this
      // const quat = new THREE.Quaternion().setFromUnitVectors(y_axis, direction);
      // const q = this.joint_orientations[elem.childIdx].quaternion;
      // q[0] = quat.x;
      // q[1] = quat.y;
      // q[2] = quat.z;
      // q[3] = quat.w;
    }

    // // TODO: uncomment to use this
    // this.joint_coordsystem_local!.update(this.joint_orientations);
  }

  dispose() {
    if (!this.npy_motion) return;

    // free gpu‑ressources
    this.npy_motion.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.npy_motion.clear();
    this.scene.remove(this.npy_motion);
    this.scene.remove(this.joint_indices_names_text);

    // // TODO: uncomment to use this
    // this.joint_coordsystem_local!.dispose();
  }

  /**
 * Prints basic information about all joints in the skeleton
 */
  printJointInfo() {
    console.log(`Total Joints: ${this.jointCount}`);
    console.log('\nJoint List:');
    
    for (let i = 0; i < this.jointCount; i++) {
      const pos = this.joints[i]?.position;
      if (pos) {
        console.log(`  Joint ${i}: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
      } else {
        console.log(`  Joint ${i}: Not initialized`);
      }
    }
  }
}

export const JOINT_NAME_PATTERNS: Record<string, JointCategory> = {
  // Hip/Pelvis
  'hips': JOINT_CATEGORIES.HIP,
  'Hips': JOINT_CATEGORIES.HIP,
  'pelvis': JOINT_CATEGORIES.HIP,
  'root': JOINT_CATEGORIES.HIP,
  
  // Spine
  'chest': JOINT_CATEGORIES.SPINE,
  'Chest': JOINT_CATEGORIES.SPINE,
  'chest2': JOINT_CATEGORIES.SPINE,
  'Chest2': JOINT_CATEGORIES.SPINE,
  'chest3': JOINT_CATEGORIES.SPINE,
  'Chest3': JOINT_CATEGORIES.SPINE,
  'chest4': JOINT_CATEGORIES.SPINE,
  'Chest4': JOINT_CATEGORIES.SPINE,
  'spine': JOINT_CATEGORIES.SPINE,
  'Spine1': JOINT_CATEGORIES.SPINE,
  'Spine2': JOINT_CATEGORIES.SPINE,
  
  // Head
  'neck': JOINT_CATEGORIES.HEAD,
  'Neck': JOINT_CATEGORIES.HEAD,
  'head': JOINT_CATEGORIES.HEAD,
  'Head': JOINT_CATEGORIES.HEAD,
  
  // Left Arm
  'leftcollar': JOINT_CATEGORIES.ARM_L,
  'LeftCollar': JOINT_CATEGORIES.ARM_L,
  'leftshoulder': JOINT_CATEGORIES.ARM_L,
  'LeftShoulder': JOINT_CATEGORIES.ARM_L,
  'leftelbow': JOINT_CATEGORIES.ARM_L,
  'LeftElbow': JOINT_CATEGORIES.ARM_L,
  'left_arm': JOINT_CATEGORIES.ARM_L,
  'left_shoulder': JOINT_CATEGORIES.ARM_L,
  'left_elbow': JOINT_CATEGORIES.ARM_L,
  'LShoulder': JOINT_CATEGORIES.ARM_L,
  'LElbow': JOINT_CATEGORIES.ARM_L,
  'ArmL': JOINT_CATEGORIES.ARM_L,
  
  // Right Arm
  'rightcollar': JOINT_CATEGORIES.ARM_R,
  'RightCollar': JOINT_CATEGORIES.ARM_R,
  'rightshoulder': JOINT_CATEGORIES.ARM_R,
  'RightShoulder': JOINT_CATEGORIES.ARM_R,
  'rightelbow': JOINT_CATEGORIES.ARM_R,
  'RightElbow': JOINT_CATEGORIES.ARM_R,
  'right_arm': JOINT_CATEGORIES.ARM_R,
  'right_shoulder': JOINT_CATEGORIES.ARM_R,
  'right_elbow': JOINT_CATEGORIES.ARM_R,
  'RShoulder': JOINT_CATEGORIES.ARM_R,
  'RElbow': JOINT_CATEGORIES.ARM_R,
  'ArmR': JOINT_CATEGORIES.ARM_R,
  
  // Left Hand
  'leftwrist': JOINT_CATEGORIES.HAND_L,
  'LeftWrist': JOINT_CATEGORIES.HAND_L,
  'left_hand': JOINT_CATEGORIES.HAND_L,
  'left_wrist': JOINT_CATEGORIES.HAND_L,
  'LWrist': JOINT_CATEGORIES.HAND_L,
  'HandL': JOINT_CATEGORIES.HAND_L,
  
  // Right Hand
  'rightwrist': JOINT_CATEGORIES.HAND_R,
  'RightWrist': JOINT_CATEGORIES.HAND_R,
  'right_hand': JOINT_CATEGORIES.HAND_R,
  'right_wrist': JOINT_CATEGORIES.HAND_R,
  'RWrist': JOINT_CATEGORIES.HAND_R,
  'HandR': JOINT_CATEGORIES.HAND_R,
  
  // Left Leg
  'lefthip': JOINT_CATEGORIES.LEG_L,
  'LeftHip': JOINT_CATEGORIES.LEG_L,
  'leftknee': JOINT_CATEGORIES.LEG_L,
  'LeftKnee': JOINT_CATEGORIES.LEG_L,
  'left_leg': JOINT_CATEGORIES.LEG_L,
  'left_thigh': JOINT_CATEGORIES.LEG_L,
  'left_knee': JOINT_CATEGORIES.LEG_L,
  'LThigh': JOINT_CATEGORIES.LEG_L,
  'LKnee': JOINT_CATEGORIES.LEG_L,
  'LegL': JOINT_CATEGORIES.LEG_L,
  
  // Right Leg
  'righthip': JOINT_CATEGORIES.LEG_R,
  'RightHip': JOINT_CATEGORIES.LEG_R,
  'rightknee': JOINT_CATEGORIES.LEG_R,
  'RightKnee': JOINT_CATEGORIES.LEG_R,
  'right_leg': JOINT_CATEGORIES.LEG_R,
  'right_thigh': JOINT_CATEGORIES.LEG_R,
  'right_knee': JOINT_CATEGORIES.LEG_R,
  'RThigh': JOINT_CATEGORIES.LEG_R,
  'RKnee': JOINT_CATEGORIES.LEG_R,
  'LegR': JOINT_CATEGORIES.LEG_R,
  
  // Left Foot
  'leftankle': JOINT_CATEGORIES.FOOT_L,
  'LeftAnkle': JOINT_CATEGORIES.FOOT_L,
  'lefttoe': JOINT_CATEGORIES.FOOT_L,
  'LeftToe': JOINT_CATEGORIES.FOOT_L,
  'left_foot': JOINT_CATEGORIES.FOOT_L,
  'left_ankle': JOINT_CATEGORIES.FOOT_L,
  'LAnkle': JOINT_CATEGORIES.FOOT_L,
  'FootL': JOINT_CATEGORIES.FOOT_L,
  
  // Right Foot
  'rightankle': JOINT_CATEGORIES.FOOT_R,
  'RightAnkle': JOINT_CATEGORIES.FOOT_R,
  'righttoe': JOINT_CATEGORIES.FOOT_R,
  'RightToe': JOINT_CATEGORIES.FOOT_R,
  'right_foot': JOINT_CATEGORIES.FOOT_R,
  'right_ankle': JOINT_CATEGORIES.FOOT_R,
  'RAnkle': JOINT_CATEGORIES.FOOT_R,
  'FootR': JOINT_CATEGORIES.FOOT_R,
};

