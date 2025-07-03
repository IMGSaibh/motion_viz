import * as THREE from 'three';

// JointAxesVisualizer.js – ES‑6 Klasse (ohne IIFE)
// ------------------------------------------------------------
//  Visualize local coordinate axis (Three.AxesHelper) for each joint.
//  Example call:
//      const vis = new JointAxesVisualizer(scene, 21, { axesSize: 0.1 });
//      vis.update(joints); // joints = [{ position:[x,y,z], quaternion:[x,y,z,w] }, …]
//      vis.resizeAxes(0.3); // dynamically adjust Axislength
// ------------------------------------------------------------

'use strict';

/**
 * @class JointAxesVisualizer
 * @description Zeichnet pro Joint ein Three.AxesHelper‑Objekt und bietet
 *              Methoden zum Aktualisieren und dynamischen Skalieren.
 */
export class JointAxesVisualizer {
  /**
   * @param {THREE.Scene} scene              Three‑JS‑scene
   * @param {number}      jointCount         
   * @param {Object}      [opts]
   * @param {number}      [opts.axesSize=0.2] Länge jeder Achse des Helpers (Welteinheiten)
   */
  constructor(scene, jointCount, opts = {}) 
  {
    this.scene      = scene;
    this.jointCount = jointCount;
    this.axesSize   = opts.axesSize ?? 20.2; // standardmäßig etwas größer sichtbar

    /** @type {THREE.Object3D[]} */
    this.jointGroups = [];

    this.#createAxesHelpers();
  }

  /**
   * Aktualisiert Position & Orientierung aller Joints.
   * @param {{position:number[], quaternion?:number[]}[]} joints
   */
  update(joints) 
  {
    const n = Math.min(joints.length, this.jointGroups.length);
    
    if (joints.length !== this.jointCount)
    {
      console.warn(`[JointAxesVisualizer] Erwartet ${this.jointCount} Joints, erhalten ${joints.length}.`);
    }

    for (let i = 0; i < n; i++) 
    {
      const { position, quaternion } = joints[i];
      const g = this.jointGroups[i];

      g.position.set(position[0], position[1], position[2]);

      if (quaternion?.length === 4) 
      {
        g.quaternion.set(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
      }
      else
      {
        g.quaternion.identity();
      }
    }
  }

  /**
   * Skaliert nachträglich alle Achsen‑Helper auf eine neue Länge.
   * @param {number} newSize – neue Achsenlänge (in Welteinheiten)
   */
  resizeAxes(newSize) 
  {
    if (newSize <= 0) return;
    const factor = newSize / this.axesSize;
    this.axesSize = newSize;

    this.jointGroups.forEach(group => {
      group.children.forEach(child => {
        if (child instanceof THREE.AxesHelper) 
        {
          child.scale.multiplyScalar(factor);
        }
      });
    });
  }

  dispose() 
  {
    this.jointGroups.forEach(g => this.scene.remove(g));
    this.jointGroups.length = 0;
  }

  #createAxesHelpers() 
  {
    for (let i = 0; i < this.jointCount; i++) 
    {
      const group = new THREE.Object3D();
      const axes  = new THREE.AxesHelper(this.axesSize);
      group.add(axes);
      this.scene.add(group);
      this.jointGroups.push(group);
    }
  }
}
