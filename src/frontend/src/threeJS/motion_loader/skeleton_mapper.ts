import { BodyArea, mapNameToLimb, BodyPart } from "./limb_classifier"
import { getRestPose } from "@/hooks/hook_generate_animation_clip"
import * as THREE from 'three';
import { GraphVisualizer } from "./GraphVisualizer";
import { Skeleton, TopologicalBranch, SkeletonNode } from "./skeleton";
import { Graph, GraphNode } from "./graph";

type BranchHeuristics = Map<BodyPart, number>;

export class SkeletonMapper {
    skeletonA: Skeleton | null = null;
    skeletonB: Skeleton | null = null;
    restposeA: number[][] = [];
    restposeB: number[][] = [];
    graphA: Graph | null = null;
    graphB: Graph | null = null;
    graphVisualizer: GraphVisualizer | null = null;

    constructor() {
        this.graphVisualizer = new GraphVisualizer();
    }

    async mapSkeletons(skeleton1_json_url: string, skeleton2_json_url: string, scene: THREE.Scene) {
        let response = await fetch(skeleton1_json_url);
        let json1 = await response.json();
        
        response = await fetch(skeleton2_json_url);
        let json2 = await response.json();
        
        this.skeletonA = new Skeleton(json1);
        this.skeletonB = new Skeleton(json2);

        // Load rest poses
        const filename = skeleton1_json_url.split('/').pop() || '';
        const npyFilename = filename.replace('.json', '.npy');
        const npyUrl = `data/npy/${npyFilename}`;
        console.log("Numpy URL:", npyUrl);

        let restPoseResponse = await getRestPose(npyUrl);
        this.restposeA = restPoseResponse.restPose;

        const fileName2 = skeleton2_json_url.split('/').pop() || '';
        const npyFilename2 = fileName2.replace('.json', '.npy');
        const npyUrl2 = `data/npy/${npyFilename2}`;
        console.log("Numpy URL 2:", npyUrl2);

        restPoseResponse = await getRestPose(npyUrl2);
        this.restposeB = restPoseResponse.restPose;

        // Create graphs from skeletons
        this.graphA = new Graph(this.skeletonA);
        this.graphB = new Graph(this.skeletonB);

        // Match graphs
        const matches: Map<number, number>[] = [];
        this.matchGraphs(this.graphA, this.graphB, new Map(), matches);

        const sortedMatches = matches.sort((a, b) => {
            const scoreA = this.evaluateMatch(this.graphA!, this.graphB!, a);
            const scoreB = this.evaluateMatch(this.graphA!, this.graphB!, b);
            return scoreB - scoreA;
        });

        if (sortedMatches.length > 0) {
            console.log("Best match:", Array.from(sortedMatches[0].entries()), 
                "Score:", this.evaluateMatch(this.graphA!, this.graphB!, sortedMatches[0]));
        }

        // Create match colors for visualization
        let matchColors: Map<number, string> = new Map();
        let cI = 0;
        if (sortedMatches.length !== 0) {
            for (const m of sortedMatches[0].entries()) {
                const color: string = this.graphVisualizer?.getNextColor(cI++)!;
                matchColors.set(m[0], color);
                matchColors.set(m[1], color);
                console.log(`Match: ${m[0]} -> ${m[1]}, Color: ${color}`);
            }
        }

        // Visualize
        this.graphVisualizer?.drawGraph(this.graphA.getNodes(), this.restposeA, -100, matchColors, scene, this.skeletonA.topologicalBranches);
        this.graphVisualizer?.drawGraph(this.graphB.getNodes(), this.restposeB, 100, matchColors, scene, this.skeletonB.topologicalBranches);

        const unionSkeleton = this.createUnionSkeleton(this.skeletonA, this.skeletonB, sortedMatches[0]);
    }

    private matchGraphs(
        graphA: Graph,
        graphB: Graph,
        match: Map<number, number> = new Map(),
        matches: Map<number, number>[] = []
    ): Map<number, number>[] {
        
        if (match.size === graphA.getNodeCount()) {
            matches.push(new Map(match));
            return matches;
        }
        
        const nodeA = graphA.getNodes().find(node => !match.has(node.id));
        if (!nodeA) return matches;
        
        for (const nodeB of graphB.getNodes()) {
            if (this.canMatch(graphB, nodeA, nodeB, match)) {
                match.set(nodeA.id, nodeB.id);
                this.matchGraphs(graphA, graphB, match, matches);
                match.delete(nodeA.id);
            }
        }
        
        return matches;
    }

    private canMatch(
        graphB: Graph,
        nodeA: GraphNode,
        nodeB: GraphNode,
        match: Map<number, number>
    ): boolean {
        
        if (Array.from(match.values()).includes(nodeB.id)) {
            return false;
        }
        
        if (nodeA.neighbours.length > nodeB.neighbours.length) {
            return false;
        }
        
        for (const neighborId of nodeA.neighbours) {
            if (match.has(neighborId)) {
                const matchedNeighborId = match.get(neighborId)!;
                const matchedNeighborB = graphB.getNodeById(matchedNeighborId);
                if (!matchedNeighborB) return false;
                
                if (!nodeB.neighbours.includes(matchedNeighborId)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    private evaluateMatch(
        graphA: Graph,
        graphB: Graph,
        match: Map<number, number>
    ): number {
        let score = 0;

        for (const [aID, bID] of match) {
            const nodeA = graphA.getNodeById(aID);
            const nodeB = graphB.getNodeById(bID);
            
            if (!nodeA || !nodeB) {
                score -= 10;
                continue;
            }
            
            if (nodeA.bodyPart === nodeB.bodyPart) {
                score++;
            } else {
                score -= 5;
            }
        }
        
        return score;
    }

    /**
 * Creates a union skeleton by merging two matched skeletons
 * Following Algorithm 5 from the paper
 */
private createUnionSkeleton(
    srcSkeleton: Skeleton,
    destSkeleton: Skeleton,
    match: Map<number, number> // Maps node IDs from skeletonA to skeletonB
): Skeleton {
    //The goal of this algorithm is to have a skeleton with the topology of destSkeleton, but some of the nodes are purely virtual, meaning computed via Inverse Kinematics
    //For each other node in this unionSkeleton, we should know exactly what node of srcSkeleton maps to it, so we can then record that motion

    //Step 1
    //For each topological branch in the source skeleton, get the graphNode that corresponds to the startNode and the one that corresponds to the endNode
    //We are then looking for the corresponding topological branch from the destination skeleton. If that path does not exist, the algorithm fails
    //************************************************************************************************************************************************** */
    const srcToDestMap = new Map<number, number>();
    
    // For each topological branch in the source skeleton
    for (const srcBranch of srcSkeleton.topologicalBranches) {
        const srcStartId = srcBranch.start.id;
        const srcEndId = srcBranch.end.id;
        
        // Get the corresponding destination node IDs from the match
        const destStartId = match.get(srcStartId);
        const destEndId = match.get(srcEndId);
        
        // If either end of the branch is not matched, the algorithm fails
        if (destStartId === undefined || destEndId === undefined) {
            console.error(`Failed to find match for branch ${srcStartId}->${srcEndId}`);
            throw new Error(`Cannot map branch: start ${srcStartId} or end ${srcEndId} not matched`);
        }
        
        // Find the topological branch in the destination skeleton that connects these two nodes
        let matchingDestBranch: TopologicalBranch | null = null;
        for (const destBranch of destSkeleton.topologicalBranches) {
            if ((destBranch.start.id === destStartId && destBranch.end.id === destEndId) ||
                (destBranch.start.id === destEndId && destBranch.end.id === destStartId)) {
                matchingDestBranch = destBranch;
                break;
            }
        }
        
        // If no matching branch found in the destination skeleton, the algorithm fails
        if (!matchingDestBranch) {
            console.error(`No matching branch found in destination for ${srcStartId}->${srcEndId}`);
            throw new Error(`Cannot find corresponding branch in destination skeleton`);
        }
        
        // Store the mapping from source branch to destination branch
        // We'll store these for later steps
        (srcBranch as any).destBranch = matchingDestBranch;
        
        console.log(`Mapped source branch ${srcStartId}->${srcEndId} to destination branch ${destStartId}->${destEndId}`);
    }
    console.log("UNION SKELETON: Found suitable branch for every branch in src skeleton!")

    //Step 2
    //For each collapsed node on the skeleton path from startNode and endNode, find its distance to the startNode, in percent

    //Step 3
    //For each of the nodes computed in step 2, find nodes on the topological branch from destination skeleton, that fall into the segment covered by this node
    //If there is no node in this segment in the destination branch, we can ignore this node (it does not need to be recorded, because there is no node in the destination skeleton corresponding to it)
    //If there is more than one node in this segment in the destination branch, we take the closest as a direct mapping and the other as virtualNodes

    //Step 4
    //Now, with the virtual nodes and the nodes that have a mapping combined, each node from the destination skeleton should be covered. 
    //If that is not the case, the algorithm fails

    const unionSkeleton = new Skeleton({ "joint-graph": [] });
    
    return unionSkeleton;
}

    // HEURISTICS - these are the only methods that don't fit neatly into Skeleton or Graph
    // since they use rest pose data which is external to the skeleton structure
    //************************************************************************************************************** */

    private getHeightHeuristic(branches: TopologicalBranch[], restpose: number[][]): void {
        if (!restpose || restpose.length === 0) {
            console.warn("Rest pose data is empty or undefined. Cannot compute height heuristic.");
            return;
        }

        type HeightInfo = {
            branch: TopologicalBranch,
            avgHeight: number
        };

        let heightsList: HeightInfo[] = [];
        for (const branch of branches) {
            const avgHeight = this.getAvgPathHeight(branch.path, restpose);
            heightsList.push({ branch, avgHeight });
        }
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
        if (numNodes === 0) return 0;
        return totalHeight / numNodes;
    }
}