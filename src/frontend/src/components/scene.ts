import { createLights } from './lights';
import { createMetricAxis } from './coordsystem';
import { BMFont } from 'three-text-geometry';

import {
  Color,
  Scene,
  TextureLoader,
  GridHelper,
  Texture
} from 'three'



function createScene() 
{
  const scene = new Scene();
  const light = createLights();
  const gridHelper = new GridHelper(3000, 60);
  gridHelper.name = "Grid";
  scene.add(gridHelper, light);

  // x-axis from -5 - 5 meters
  scene.add(createMetricAxis({ from: -15, to: 15, color: 0xff0000, axis: 'x', linewidth: 2 }));
  scene.add(createMetricAxis({ from: -5, to: 15, color: 0x00ff00, axis: 'y',linewidth: 2 }));
  scene.add(createMetricAxis({ from: -15, to: 15, color: 0x0000ff, axis: 'z',linewidth: 2 }));

  scene.background = new Color('white');
  return scene;
}

export { createScene };