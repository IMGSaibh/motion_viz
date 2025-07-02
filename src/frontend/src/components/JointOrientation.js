// JointAxesVisualizer.js – ES‑6 Klasse (ohne IIFE)
// ------------------------------------------------------------
//  Visualisiert nur lokale Koordinatenachsen (Three.AxesHelper)
//  an jedem Gelenk‑Datensatz. Kugeln oder andere Marker baust
//  du separat.
//
//  Einbinden per <script> (Three.js muss vorher geladen sein):
//      <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
//      <script src="JointAxesVisualizer.js"></script>
//
//  Beispiel:
//      const vis = new JointAxesVisualizer(scene, 21, { axesSize: 0.1 });
//      vis.update(joints);  // joints = [{ position:[x,y,z], quaternion:[x,y,z,w] }, …]
//
// ------------------------------------------------------------

'use strict';

/**
 * @class JointAxesVisualizer
 * @description Zeichnet pro Joint ein Three.AxesHelper‑Objekt und bietet
 *              eine einfache update‑Methode für Position & Orientierung.
 */
export class JointAxesVisualizer {
  /**
   * @param {THREE.Scene} scene              Three‑JS‑Szene
   * @param {number}      jointCount         Anzahl der Joints
   * @param {Object}      [opts]
   * @param {number}      [opts.axesSize=0.06] Länge jeder Achse des Helpers
   */
  constructor(scene, jointCount, opts = {}) {
    if (typeof THREE === 'undefined') {
      throw new Error('Three.js muss vor JointAxesVisualizer geladen sein.');
    }

    this.scene      = scene;
    this.jointCount = jointCount;
    this.axesSize   = opts.axesSize ?? 0.06;

    /** @type {THREE.Object3D[]} */
    this.jointGroups = [];

    this.#createAxesHelpers();
  }

  // ---------------------- public API ----------------------

  /**
   * Aktualisiert alle Joints in einem Aufruf.
   * @param {{position:number[], quaternion?:number[]}[]} joints
   */
  update(joints) {
    const n = Math.min(joints.length, this.jointGroups.length);
    if (joints.length !== this.jointCount) {
      console.warn(`[JointAxesVisualizer] Erwartet ${this.jointCount} Joints, erhalten ${joints.length}.`);
    }

    for (let i = 0; i < n; i++) {
      const { position, quaternion } = joints[i];
      const g = this.jointGroups[i];

      g.position.set(position[0], position[1], position[2]);

      if (quaternion?.length === 4) {
        g.quaternion.set(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
      } else {
        g.quaternion.identity();
      }
    }
  }

  /**
   * Entfernt alle erzeugten Hilfsobjekte aus der Szene.
   */
  dispose() {
    this.jointGroups.forEach(g => this.scene.remove(g));
    this.jointGroups.length = 0;
  }

  // -------------------- private helpers -------------------

  /** Erzeugt pro Joint ein Object3D + AxesHelper. */
  #createAxesHelpers() {
    for (let i = 0; i < this.jointCount; i++) {
      const group = new THREE.Object3D();
      const axes  = new THREE.AxesHelper(this.axesSize);
      group.add(axes);
      this.scene.add(group);
      this.jointGroups.push(group);
    }
  }
}

// Global verfügbar machen (falls nicht in Modul‑Umgebung)
if (typeof window !== 'undefined') {
  window.JointAxesVisualizer = JointAxesVisualizer;
}
