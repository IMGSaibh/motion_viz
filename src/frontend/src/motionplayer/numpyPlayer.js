import * as THREE from 'three';
import npyjs from 'npyjs';

export class NumpyPlayer {
  constructor() {
    this.joints = [];
    this.frameCount = 0;
    this.currentFrame = 0;
    this.elapsed = 0;
    this.speed = 1.0;
    this.fps = 60;
    this.npyObject = new THREE.Group();
    this.motionArray = null;
    this.jointCount = 0;
    this.isPlaying = false;


    this.npyObject.tick = (delta) => {
      if (this.isPlaying) this.update(delta);
    };
  }

  async load(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const loader = new npyjs();
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const parsed = loader.parse(arrayBuffer);

        this.motionArray = parsed.data;
        const [frameCount, jointCount, _] = parsed.shape;
        this.frameCount = frameCount;
        this.jointCount = jointCount;

        this.createSpheres();

        resolve(this.npyObject);

      } catch (e) {
        reject(e);
      }
    });
  }

  createSpheres() {
    const material = new THREE.MeshStandardMaterial({ color: 0xff6666 });

    for (let i = 0; i < this.jointCount; i++) {
      const geom = new THREE.SphereGeometry(2, 16, 16);
      const sphere = new THREE.Mesh(geom, material);
      this.npyObject.add(sphere);
      this.joints.push(sphere);
    }
  }

  update(delta) {
    if (!this.motionArray) return;

    this.elapsed += delta * this.speed;
    const frameIdx = Math.floor(this.elapsed * this.fps) % this.frameCount;

    if (frameIdx !== this.currentFrame) {
      this.currentFrame = frameIdx;
      this.setJointPositions(frameIdx);
    }
  }

  setJointPositions(frameIdx) 
  {
    const base = frameIdx * this.jointCount * 3;
    for (let i = 0; i < this.jointCount; i++) 
    {
      const x = this.motionArray[base + i * 3 + 0];
      const y = this.motionArray[base + i * 3 + 1];
      const z = this.motionArray[base + i * 3 + 2];
      this.joints[i].position.set(x, y, z);
    }
  }

  getFrameCount() 
  {
    return this.motionArray.shape[0]; // total frames
  }

  getFPS() 
  {
    return this.fps; // musst du beim Laden setzen
  }

  isPlaying() 
  {
    return this._isPlaying || false;
  }

  gotoFrame(frameIdx) 
  {
    this.currentFrame = frameIdx;
    this.setJointPositions(frameIdx); // sollte bereits existieren
  }

}
