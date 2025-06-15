import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Text } from 'troika-three-text';

function createMetricAxis({ from = -5, to = 5, color = 0xff0000, axis = 'x', tickSize = 0.1, linewidth = 3 }) {
  const group = new THREE.Group();

  // thick main axis with line2
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  start[axis] = from;
  end[axis] = to;

  const positions = [...start.toArray(), ...end.toArray()];
  const geometry = new LineGeometry();
  geometry.setPositions(positions);

  const material = new LineMaterial({
    color,
    linewidth, // in pixels
    dashed: false,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight), // important!
  });

  const thickLine = new Line2(geometry, material);
  thickLine.computeLineDistances();
  thickLine.scale.set(1, 1, 1); // important for correct metrics
  group.add(thickLine);

  // tick marks + labels
  for (let i = Math.ceil(from); i <= Math.floor(to); i++) 
  {
    // only every 10 meters
    if (i % 10 !== 0) continue;
    const tickStart = new THREE.Vector3();
    const tickEnd = new THREE.Vector3();

    tickStart[axis] = i;
    tickEnd[axis] = i;

    // tick perpendicular to the axis
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

    // label
    const label = new Text();
    label.text = i.toString() + "m";
    label.fontSize = 0.3;
    label.color = color;
    label.anchorX = 'center';
    label.anchorY = 'top';
    label.position.copy(tickStart);

    if (axis === 'x') {
      label.position.y = -tickSize * 3;
    } else if (axis === 'y') {
      label.position.x = -tickSize * 3;
    } else if (axis === 'z') {
      label.position.y = -tickSize * 3;
    }

    label.sync();
    group.add(label);

  }

    // axis labels at the end of axis
    const axisLabel = new Text();
    axisLabel.text = axis.toUpperCase(); // "X", "Y", "Z"
    axisLabel.fontSize = 0.5;
    axisLabel.color = color;
    axisLabel.anchorX = 'center';
    axisLabel.anchorY = 'middle';

    // Position leicht versetzt hinter dem Endpunkt
    const labelOffset = 0.5; // Abstand hinter dem letzten Tick
    axisLabel.position.copy(end);
    if (axis === 'x') {
      axisLabel.position.x += labelOffset;
    } else if (axis === 'y') {
      axisLabel.position.y += labelOffset;
    } else if (axis === 'z') {
      axisLabel.position.z += labelOffset;
    }

    axisLabel.sync();
    group.add(axisLabel);

  return group;
}

export { createMetricAxis };
