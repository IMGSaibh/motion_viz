import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Text } from 'troika-three-text';

export interface MetricAxisOptions 
{
  from?: number;
  to?: number;
  color?: THREE.ColorRepresentation;
  axis?: 'x' | 'y' | 'z';
  tickSize?: number;
  linewidth?: number;
}

export function createMetricAxis({
  from = -5,
  to = 5,
  color = 0xff0000,
  axis = 'x',
  tickSize = 0.1,
  linewidth = 3,
}: MetricAxisOptions): THREE.Group {
  const group = new THREE.Group();

  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  start[axis] = from;
  end[axis] = to;

  const positions = [...start.toArray(), ...end.toArray()];
  const geometry = new LineGeometry();
  geometry.setPositions(positions);

  const material = new LineMaterial({
    color,
    linewidth,
    dashed: false,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  });

  const thickLine = new Line2(geometry, material);
  thickLine.computeLineDistances();
  thickLine.scale.set(1, 1, 1);
  group.add(thickLine);

  for (let i = Math.ceil(from); i <= Math.floor(to); i++) {
    if (i % 10 !== 0) continue;

    const tickStart = new THREE.Vector3();
    const tickEnd = new THREE.Vector3();
    tickStart[axis] = i;
    tickEnd[axis] = i;

    if (axis === 'x') {
      tickStart.y = -tickSize;
      tickEnd.y = tickSize;
    } else if (axis === 'y') {
      tickStart.x = -tickSize;
      tickEnd.x = tickSize;
    } else if (axis === 'z') {
      tickStart.y = -tickSize;
      tickEnd.y = tickSize;
    }

    const tickGeo = new THREE.BufferGeometry().setFromPoints([tickStart, tickEnd]);
    const tick = new THREE.Line(tickGeo, new THREE.LineBasicMaterial({ color }));
    group.add(tick);

    const label = new Text();
    label.text = i.toString() + 'm';
    label.fontSize = 0.3;
    label.color = color;
    label.anchorX = 'center';
    label.anchorY = 'top';
    label.position.copy(tickStart);

    if (axis === 'x') {
      label.position.y = -tickSize * 3;
      group.name = 'Origin_Axis_X';
    } else if (axis === 'y') {
      label.position.x = -tickSize * 3;
      group.name = 'Origin_Axis_Y';
    } else if (axis === 'z') {
      label.position.y = -tickSize * 3;
      group.name = 'Origin_Axis_Z';
    }

    label.sync();
    group.add(label as unknown as THREE.Object3D);
  }

  const axisLabel = new Text();
  axisLabel.text = axis.toUpperCase();
  axisLabel.fontSize = 0.5;
  axisLabel.color = color;
  axisLabel.anchorX = 'center';
  axisLabel.anchorY = 'middle';
  axisLabel.position.copy(end);

  const labelOffset = 0.5;
  if (axis === 'x') {
    axisLabel.position.x += labelOffset;
  } else if (axis === 'y') {
    axisLabel.position.y += labelOffset;
  } else if (axis === 'z') {
    axisLabel.position.z += labelOffset;
  }

  axisLabel.sync();
  group.add(axisLabel as unknown as THREE.Object3D);

  return group;
}
