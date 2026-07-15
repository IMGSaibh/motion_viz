import { BodyArea, mapNameToLimb, BodyPart } from "./limb_classifier"
import { getRestPose } from "@/hooks/hook_generate_animation_clip"
import * as THREE from 'three';
import { Text } from 'troika-three-text';

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
    bodyPart: BodyArea //defined in LimbClassifier
    // branchHeuristics: BranchHeuristics
}

type GraphNode = {
    id: number,
    neighbours: number[],
}

type BranchHeuristics = Map<BodyPart, number>; // Map of body part to heuristic score

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
        const filename = skeleton1_json_url.split('/').pop() || '';
        const npyFilename = filename.replace('.json', '.npy');
        const npyUrl = `data/npy/${npyFilename}`;
        console.log("Numpy URL:", npyUrl);

        let restPoseResponse = await getRestPose(npyUrl);
        this.restposeA = restPoseResponse.restPose;
        // console.log("Rest pose:", this.restposeA);

        const fileName2 = skeleton2_json_url.split('/').pop() || '';
        const npyFilename2 = fileName2.replace('.json', '.npy');
        const npyUrl2 = `data/npy/${npyFilename2}`;
        console.log("Numpy URL 2:", npyUrl2);

        restPoseResponse = await getRestPose(npyUrl2);
        this.restposeB = restPoseResponse.restPose;
        // console.log("Rest pose 2:", this.restpose2);
        
        // Collapse both skeletons
        this.collapseSkeleton(this.skeletonA);
        this.collapseSkeleton(this.skeletonB);
        
        
        // this.getHeightHeuristic(this.skeletonB.topologicalBranches, this.restposeB);
        // this.getNamingHeuristic(this.skeleton1.topologicalBranches);
        // console.log("Skeleton 1:", this.skeletonA);
        // console.log("Skeleton 2:", this.skeletonB);
        let graphA = this.getGraphRepresentation(this.skeletonA);
        let graphB = this.getGraphRepresentation(this.skeletonB);


        const matches: Map<number, number>[] = [];
        this.matchGraphs(graphA, graphB, new Map(), matches);

        console.log(`Found ${matches.length} possible matches`);
        if (matches.length > 0) {
            console.log("First match:", Array.from(matches[0].entries()));
        }
        let matchColors: Map<number, string> = new Map();
        let cI = 0;
        if(matches.length !== 0) {
            for(const m of matches[0].entries()) {  
                const color: string = getNextColor(cI++);
                matchColors.set(m[0], color);
                matchColors.set(m[1], color);
                console.log(`Match: ${m[0]} -> ${m[1]}, Color: ${color}`);
            }
        }


        this.graphVisualizer?.drawGraph(graphA, this.restposeA, -50, matchColors, scene);
        this.graphVisualizer?.drawGraph(graphB, this.restposeB, 50, matchColors, scene);

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
            const heuristics = new Map<BodyPart, number>();
            this.getNamingHeuristic(branch, heuristics);
            //if start ID is not in the graph, add it with end ID as neighbour
            if(!coveredIDs.has(startId)) {
                graph.push({ id: startId, neighbours: [endId] });
                coveredIDs.add(startId);
            }
            //if start ID is already in the graph, add end ID as neighbour if not already present
            else {
                const existingNode = graph.find(node => node.id === startId);
                if (existingNode && !existingNode.neighbours.includes(endId)) {
                    existingNode.neighbours.push(endId);
                }
            }
            //same for end ID
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
                            bodyPart: BodyArea.NONE
                        });
                    }
                }
            }
        }
        
    // Store collapsed edges on skeleton
    skeleton.topologicalBranches = collapsedEdges;
    }

    private matchGraphs(graphA: GraphNode[], graphB: GraphNode[], match: Map<number, number> = new Map(), matches: Map<number, number>[] = []): Map<number, number>[] {
    
    // If all nodes in graphA are matched, we have a complete solution
    if (match.size === graphA.length) {
        matches.push(new Map(match));
        return matches;
    }
    
    // Get the next unmatched node from graphA
    const nodeA = graphA.find(node => !match.has(node.id));
    if (!nodeA) return matches;
    
    // Try to match nodeA with every node in graphB
    for (const nodeB of graphB) {
        if (this.canMatch(graphB, nodeA, nodeB, match)) {
            // Add to match and recurse
            match.set(nodeA.id, nodeB.id);
            this.matchGraphs(graphA, graphB, match, matches);
            // Backtrack
            match.delete(nodeA.id);
        }
    }
    
    return matches;
    }

    private canMatch(
        graphB: GraphNode[],
        nodeA: GraphNode,
        nodeB: GraphNode,
        match: Map<number, number>
    ): boolean {
        
        // Constraint 1: nodeB must not already be matched
        if (Array.from(match.values()).includes(nodeB.id)) {
            return false;
        }
        
        // Constraint 2: nodeA must have <= neighbors than nodeB
        if (nodeA.neighbours.length > nodeB.neighbours.length) {
            return false;
        }
        
        // Constraint 3: Neighbor consistency
        // For each neighbor of nodeA that is already matched,
        // its matched partner must be a neighbor of nodeB
        for (const neighborId of nodeA.neighbours) {
            if (match.has(neighborId)) {
                const matchedNeighborId = match.get(neighborId)!;
                // Find the matched neighbor node in graphB
                const matchedNeighborB = graphB.find(n => n.id === matchedNeighborId);
                if (!matchedNeighborB) return false;
                
                // Check if matchedNeighborB is actually adjacent to nodeB
                if (!nodeB.neighbours.includes(matchedNeighborId)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    private evaluate(
        graphA: GraphNode[],
        graphB: GraphNode[],
        match: Map<number, number>,
        formerNodesA: Map<number, SkeletonNode[]>,  // node ID -> list of former nodes
        formerNodesB: Map<number, SkeletonNode[]>   // node ID -> list of former nodes
        ): number {
            let error = 0;
            
            for (const nodeA of graphA) {
                if (!match.has(nodeA.id)) {
                    // Penalty for unmatched node: number of nodes in its collapsed path
                    error += formerNodesA.get(nodeA.id)?.length || 0;
                } else {
                    const nodeBId = match.get(nodeA.id)!;
                    const nodeB = graphB.find(n => n.id === nodeBId);
                    if (!nodeB) {
                        error += 100; // Big penalty for invalid match
                        continue;
                    }
                    
                    // Penalty for path length mismatch
                    const lenA = formerNodesA.get(nodeA.id)?.length || 0;
                    const lenB = formerNodesB.get(nodeB.id)?.length || 0;
                    error += Math.abs(lenB - lenA);
                }
            }
            
            return error;
        }

    // HEURISTICS
    //************************************************************************************************************** */

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
        // heightsList[heightsList.length - 1].branch.bodyPart = BodyPart.HEAD;
        // heightsList[0].branch.bodyPart = BodyPart.LEG_LEFT;
        // heightsList[1].branch.bodyPart = BodyPart.LEG_RIGHT;
        // heightsList[2].branch.bodyPart = BodyPart.TORSO;
        // heightsList[3].branch.bodyPart = BodyPart.ARM_LEFT;
        // heightsList[4].branch.bodyPart = BodyPart.ARM_RIGHT;
    }

    private getNamingHeuristic(branch: TopologicalBranch, heuristics: BranchHeuristics) {
        for (const node of branch.path) {
            // console.log(`Node name: ${node.name}, mapped body part: ${mapNameToLimb(node.name)}`);
            const bodyPart = mapNameToLimb(node.name);
            if (bodyPart !== BodyPart.NONE) {
                heuristics.set(bodyPart, (heuristics.get(bodyPart) || 0) + 1);
            }
        }
         console.log(`Branch from ${branch.start.name} to ${branch.end.name} has heuristics:`, heuristics);
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
    drawGraph(graph: GraphNode[], restPose: number[][], offset:number, matchColors: Map<number, string>,scene: THREE.Scene): void {
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

function getNextColor(index:number): string { 
    return colors[index % colors.length];
}
