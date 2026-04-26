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
  mesh: any = [];
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
    this.joint_size = 0.2;
    this.scene = scene;
    this.joint_indices_names = [];
    this.joint_indices_names_text = new THREE.Group();
    // this.joint_coordsystem_local = null;
    // this.joint_orientations = [];
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

      const meshmaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const meshgeom = new THREE.SphereGeometry(1.0, 8, 8);
      this.mesh[`sphere_${i}`] = new THREE.Mesh(meshgeom, meshmaterial);
      this.mesh[`sphere_${i}`].trailLength = 250;
      this.mesh[`sphere_${i}`].trailPoints = [];
      this.mesh[`sphere_${i}`].speed = 0.1;
      this.mesh[`sphere_${i}`].targetPosition = new THREE.Vector3();

      const trailMaterial = new LineMaterial({
        color: 0xff0000,
        linewidth: 4,
      });
      trailMaterial.resolution.set(window.innerWidth, window.innerHeight);
      this.mesh[`trail_${i}`] = new Line2(new LineGeometry(), trailMaterial);
      this.mesh[`trail_${i}`].frustumCulled = false;
      this.mesh[`trail_${i}`].name = 'trail of joint' + this.joint_indices_names[i].text;
      this.scene.add(this.mesh[`trail_${i}`]);
      // this.scene.add(this.mesh[`sphere_${i}`]);
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

  // create_trail() {
  //   this.mesh['trail_1'] = new THREE.Line(new THREE.BufferGeometry(), new LineMaterial({ color: 0x00ff00 }));
  //   this.scene.add(this.mesh);
  // }

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

      this.mesh[`sphere_${i}`].targetPosition.set(x, y, z);
      this.mesh[`sphere_${i}`].position.lerp(this.mesh[`sphere_${i}`].targetPosition, this.mesh[`sphere_${i}`].speed);

      // Für den Trail: echte Joint-Koordinate dieses Frames speichern
      this.mesh[`sphere_${i}`].trailPoints.push(new THREE.Vector3(x, y, z));

      if (this.mesh[`sphere_${i}`].trailPoints.length > this.mesh[`sphere_${i}`].trailLength) {
        this.mesh[`sphere_${i}`].trailPoints.shift();
      }

      const positions: number[] = [];

      for (let j = 0; j < this.mesh[`sphere_${i}`].trailPoints.length; j++) {
        const p = this.mesh[`sphere_${i}`].trailPoints[j];
        positions.push(p.x, p.y, p.z);
      }

      // if (i < 2) {
      //   console.log(`Joint ${i} trail or Line:`, this.mesh[`trail_${i}`]);
      // }
      // if (i === 0) {
      //   console.log(this.mesh[`sphere_${i}`].trailPoints.length, positions.length);
      // }

      // this.mesh[`trail_${i}`].geometry.setPositions(positions);
      // this.mesh[`trail_${i}`].geometry.needsUpdate = true;

      if (positions.length >= 6) {
        this.mesh[`trail_${i}`].geometry.setPositions(positions);
        this.mesh[`trail_${i}`].computeLineDistances();
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
  }
}
