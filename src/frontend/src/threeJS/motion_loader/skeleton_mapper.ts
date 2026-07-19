import { BodyArea, mapNameToLimb, BodyPart } from "./limb_classifier"
import { getRestPose } from "@/hooks/hook_generate_animation_clip"
import * as THREE from 'three';
import { GraphVisualizer } from "./GraphVisualizer";

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
    branchHeuristics: BranchHeuristics
}

export type GraphNode = {
    id: number,
    neighbours: number[],
    bodyPart: BodyPart
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

        //TODO: Make sure that the skeleton1 is always the one with less nodes. Otherwise there will possibly be 0 matches fouund
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

        const sortedMatches = matches.sort((a, b) => {
            const scoreA = this.evaluateMatch(graphA, graphB, a);
            const scoreB = this.evaluateMatch(graphA, graphB, b);
            return scoreB - scoreA;  // Descending order (best first)
            });
        console.log("First match:", Array.from(sortedMatches[0].entries()), "Score: ", this.evaluateMatch(graphA, graphB, sortedMatches[0]));
        

        let matchColors: Map<number, string> = new Map();
        let cI = 0;
        if(sortedMatches.length !== 0) {
            for(const m of sortedMatches[0].entries()) {  
                const color: string = this.graphVisualizer?.getNextColor(cI++)!;
                matchColors.set(m[0], color);
                matchColors.set(m[1], color);
                console.log(`Match: ${m[0]} -> ${m[1]}, Color: ${color}`);
            }
        }

        this.evaluateGraph(graphA, this.skeletonA);
        this.evaluateGraph(graphB, this.skeletonB);


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
        for (const node of nodeMap.values()) {
            //In some .json files, the root node has the same pid as id, which is why we have to check for that
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
            //if start ID is not in the graph, add it with end ID as neighbour
            if(!coveredIDs.has(startId)) {
                graph.push({ id: startId, neighbours: [endId], bodyPart: BodyPart.NONE });
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
                graph.push({ id: endId, neighbours: [startId], bodyPart: BodyPart.NONE });
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
        const leafNodes = skeleton.nodes.filter(node => (node as any).valence === 1);
        const branchNodes = skeleton.nodes.filter(node => (node as any).valence > 2 || node === skeleton.root);
        const specialNodes = [...leafNodes, ...branchNodes];
        
        const collapsedEdges: TopologicalBranch[] = [];
        
        // For each branch node, we explore outwards to the next special node.
        //This means that leaf nodes are always the end of a branch (and not a start node), which makes processing later easier
        for (const startNode of branchNodes) {
            const neighbors = [...startNode.children];
            if (startNode.parent) {
                neighbors.push(startNode.parent);
            }
            
            for (const neighbor of neighbors) {
                if (!neighbor) continue;
                
                const path: SkeletonNode[] = [startNode];
                let current: SkeletonNode | null = neighbor; 
                let previous: SkeletonNode | null = startNode;
                
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
                    
                    //TODO: maybe just compare IDs here?
                    const isDuplicate = collapsedEdges.some(b => 
                        (b.start === startNode && b.end === current) ||
                        (b.start === current && b.end === startNode)
                    );
                    
                    if (!isDuplicate) {
                        let collapsedEdge: TopologicalBranch = {
                            start: startNode,
                            end: current,
                            path: path,
                            nodeCount: path.length,
                            bodyPart: BodyArea.NONE,
                            branchHeuristics: new Map<BodyPart, number>()
                            }
                        //This fills the branchHeuristics object of this edge with the heuristic weightings for what body part it is
                        this.getNamingHeuristic(collapsedEdge, collapsedEdge.branchHeuristics);
                        // console.log("Collapsed edge goes from ", startNode.id, " to ", collapsedEdge.end.id)
                        collapsedEdges.push(collapsedEdge);
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

    //This takes in a match, meaning a possible matching between graph A and graph B
    //It evaluates this match based on graph properties and naming and geometric heuristics, assigning it a score
    //This score can then be used to compare different matches and find the best one
    private evaluateMatch(
        graphA: GraphNode[],
        graphB: GraphNode[],
        match: Map<number, number>,
        // formerNodesA: Map<number, SkeletonNode[]>,  // node ID -> list of former nodes
        // formerNodesB: Map<number, SkeletonNode[]>   // node ID -> list of former nodes
        ): number {
            let score = 0;

            // let nodeBId = match.get(nodeA.id)!;

            // if (!match.has(nodeA.id)) {
            //     // Penalty for unmatched node: number of nodes in its collapsed path
            //     error += formerNodesA.get(nodeA.id)?.length || 0;
            // } else {
            //     const nodeB = graphB.find(n => n.id === nodeBId);
            //     if (!nodeB) {
            //         error += 100; // Big penalty for invalid match
            //         continue;
            //     }
                
            //     // Penalty for path length mismatch
            //     const lenA = formerNodesA.get(nodeA.id)?.length || 0;
            //     const lenB = formerNodesB.get(nodeB.id)?.length || 0;
            //     error += Math.abs(lenB - lenA);
            // }

            for(const [aID, bID] of match) {
                // Find nodes by ID, not by array index
                const nodeA = graphA.find(n => n.id === aID);
                const nodeB = graphB.find(n => n.id === bID);
                
                if (!nodeA || !nodeB) {
                    score -= 10; // Big penalty for invalid match
                    continue;
                }
                
                if(nodeA.bodyPart === nodeB.bodyPart) {
                    score++;
                } else {
                    score -= 5;
                }
            }
            
            return score;
        }

    //This assigns the 
    private evaluateGraph(graph: GraphNode[], skeleton: Skeleton) {
            for (const node of graph) {

                // Get the highest value from the naming heuristics stored in the branches that include this node
                const branchesA = skeleton.topologicalBranches.filter(branch => branch.start.id === node.id || branch.end.id === node.id) || [];
                let estimatedBodyPart: BodyPart | null = null;
                let heuristics: BranchHeuristics = new Map<BodyPart, number>();
                branchesA.forEach(branch => {
                    for (const [key, value] of branch.branchHeuristics.entries()) {
                        heuristics.set(key, heuristics.get(key) || 0 + value);
                        }
                    })
                
                //leaf nodes cannot be the torso
                if(node.neighbours.length === 1) {
                    if(heuristics.get(BodyPart.TORSO)) {
                        heuristics.delete(BodyPart.TORSO);
                    }
                }
                console.log("Heuristics for nodeA:", node.id, heuristics);
                let maxValue = 0;
                heuristics.forEach((value, key) => {
                    if (value > maxValue) {
                        maxValue = value;
                        estimatedBodyPart = key;
                    }
                })
                console.log("Estimated body part for nodeA:", node.id, estimatedBodyPart);
            }
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
        // heightsList.sort((a, b) => a.avgHeight - b.avgHeight);
        // console.log(heightsList);

        //TODO: This is just for testing and visualization, replace this with more robust height heuristic
        // heightsList[heightsList.length - 1].branch.bodyPart = BodyPart.HEAD;
        // heightsList[0].branch.bodyPart = BodyPart.LEG_LEFT;
        // heightsList[1].branch.bodyPart = BodyPart.LEG_RIGHT;
        // heightsList[2].branch.bodyPart = BodyPart.TORSO;
        // heightsList[3].branch.bodyPart = BodyPart.ARM_LEFT;
        // heightsList[4].branch.bodyPart = BodyPart.ARM_RIGHT;
    }

    private getNamingHeuristic(branch: TopologicalBranch, heuristics: BranchHeuristics) {
        let identifiedNodes: number = 0;
        for (const node of branch.path) {
            // console.log(`Node name: ${node.name}, mapped body part: ${mapNameToLimb(node.name)}`);
            const bodyPart = mapNameToLimb(node.name);
            
            if (bodyPart !== BodyPart.NONE) {
                heuristics.set(bodyPart, (heuristics.get(bodyPart) || 0) + 1);
                identifiedNodes++;
            }
        }
        for (const [bodyPart, count] of heuristics.entries()) {
            heuristics.set(bodyPart, count / identifiedNodes); // Normalize by the number of identified nodes
        }
        // console.log(`Branch from ${branch.start.name} to ${branch.end.name} has heuristics:`, heuristics);
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



