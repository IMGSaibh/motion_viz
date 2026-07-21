import { Text } from 'troika-three-text';
import * as THREE from 'three';
import { GraphNode } from './graph';
import { TopologicalBranch } from './skeleton';

export class GraphVisualizer {
    public drawGraph(
        graph: GraphNode[], 
        restPose: number[][], 
        offset: number, 
        matchColors: Map<number, string>, 
        scene: THREE.Scene,
        topologicalBranches: TopologicalBranch[] 
    ): void {
        const nodePositions = new Map<number, THREE.Vector3>();
        const offsetVector = new THREE.Vector3(offset, 0, 0);

        // Create spheres for each node
        for (const node of graph) {
            const pos = restPose[node.id];
            if (!pos) continue;

            const position = new THREE.Vector3(pos[0], pos[1], pos[2]).add(offsetVector);
            nodePositions.set(node.id, position);

            // Create sphere for special node
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

            // Add text label for special node
            const textLabel = this.createTextLabel(
                String(node.id), 
                new THREE.Vector3(pos[0], pos[1] + 7, pos[2]).add(offsetVector), 
                scene,
                3,
                0xff0000
            );
        }

        // Draw collapsed nodes along topological branches
        if (topologicalBranches) {
            for (const branch of topologicalBranches) {
                const startPos = nodePositions.get(branch.start.id);
                const endPos = nodePositions.get(branch.end.id);
                
                if (!startPos || !endPos) continue;
                
                // Get the path nodes (including start and end)
                const path = branch.path;
                
                // For each node in the path (excluding start and end), place it along the line
                // between start and end, evenly distributed
                const intermediateNodes = path.slice(1, -1); // Exclude start and end
                const numIntermediate = intermediateNodes.length;
                
                if (numIntermediate > 0) {
                    // Calculate positions along the line from start to end
                    const direction = new THREE.Vector3().subVectors(endPos, startPos);
                    const totalLength = direction.length();
                    direction.normalize();
                    
                    // Distribute intermediate nodes evenly along the line
                    for (let i = 0; i < numIntermediate; i++) {
                        const t = (i + 1) / (numIntermediate + 1); // Fraction from start to end
                        const position = new THREE.Vector3().copy(startPos).add(
                            direction.clone().multiplyScalar(t * totalLength)
                        );
                        
                        // Create smaller sphere for collapsed node (with transparency)
                        const collapsedGeometry = new THREE.SphereGeometry(1.2, 8, 8);
                        const collapsedMaterial = new THREE.MeshStandardMaterial({
                            color: 0x888888, 
                            roughness: 0.5,
                            metalness: 0.1,
                            transparent: true,
                            opacity: 0.4 
                        });
                        const collapsedSphere = new THREE.Mesh(collapsedGeometry, collapsedMaterial);
                        collapsedSphere.position.copy(position);
                        scene.add(collapsedSphere);
                        const textLabel = this.createTextLabel(
                            String(intermediateNodes[i].id), 
                            new THREE.Vector3(position.x, position.y + 7, position.z), 
                            scene,
                            3,
                            0xff0000
                        ); 
                        
                    }
                }
            }
        }

        // Create cylinders for each connection (between special nodes)
        const connectionSet = new Set<string>();
        for (const node of graph) {
            const startPos = nodePositions.get(node.id);
            if (!startPos) continue;

            for (const neighbourId of node.neighbours) {
                const key = [node.id, neighbourId].sort().join('-');
                if (connectionSet.has(key)) continue;
                connectionSet.add(key);

                const endPos = nodePositions.get(neighbourId);
                if (!endPos) continue;

                this.createCylinder(startPos, endPos, 0x66ccff, scene);
            }
        }
    }

public async drawUnionSkeleton(
    skeleton_url: string, 
    restPose: number[][], 
    srcToDestMap: Map<number, number>, 
    virtualNodes: number[],
    scene: THREE.Scene,
    offset: number = 0
): Promise<void> {
    // Fetch the skeleton JSON
    const response = await fetch(skeleton_url);
    const jsonData = await response.json();
    const jointGraph = jsonData["joint-graph"];
    
    // Create a map for quick node lookup by ID
    const nodeMap = new Map<number, any>();
    for (const joint of jointGraph) {
        nodeMap.set(joint.id, joint);
    }
    
    const offsetVector = new THREE.Vector3(offset, 0, 0);
    const nodePositions = new Map<number, THREE.Vector3>();
    
    // Create spheres for each node in the joint graph
    for (const joint of jointGraph) {
        const pos = restPose[joint.id];
        if (!pos) continue;
        
        const position = new THREE.Vector3(pos[0], pos[1], pos[2]).add(offsetVector);
        nodePositions.set(joint.id, position);
        
        // Determine node type and color
        let color: string;
        let isMapped = false;
        let isVirtual = false;
        let mappedSrcId: number | null = null;
        
        // Check if this node is mapped (as destination)
        for (const [srcId, destId] of srcToDestMap) {
            if (destId === joint.id) {
                isMapped = true;
                mappedSrcId = srcId;
                break;
            }
        }
        
        // Check if this node is virtual
        if (virtualNodes.includes(joint.id)) {
            isVirtual = true;
        }
        
        // Assign color based on type
        if (isMapped) {
            color = '#00ff88'; // Bright green for mapped nodes
        } else if (isVirtual) {
            color = '#ff8800'; // Orange for virtual nodes
        } else {
            color = '#888888'; // Gray for unmapped/uncovered nodes
        }
        
        // Create sphere
        const sphereGeometry = new THREE.SphereGeometry(2.0, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.1,
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(position);
        scene.add(sphere);
        
        // Add text label
        let labelText: string;
        if (isMapped && mappedSrcId !== null) {
            labelText = `${mappedSrcId} → ${joint.id}`;
        } else if (isVirtual) {
            labelText = `${joint.id}`;
        } else {
            labelText = `${joint.id}`;
        }
        
        const textLabel = this.createTextLabel(
            labelText,
            new THREE.Vector3(pos[0], pos[1] + 8, pos[2]).add(offsetVector),
            scene,
            3,
            isMapped ? 0x00ff88 : isVirtual ? 0xff8800 : 0x888888
        );
    }
    
    // Create cylinders for each connection (bones)
    const connectionSet = new Set<string>();
    for (const joint of jointGraph) {
        const startPos = nodePositions.get(joint.id);
        if (!startPos) continue;
        
        // Skip if parent is the same (root node)
        if (joint.pid === joint.id) continue;
        
        const endPos = nodePositions.get(joint.pid);
        if (!endPos) continue;
        
        const key = [joint.id, joint.pid].sort().join('-');
        if (connectionSet.has(key)) continue;
        connectionSet.add(key);
        
        let boneColor = 0x66ccff; // Default blue                
        this.createCylinder(startPos, endPos, boneColor, scene);
    }
}

    public getNextColor(index: number): string { 
        return colors[index % colors.length];
    }

    private createCylinder(start: THREE.Vector3, end: THREE.Vector3, color: number, scene: THREE.Scene): void {
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        direction.normalize();

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
        textLabel.sync();
        
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

