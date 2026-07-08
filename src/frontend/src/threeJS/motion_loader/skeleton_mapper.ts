import { BodyPart, mapNameToLimb } from "./limb_classifier"
import { getRestPose } from "@/hooks/hook_generate_animation_clip"
import * as THREE from 'three';

type SkeletonNode = {
    id: number,
    pid: number,
    name: string,
    children: SkeletonNode[],
    parent: SkeletonNode | null
}

type Skeleton = {
    nodes: SkeletonNode[],
    topologicalBranches: TopologicalBranch[],
    root: SkeletonNode | null
}

type TopologicalBranch = {
    start: SkeletonNode,
    end: SkeletonNode,
    path: SkeletonNode[],
    nodeCount: number,
    bodyPart: BodyPart //defined in LimbClassifier
    branchHeuristics: BranchHeuristics
}

type GraphNode = {
    id: number,
    neighbours: number[],
}

type BranchHeuristics = {
    leg_l_weight: number,
    leg_r_weight: number,
    arm_l_weight: number,
    arm_r_weight: number,
    torso_weight: number,
    head_weight: number
}

export class SkeletonMapper {
    skeletonA: Skeleton | null = null;
    skeletonB: Skeleton | null = null;
    restposeA: number[][] = [];
    restposeB: number[][] = [];
    public graphA: GraphNode[] = [];
    public graphB: GraphNode[] = [];
    graphVisualizer: GraphVisualizer | null = null;

    constructor() {
        this.graphVisualizer = new GraphVisualizer();
    }

    async mapSkeletons(skeleton1_json_url: string, skeleton2_json_url: string, scene: THREE.Scene) {
        let response = await fetch(skeleton1_json_url);
        let json1 = await response.json();
        
        response = await fetch(skeleton2_json_url);
        let json2 = await response.json();
        
        this.skeletonA = this.buildSkeleton(json1);
        this.skeletonB = this.buildSkeleton(json2);

        // let skeleton1_npy_url = skeleton1_json_url.replace('.json', '.npy').replace('/json/', '/npy/');

        // console.log(skeleton1_npy_url);
        let restPoseResponse = await getRestPose("data/npy/example.npy");
        this.restposeA = restPoseResponse.restPose;
        console.log("Rest pose:", this.restposeA);

        restPoseResponse = await getRestPose("data/npy/A_test.npy");
        this.restposeB = restPoseResponse.restPose;
        // console.log("Rest pose 2:", this.restpose2);
        
        // Collapse both skeletons
        this.collapseSkeleton(this.skeletonA);
        this.collapseSkeleton(this.skeletonB);
        
        
        this.getHeightHeuristic(this.skeletonB.topologicalBranches, this.restposeB);
        // this.getNamingHeuristic(this.skeleton1.topologicalBranches);
        // console.log("Skeleton 1:", this.skeletonA);
        // console.log("Skeleton 2:", this.skeletonB);

        let graphB = this.getGraphRepresentation(this.skeletonB);
        console.log("Graph B:", graphB);

        this.graphVisualizer?.drawGraph(graphB, this.restposeB, scene);

        let match: number[] = [];
        
        
    }

    private buildSkeleton(jsonData: any): Skeleton {
        const jointGraph = jsonData["joint-graph"];
        const nodeMap = new Map<number, SkeletonNode>();
        
        // Create all nodes
        for (const joint of jointGraph) {
            const node: SkeletonNode = {
                id: joint.id,
                pid: joint.pid,
                name: joint.name,
                children: [],
                parent: null
            };
            nodeMap.set(joint.id, node);
        }
        
        // Build parent-child relationships
        for (const [id, node] of nodeMap) {
            if (node.pid !== node.id && nodeMap.has(node.pid)) {
                const parent = nodeMap.get(node.pid)!;
                node.parent = parent;
                parent.children.push(node);
            }
        }
        
        // Find root
        let root: SkeletonNode | null = null;
        for (const [id, node] of nodeMap) {
            if (node.parent === null) {
                root = node;
                break;
            }
        }
        
        return {
            nodes: Array.from(nodeMap.values()),
            root: root,
            topologicalBranches: []
        };
    }

    private getGraphRepresentation(skeleton: Skeleton): GraphNode[] {
        const graph: GraphNode[] = [];
        let coveredIDs = new Set<number>();
        for (const branch of skeleton.topologicalBranches) {
            const startId = branch.start.id;
            const endId = branch.end.id;

            if(!coveredIDs.has(startId)) {
                graph.push({ id: startId, neighbours: [endId] });
                coveredIDs.add(startId);
            }
            else {
                const existingNode = graph.find(node => node.id === startId);
                if (existingNode && !existingNode.neighbours.includes(endId)) {
                    existingNode.neighbours.push(endId);
                }
            }
            if(!coveredIDs.has(endId)) {
                graph.push({ id: endId, neighbours: [startId] });
                coveredIDs.add(endId);
            }
            else {
                const existingNode = graph.find(node => node.id === endId);
                if (existingNode && !existingNode.neighbours.includes(startId)) {
                    existingNode.neighbours.push(startId);
                }
            }
        }

        for (const branch of skeleton.topologicalBranches) {
            const startId = branch.start.id;
            const endId = branch.end.id;


        }
        
        return graph;
 }

    private collapseSkeleton(skeleton: Skeleton): void {
        if (!skeleton || !skeleton.root) return;
        
        // Compute valence for each node
        for (const node of skeleton.nodes) {
            const valence = node.children.length + (node.parent ? 1 : 0);
            (node as any).valence = valence;
        }
        
        // Find special nodes: root, leaves (valence 1), branches (valence > 2)
        const specialNodes = skeleton.nodes.filter(node => {
            const valence = (node as any).valence;
            return node === skeleton.root || valence === 1 || valence > 2;
        });
        
        const collapsedEdges: TopologicalBranch[] = [];
        
        // For each special node, explore paths to other special nodes
        for (const startNode of specialNodes) {
            const neighbors = [...startNode.children];
            if (startNode.parent) {
                neighbors.push(startNode.parent);
            }
            
            for (const neighbor of neighbors) {
                if (!neighbor) continue;
                
                const path: SkeletonNode[] = [startNode];
                let current: SkeletonNode | null = neighbor;  // Allow null
                let previous: SkeletonNode | null = startNode;  // Allow null
                
                // Follow the path until we hit another special node
                while (current && !specialNodes.includes(current)) {
                    path.push(current);
                    
                    const nextNodes: SkeletonNode[] = [...current.children];
                    if (current.parent && current.parent !== previous) {
                        nextNodes.push(current.parent);
                    }
                    
                    const next: SkeletonNode | null = nextNodes.find(n => n !== previous) || null;
                    previous = current;
                    current = next;
                }
                
                if (current && specialNodes.includes(current) && current !== startNode) {
                    path.push(current);
                    
                    const isDuplicate = collapsedEdges.some(b => 
                        (b.start === startNode && b.end === current) ||
                        (b.start === current && b.end === startNode)
                    );
                    
                    if (!isDuplicate) {
                        collapsedEdges.push({
                            start: startNode,
                            end: current,
                            path: path,
                            nodeCount: path.length,
                            bodyPart: BodyPart.NONE,
                            branchHeuristics: {
                                leg_l_weight: 0,
                                leg_r_weight: 0,
                                arm_l_weight: 0,
                                arm_r_weight: 0,
                                torso_weight: 0,
                                head_weight: 0
                            }
                        });
                    }
                }
            }
        }
        
    // Store collapsed edges on skeleton
    skeleton.topologicalBranches = collapsedEdges;
    }

    private getHeightHeuristic (branches: TopologicalBranch[], restpose: number[][]): void {
        if (!restpose || restpose.length === 0) {
            console.warn("Rest pose data is empty or undefined. Cannot compute height heuristic.");
            return;
        }

        type HeightInfo = {
            branch: TopologicalBranch,
            avgHeight: number
        };

        let heightsList: HeightInfo[] = [];
        for(const branch of branches) {
            const avgHeight = this.getAvgPathHeight(branch.path, restpose);
            heightsList.push({ branch, avgHeight });
        }

        // Sort branches by average height
        heightsList.sort((a, b) => a.avgHeight - b.avgHeight);
        console.log(heightsList);

        //TODO: This is just for testing and visualization, replace this with more robust height heuristic
        heightsList[heightsList.length - 1].branch.bodyPart = BodyPart.HEAD;
        heightsList[0].branch.bodyPart = BodyPart.LEG_LEFT;
        heightsList[1].branch.bodyPart = BodyPart.LEG_RIGHT;
        heightsList[2].branch.bodyPart = BodyPart.TORSO;
        heightsList[3].branch.bodyPart = BodyPart.ARM_LEFT;
        heightsList[4].branch.bodyPart = BodyPart.ARM_RIGHT;
    }
    private getNamingHeuristic(branches: TopologicalBranch[]): BodyPart {
        for (const branch of branches) {
            for (const node of branch.path) {
                console.log(`Node name: ${node.name}, mapped body part: ${mapNameToLimb(node.name)}`);
                const bodyPart = mapNameToLimb(node.name);
                if (bodyPart !== BodyPart.NONE) {
                    return bodyPart;
                }
            }
        }
        return BodyPart.NONE;
    }

    private getAvgPathHeight(path: SkeletonNode[], restpose: number[][]): number {
        if (path.length === 0) return 0;
        let numNodes = 0;
        let totalHeight = 0;
        for (const node of path) {
            if (restpose[node.id]) {
                totalHeight += restpose[node.id][1]; // Assuming Y-axis is height
                numNodes++;
            }
        }
        if(numNodes === 0) return 0;
        return totalHeight / numNodes;
    }
}


export class GraphVisualizer {
    drawGraph(graph: GraphNode[], restPose: number[][], scene: THREE.Scene): void {
        const nodePositions = new Map<number, THREE.Vector3>();

        // Create spheres for each node
        for (const node of graph) {
            const pos = restPose[node.id];
            if (!pos) continue;

            const position = new THREE.Vector3(pos[0], pos[1], pos[2]);
            nodePositions.set(node.id, position);

            // Create sphere
            const sphereGeometry = new THREE.SphereGeometry(1.2, 16, 16);
            const sphereMaterial = new THREE.MeshStandardMaterial({
                color: 0x00ff88,
                roughness: 0.3,
                metalness: 0.1,
                emissive: 0x00ff88,
                emissiveIntensity: 0.2
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.copy(position);
            sphere.userData.isSkeletonVisualization = true;
            scene.add(sphere);
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
        cylinder.userData.isSkeletonVisualization = true;

        // Orient cylinder along direction
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        cylinder.quaternion.copy(quaternion);

        scene.add(cylinder);

        // Add a subtle glow line along the bone
        const points = [start, end];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x88ddff,
            transparent: true,
            opacity: 0.2
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData.isSkeletonVisualization = true;
        scene.add(line);
    }
}