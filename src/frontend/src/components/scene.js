import { Color, GridHelper, Scene } from 'three';
import { createLights } from './lights.js';
import { createThickAxis } from './coordsystem.js';

function createScene() {
  const scene = new Scene();
  const light = createLights();
  const gridHelper = new GridHelper(3000, 60);
  scene.add(gridHelper, light);

  const xAxis = createThickAxis(0xff0000, [0,0,0], [50,0,0], 3);
  const yAxis = createThickAxis(0x00ff00, [0,0,0], [0,50,0], 3);
  const zAxis = createThickAxis(0x0000ff, [0,0,0], [0,0,50], 3);
  scene.add(xAxis, yAxis, zAxis);  
  
  scene.background = new Color('white');
  return scene;
}

export { createScene };