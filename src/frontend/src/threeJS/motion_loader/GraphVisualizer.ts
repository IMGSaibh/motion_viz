import { Text } from 'troika-three-text';
import * as THREE from 'three';
import { GraphNode } from './skeleton_mapper';

export class GraphVisualizer {
    public drawGraph(graph: GraphNode[], restPose: number[][], offset:number, matchColors: Map<number, string>,scene: THREE.Scene): void {
        const nodePositions = new Map<number, THREE.Vector3>();
        const offsetVector = new THREE.Vector3(offset, 0, 0);

        // Create spheres for each node
        for (const node of graph) {
            const pos = restPose[node.id];
            if (!pos) continue;

            const position = new THREE.Vector3(pos[0], pos[1], pos[2]).add(offsetVector);
            nodePositions.set(node.id, position);

            // Create sphere
            const sphereGeometry = new THREE.SphereGeometry(2.5, 16, 16);
            const sphereMaterial = new THREE.MeshStandardMaterial({
                color: matchColors.get(node.id) || 0x00ff00,
                roughness: 0.3,
                metalness: 0.1,
                emissiveIntensity: 0.2
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.copy(position);
            scene.add(sphere);

            const textLabel = this.createTextLabel(
                String(node.id), 
                new THREE.Vector3(pos[0], pos[1] + 7, pos[2]).add(offsetVector), 
                scene,
                3,
                0xff0000
            );
        }

        // Create cylinders for each connection
        const connectionSet = new Set<string>();
        for (const node of graph) {
            const startPos = nodePositions.get(node.id);
            if (!startPos) continue;

            for (const neighbourId of node.neighbours) {
                // Avoid duplicate connections (only add once)
                const key = [node.id, neighbourId].sort().join('-');
                if (connectionSet.has(key)) continue;
                connectionSet.add(key);

                const endPos = nodePositions.get(neighbourId);
                if (!endPos) continue;

                this.createCylinder(startPos, endPos, 0x66ccff, scene);
            }
        }
    }

    public getNextColor(index:number): string { 
        return colors[index % colors.length];
    }

    private createCylinder(start: THREE.Vector3, end: THREE.Vector3, color: number, scene: THREE.Scene): void {
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        direction.normalize();

        // Cylinder geometry (height = length)
        const cylinderGeometry = new THREE.CylinderGeometry(0.7, 0.7, length, 6);
        const cylinderMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.4,
            metalness: 0.3,
            transparent: true,
            opacity: 0.8
        });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.copy(midPoint);

        // Orient cylinder along direction
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        cylinder.quaternion.copy(quaternion);

        scene.add(cylinder);
    }


    createTextLabel(text: string, position: THREE.Vector3, scene: THREE.Scene, fontSize: number = 8, color: number = 0x000000): Text {
    const textLabel = new Text();
    textLabel.text = text;
    textLabel.fontSize = fontSize;
    textLabel.anchorX = 'center';
    textLabel.anchorY = 'middle';
    textLabel.color = color;
    textLabel.position.copy(position);
    textLabel.sync(); // Important: must sync to generate geometry
    
    scene.add(textLabel as unknown as THREE.Object3D);
    return textLabel;
}
}

const colors = [
  '#E6194B', // Red
  '#3CB44B', // Green
  '#4363D8', // Blue
  '#FFE119', // Yellow
  '#F032E6', // Magenta
  '#42D4F4', // Cyan
  '#F58231', // Orange
  '#911EB4', // Purple
  '#46F0F0', // Teal
  '#BCF60C', // Lime
  '#FABEBE', // Pink
  '#008080', // Olive
  '#E6BEFF', // Lavender
  '#9A6324', // Brown
  '#FFFAC8', // Beige
  '#800000', // Maroon
  '#AFFC41', // Neon Green
  '#808000', // Dark Yellow
  '#FFD8B1', // Peach
  '#000075', // Navy
  '#A9A9A9', // Dark Gray
  '#DC143C', // Crimson
  '#00FA9A', // Medium Spring Green
  '#4169E1', // Royal Blue
  '#FF8C00', // Dark Orange
  '#7B68EE', // Medium Slate Blue
  '#FF1493', // Deep Pink
  '#20B2AA', // Light Sea Green
  '#9370DB', // Medium Purple
  '#F08080'  // Light Coral
];

