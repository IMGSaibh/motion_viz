import npyjs from 'npyjs';
import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { JointCoordsystemLocal } from '@/threeJS/components/JointCoordSystemLocal';

import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

export class NPY_loader {
  npy_motion: THREE.Group;
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

  // joint_coordsystem_local: JointCoordsystemLocal | null;
  // joint_orientations: any[];

  trailLine: Line2 | null = null;
  trailGeometry: LineGeometry | null = null;
  trailMaterial: LineMaterial | null = null;

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
    this.joint_size = 0.2;
    this.scene = scene;
    this.joint_indices_names = [];
    this.joint_indices_names_text = new THREE.Group();
    // this.joint_coordsystem_local = null;
    // this.joint_orientations = [];

    this.trailLine = null;
    this.trailGeometry = null;
    this.trailMaterial = null;
  }

  async load_npy_animation(file_url: string) {
    const loader = new npyjs();
    const response = await fetch(file_url);
    const arrayBuffer = await response.arrayBuffer();
    const parsed_npy = loader.parse(arrayBuffer);

    this.npy_motion.name = file_url;
    this.numpy_data = parsed_npy.data;
    const [frameCount, jointCount, _] = parsed_npy.shape;
    this.frameCount = frameCount;
    this.jointCount = jointCount;

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
    this._create_joints();
    this._create_bones(skeleton_json);
  }

  create_full_trail(jointIndex: number = 0, frameIdx: number = this.currentFrame, windowSize: number = 50) {
    if (!this.numpy_data || this.jointCount <= 0 || this.frameCount <= 0) return;
    if (jointIndex < 0 || jointIndex >= this.jointCount) return;

    const clampedFrame = Math.min(Math.max(frameIdx, 0), this.frameCount - 1);

    // Frame 0: keine Linie anzeigen.
    // Ab Frame 1 werden Verbindungen zwischen den letzten max. 50 Segmenten angezeigt:
    // Frame 1  -> 0-1
    // Frame 2  -> 0-1, 1-2
    // Frame 50 -> 0-1 ... 49-50
    // Frame 51 -> 1-2 ... 50-51
    const startFrame = Math.max(0, clampedFrame - windowSize);
    const positions: number[] = [];

    for (let frame = startFrame; frame <= clampedFrame; frame++) {
      const base = frame * this.jointCount * 3;

      const x = this.numpy_data[base + jointIndex * 3 + 0];
      const y = this.numpy_data[base + jointIndex * 3 + 1];
      const z = this.numpy_data[base + jointIndex * 3 + 2];

      positions.push(x, y, z);
      console.log(`create_full_trail Frame ${frame}: Joint ${jointIndex} Position: (${x}, ${y}, ${z})`);
    }

    console.log(`Trail von Frame ${startFrame} bis ${clampedFrame}:`, positions);

    if (!this.trailGeometry) {
      this.trailGeometry = new LineGeometry();
    }

    if (!this.trailMaterial) {
      this.trailMaterial = new LineMaterial({
        color: 0xff0000,
        linewidth: 4,
      });
    }

    // Wichtig: Für breite Line2-Linien braucht LineMaterial die Viewport-Auflösung.
    // Falls du Zugriff auf renderer/domElement hast, kannst du diese Werte dort genauer setzen.
    if (typeof window !== 'undefined') {
      this.trailMaterial.resolution.set(window.innerWidth, window.innerHeight);
    }

    const hasVisibleSegment = positions.length >= 6;
    if (!hasVisibleSegment) {
      return;
    }

    this.trailGeometry.setPositions(positions);

    if (!this.trailLine) {
      this.trailLine = new Line2(this.trailGeometry, this.trailMaterial);
      this.trailLine.name = `joint_${jointIndex}_trail`;
      // this.scene.add(this.trailLine);
      this.npy_motion.add(this.trailLine);
    }

    this.trailLine.computeLineDistances();
  }

  _create_joints() {
    const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
    this.joint_indices_names = Array.from({ length: this.jointCount }, () => new Text());

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

  _create_bones(skeleton: any, renderer: THREE.WebGLRenderer | null = null) {
    const boneGeometry = new THREE.CylinderGeometry(3.0, 3.0, 0.8, 8);
    const boneMaterial = new THREE.MeshNormalMaterial({
      // wireframe: true,
    });

    // const boneMaterial = new THREE.MeshBasicMaterial({
    //   color: 0xff0000,
    //   wireframe: true,
    // });

    const jointGraph = skeleton['joint-graph'];
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

      const bone = new THREE.Mesh(boneGeometry, boneMaterial);
      bone.matrixAutoUpdate = false;

      this.npy_motion.add(bone);

      // wir speichern exakt das, was die update_skeleton() erwartet
      this.npy_skeleton.push({
        childIdx,
        parentIdx,
        parentJoint: null, // brauchst du nicht mehr
        childJoint: null, // brauchst du nicht mehr
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

      if (i == 10) {
        console.log(`update_skeleton Frame ${frameIdx}: Joint ${i} Position: (${x}, ${y}, ${z})`);
      }
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

    if (this.trailLine) {
      if (this.trailLine.parent) {
        this.trailLine.parent.remove(this.trailLine);
      }
      this.trailLine = null;
    }
    this.trailGeometry?.dispose();
    this.trailGeometry = null;
    this.trailMaterial?.dispose();
    this.trailMaterial = null;
  }

  // create_full_trail(jointIndex: number = 0) {
  //   const positions: number[] = [];
  //   let lastPoint: THREE.Vector3 | null = null;

  //   for (let frame = 0; frame < 50; frame++) {
  //     const base = frame * this.jointCount * 3;

  //     const x = this.numpy_data[base + jointIndex * 3 + 0];
  //     const y = this.numpy_data[base + jointIndex * 3 + 1];
  //     const z = this.numpy_data[base + jointIndex * 3 + 2];

  //     const p = new THREE.Vector3(x, y, z);

  //     positions.push(p.x, p.y, p.z);
  //   }

  //   const geometry = new LineGeometry();
  //   geometry.setPositions(positions);

  //   const material = new LineMaterial({
  //     color: 0xff0000,
  //     linewidth: 4,
  //   });

  //   const trailLine = new Line2(geometry, material);

  //   trailLine.computeLineDistances();
  //   this.scene.add(trailLine);
  // }
}
