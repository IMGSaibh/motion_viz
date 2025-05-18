import * as THREE from 'three';
import { Line2 } from '../../node_modules/three/examples/jsm/lines/Line2.js';
import { LineMaterial } from '../../node_modules/three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from '../../node_modules/three/examples/jsm/lines/LineGeometry.js';

function createThickAxis(color, start, end, linewidth) {
  const positions = [...start, ...end];
  const geometry = new LineGeometry();
  geometry.setPositions(positions);

  const material = new LineMaterial({
    color: color,
    linewidth: linewidth, // in pixels
    dashed: false,
  });

  const line = new Line2(geometry, material);
  line.computeLineDistances();
  return line;
}

export { createThickAxis };
