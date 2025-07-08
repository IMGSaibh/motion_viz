import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import TextGeometry, { BMFont } from 'three-text-geometry';

/**
 * Helper to build an MSDF text mesh via three-text-geometry.
 * Supply the parsed BMFont JSON data and its matching texture.
 */
function createTextLabel(
  text: string,
  size: number,
  color: THREE.ColorRepresentation,
  font: BMFont,
  texture: THREE.Texture,
): THREE.Mesh {
    const geometry = new TextGeometry(text, {
    font,
    size,
  });

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    color,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
}

export interface MetricAxisOptions {
  /** Start value in world units */
  from?: number;
  /** End value in world units */
  to?: number;
  /** Tick/axis colour */
  color?: THREE.ColorRepresentation;
  /** Axis orientation */
  axis?: 'x' | 'y' | 'z';
  /** Half‑height/width of the tick mark */
  tickSize?: number;
  /** Line width in pixels */
  linewidth?: number;
  /** Parsed BMFont definition (JSON parsed to object) */
  font: BMFont;
  /** Texture belonging to the BMFont (MSDF/SDF atlas) */
  texture: THREE.Texture;
}

/**
 * Builds a metric axis with 10‑m tick marks and text labels.
 *
 * **Important:** Call only after `font` and `texture` have finished loading.
 */
export function createMetricAxis({
  from = -5,
  to = 5,
  color = 0xff0000,
  axis = 'x',
  tickSize = 0.1,
  linewidth = 3,
  font,
  texture,
}: MetricAxisOptions): THREE.Group {
  const group = new THREE.Group();

  // ---------------------------------------------------------------------
  // main axis (Line2)
  // ---------------------------------------------------------------------
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  start[axis] = from;
  end[axis] = to;

  const positions = [...start.toArray(), ...end.toArray()];
  const lineGeometry = new LineGeometry();
  lineGeometry.setPositions(positions);

  const lineMaterial = new LineMaterial({
    color,
    linewidth,
    dashed: false,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  });

  const thickLine = new Line2(lineGeometry, lineMaterial);
  thickLine.computeLineDistances();
  group.add(thickLine);

  // ---------------------------------------------------------------------
  // tick marks + numeric labels (every 10 m)
  // ---------------------------------------------------------------------
  for (let i = Math.ceil(from); i <= Math.floor(to); i++) {
    if (i % 10 !== 0) continue;

    const tickStart = new THREE.Vector3();
    const tickEnd = new THREE.Vector3();

    tickStart[axis] = i;
    tickEnd[axis] = i;

    // perpendicular orientation
    if (axis === 'x') {
      tickStart.y = -tickSize;
      tickEnd.y = tickSize;
    } else if (axis === 'y') {
      tickStart.x = -tickSize;
      tickEnd.x = tickSize;
    } else {
      // z‑axis
      tickStart.y = -tickSize;
      tickEnd.y = tickSize;
    }

    const tickGeo = new THREE.BufferGeometry().setFromPoints([tickStart, tickEnd]);
    const tick = new THREE.Line(tickGeo, new THREE.LineBasicMaterial({ color }));
    group.add(tick);

    // label mesh for the tick
    const labelMesh = createTextLabel(`${i}m`, 0.3, color, font, texture);
    labelMesh.position.copy(tickStart);

    if (axis === 'x') {
      labelMesh.position.y = -tickSize * 3;
    } else if (axis === 'y') {
      labelMesh.position.x = -tickSize * 3;
    } else {
      labelMesh.position.y = -tickSize * 3;
    }

    group.add(labelMesh);
  }

  // ---------------------------------------------------------------------
  // axis label (X/Y/Z)
  // ---------------------------------------------------------------------
  const axisLabelMesh = createTextLabel(axis.toUpperCase(), 0.5, color, font, texture);
  axisLabelMesh.position.copy(new THREE.Vector3().setComponent('xyz'.indexOf(axis), to + 0.5));
  group.add(axisLabelMesh);

  return group;
}
