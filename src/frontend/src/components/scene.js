import { Color, GridHelper, Scene } from 'three';
import { createLights } from './lights.js';

function createScene() {
  const scene = new Scene();
  const light = createLights();
  const gridHelper = new GridHelper(3000, 60);

  scene.add(gridHelper, light);
  scene.background = new Color('white');
  return scene;
}

export { createScene };