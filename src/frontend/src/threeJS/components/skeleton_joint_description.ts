import * as THREE from 'three';
import { Text } from 'troika-three-text';
import type { NPY_loader } from '@/threeJS/motion_loader/npy_loader';

export class SkeletonJointDescription {
  private group = new THREE.Group();
  private labels: Text[] = [];

  constructor(private scene: THREE.Scene) {
    this.group.name = 'jointLabels';
    this.scene.add(this.group);
  }

  //   /** Call once after the skeleton has been created */
  //   create(jointCount: Number) {
  //     for (let j = 0; j < jointCount; j++) {
  //       const joint_label = new Text();
  //       joint_label.text = String(j);
  //       joint_label.fontSize = 1.0;
  //       joint_label.anchorX = 'center';
  //       joint_label.anchorY = 'bottom';

  //       // Typing workaround if the Troika and Three types do not match:
  //       this.group.add(joint_label as unknown as THREE.Object3D);
  //       this.labels.push(joint_label);
  //     }
  //   }

  //   updatePositions(position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
  //     const joints = this.loader.joints as THREE.Object3D[]; // Joint meshes from the loader
  //     for (let j = 0; j < this.labels.length; j++) {
  //       this.labels[j].position.copy(position);
  //     }
  //   }

  dispose() {
    for (const t of this.labels) {
      t.parent?.remove(t as unknown as THREE.Object3D);
      (t as any).dispose?.();
    }
    this.labels.length = 0;
    this.scene.remove(this.group);
  }
}
