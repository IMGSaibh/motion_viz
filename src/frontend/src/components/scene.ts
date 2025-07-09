import { createLights } from './lights';
import { createMetricAxis } from './coordsystem';
import {
  Color,
  Scene,
  GridHelper,
} from 'three'

function createScene() 
{
  const scene = new Scene();
  const light = createLights();
  const gridHelper = new GridHelper(3000, 60);
  gridHelper.name = "Grid";
  scene.add(gridHelper, light);

  const axisX = createMetricAxis({ from: -15, to: 15, color: 0xff0000, axis: 'x', linewidth: 2 });
  const axisY = createMetricAxis({ from: -5, to: 15, color: 0x00ff00, axis: 'y', linewidth: 2  });
  const axisZ = createMetricAxis({ from: -15, to: 15, color: 0x0000ff, axis: 'z',linewidth: 2  });

  scene.add(axisX, axisY, axisZ);
  scene.background = new Color('white');
  return scene;
}

export { createScene };