import { getRestPose } from "@/hooks/hook_generate_animation_clip"
import * as THREE from 'three';
import { GraphVisualizer } from "./GraphVisualizer";
import { Skeleton, TopologicalBranch, SkeletonNode } from "./skeleton";
import { Graph, GraphNode } from "./graph";

export class SkeletonMapper {
    skeletonA: Skeleton | null = null;
    skeletonB: Skeleton | null = null;
    skeletonANodeIDs: Set<number> = new Set<number>();
    skeletonBNodeIDs: Set<number> = new Set<number>();
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

        for (const joint of json1["joint-graph"]) {
            this.skeletonANodeIDs.add(joint.id);
        }

        for (const joint of json2["joint-graph"]) {
            this.skeletonBNodeIDs.add(joint.id);
        }
        
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
    match: Map<number, number> // Maps node IDs from srcSkeleton to destSkeleton
): Skeleton {
    //The goal of this algorithm is to have a skeleton with the topology of destSkeleton, but some of the nodes are purely virtual, meaning computed via Inverse Kinematics
    //For each other node in this unionSkeleton, we should know exactly what node of srcSkeleton maps to it, so we can then record that motion

    //Step 1
    //For each topological branch in the source skeleton, get the graphNode that corresponds to the startNode and the one that corresponds to the endNode
    //We are then looking for the corresponding topological branch from the destination skeleton. If that path does not exist, the algorithm fails
    
    // Store the mapping from source node ID to destination node ID
    const srcToDestMap = new Map<number, number>();
    for (const [srcId, destId] of match) {
        srcToDestMap.set(srcId, destId);
    }
    let virtualNodes: number[] = []; //IDs of the destination skeleton that have no direct match from the source skeleton
    
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
        // (srcBranch as any).destBranch = matchingDestBranch;
        
        console.log(`Mapped source branch ${srcStartId}->${srcEndId} to destination branch ${destStartId}->${destEndId}`);

        //Step 2
        //For each collapsed node on the skeleton path from startNode and endNode, find its distance to the startNode, in percent
        
        // Get the path of the source branch (includes start, intermediate, and end nodes)
        const srcPath = srcBranch.path;
        const srcNodesInBetween: number = srcPath.length - 2; // Number of segments between nodes (-2 because we substract startnode and endnode)

        const destNodesInBetween: number = matchingDestBranch.path.length - 2;
        //If the destination branch has no nodes, there is nothing to map to, so we can skip this branch
        if(destNodesInBetween === 0) {
            continue;
        }
        if(srcNodesInBetween === 0) {
            for (let i = 0; i < matchingDestBranch.path.length - 1; i++) {
                virtualNodes.push(matchingDestBranch.path[i].id);
            }
        } 
        else {
        // Calculate the percentage distance for each node in the source path
        const srcNodeDistances: Map<number, number> = this.calculateNodeDistances(srcBranch, this.restposeA);
        // console.log(`Path from ${srcStartId} to ${srcEndId} has the following distances: `, srcNodeDistances);

        const destNodeDistances: Map<number, number> = this.calculateNodeDistances(matchingDestBranch, this.restposeB);
        // console.log(`Path from ${matchingDestBranch.start.id} to ${matchingDestBranch.end.id} has the following distances: `, destNodeDistances);
        const srcNodeArray = Array.from(srcNodeDistances.entries());
        const destNodeArray = Array.from(destNodeDistances.entries());

        //Step 3
        //For each of the nodes computed in step 2, find nodes on the topological branch from destination skeleton, that fall into the segment covered by this node
        //If there is no node in this segment in the destination branch, we can ignore this node (it does not need to be recorded, because there is no node in the destination skeleton corresponding to it)
        //If there is more than one node in this segment in the destination branch, we take the closest as a direct mapping and the other as virtualNodes

        // For each source node (excluding start and end, which are already matched)
        for (let i = 1; i < srcNodeArray.length - 1; i++) {
            const [srcNodeId, srcPercentage] = srcNodeArray[i];
            
            // Find the segment boundaries: previous source node percentage and current source node percentage
            const prevSrcPercentage = srcNodeArray[i - 1][1];
            const currSrcPercentage = srcPercentage;
            
            // The segment is from prevSrcPercentage to currSrcPercentage
            // Add a margin of 0.1 on both sides
            const segmentEnd = currSrcPercentage + 0.1;
            
            // Find all destination nodes that fall within this segment
            const matchingDestNodes: { id: number, percentage: number, distance: number }[] = [];
            
            for (const [destNodeId, destPercentage] of destNodeArray) {
                // Skip start and end nodes (they're already matched)
                if (destNodeId === matchingDestBranch.start.id || destNodeId === matchingDestBranch.end.id) {
                    continue;
                }
                
                // Check if this destination node falls within the segment (with margin)
                if (destPercentage >= prevSrcPercentage && destPercentage <= segmentEnd) {
                    // Calculate distance from the source node percentage
                    const distance = Math.abs(destPercentage - srcPercentage);
                    matchingDestNodes.push({
                        id: destNodeId,
                        percentage: destPercentage,
                        distance: distance
                    });
                }
            }
            
            // Sort matching destination nodes by distance to the source node
            matchingDestNodes.sort((a, b) => a.distance - b.distance);
            
            if (matchingDestNodes.length === 0) {
                // No destination node in this segment, this source node has no direct mapping
                // It will be handled as a virtual node later
                console.log(`Source node ${srcNodeId} has no direct mapping in destination segment`);
                continue;
            }
            
            // Take the closest node as a direct mapping
            const closestDest = matchingDestNodes[0];
            srcToDestMap.set(srcNodeId, closestDest.id);
            console.log(`Mapped source node ${srcNodeId} (${(srcPercentage * 100).toFixed(1)}%) -> destination node ${closestDest.id} (${(closestDest.percentage * 100).toFixed(1)}%), distance: ${closestDest.distance.toFixed(3)}`);
            
            // Any remaining nodes in this segment are virtual nodes
            // They will be handled in Step 4
            if (matchingDestNodes.length > 1) {
                const newVirtualNodes = matchingDestNodes.slice(1);
                console.log(`  ${newVirtualNodes.length} virtual nodes in this segment:`, newVirtualNodes.map(n => n.id));
                newVirtualNodes.forEach((node: any) => {
                    virtualNodes.push(node.id);
                })
            }
        }
        
        }
        
    }
    

    //Step 4
    //Now, with the virtual nodes and the nodes that have a mapping combined, each node from the destination skeleton should be covered. 
    //If that is not the case, the algorithm fails
    const coveredDestNodeIds = new Set<number>();

    // Add all destination node IDs that are in the srcToDestMap (direct mappings)
    for (const [srcId, destId] of srcToDestMap) {
        coveredDestNodeIds.add(destId);
    }
    for(const virtualID of virtualNodes) {
        coveredDestNodeIds.add(virtualID);
    }

    // Find any uncovered nodes
    const uncoveredNodeIds: number[] = [];
    for (const nodeId of this.skeletonBNodeIDs) {
        if (!coveredDestNodeIds.has(nodeId)) {
            uncoveredNodeIds.push(nodeId);
        }
    }

    if (uncoveredNodeIds.length > 0) {
        console.error(`Algorithm failed: ${uncoveredNodeIds.length} nodes in destination skeleton are not covered`);
        console.error(`Uncovered node IDs:`, uncoveredNodeIds);
        console.error(`Total destination nodes: ${this.skeletonBNodeIDs.size}`);
        console.error(`Covered nodes: ${coveredDestNodeIds.size}`);
        throw new Error(`Cannot map all destination nodes. Uncovered: ${uncoveredNodeIds.join(', ')}`);
    }

    console.log(`All ${this.skeletonBNodeIDs.size} destination nodes are covered successfully!`);
    console.log(`  - Direct matches: ${srcToDestMap.size}`);
    console.log(`  - Virtual nodes: ${coveredDestNodeIds.size - srcToDestMap.size}`);

    const unionSkeleton = new Skeleton({ "joint-graph": [] });
    
    return unionSkeleton;
}

//TODO: The node distance calculation is something that can be done in the skeleton class and we can add it as an attribute to the Node type
private calculateNodeDistances(
        branch: TopologicalBranch, 
        restpose: number[][]
    ): Map<number, number> {
        const nodeDistances = new Map<number, number>();
        const path = branch.path;
        
        if (path.length < 2) {
            // Single node branch, just return 0
            nodeDistances.set(path[0].id, 0);
            return nodeDistances;
        }
        
        // Calculate total path length using actual bone lengths from rest pose
        let totalPathLength = 0;
        const segmentLengths: number[] = [];
        
        // First, calculate the length of each segment between consecutive nodes
        for (let i = 0; i < path.length - 1; i++) {
            const nodeA = path[i];
            const nodeB = path[i + 1];
            
            // Get positions from rest pose
            const posA = restpose[nodeA.id];
            const posB = restpose[nodeB.id];
            
            if (!posA || !posB) {
                console.warn(`Missing rest pose data for nodes ${nodeA.id} or ${nodeB.id}`);
                // Fallback to using index-based distance
                segmentLengths.push(1);
                totalPathLength += 1;
                continue;
            }
            
            // Calculate Euclidean distance between the two nodes
            const dx = posB[0] - posA[0];
            const dy = posB[1] - posA[1];
            const dz = posB[2] - posA[2];
            const length = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            segmentLengths.push(length);
            totalPathLength += length;
        }
        
        // Now calculate the cumulative distance percentage for each node
        let cumulativeDistance = 0;
        
        // Start node is at 0%
        nodeDistances.set(path[0].id, 0);
        
        // Calculate for intermediate nodes and end node
        for (let i = 0; i < segmentLengths.length; i++) {
            const node = path[i + 1]; // The node at the end of this segment
            cumulativeDistance += segmentLengths[i];
            
            // Distance as a percentage of total path length
            const percentage = totalPathLength > 0 ? cumulativeDistance / totalPathLength : 0;
            nodeDistances.set(node.id, percentage);
        }
        
        return nodeDistances;
    }

    // HEURISTICS
    //************************************************************************************************************** */

    // private getHeightHeuristic(branches: TopologicalBranch[], restpose: number[][]): void {
    //     if (!restpose || restpose.length === 0) {
    //         console.warn("Rest pose data is empty or undefined. Cannot compute height heuristic.");
    //         return;
    //     }

    //     type HeightInfo = {
    //         branch: TopologicalBranch,
    //         avgHeight: number
    //     };

    //     let heightsList: HeightInfo[] = [];
    //     for (const branch of branches) {
    //         const avgHeight = this.getAvgPathHeight(branch.path, restpose);
    //         heightsList.push({ branch, avgHeight });
    //     }
    // }

    // private getAvgPathHeight(path: SkeletonNode[], restpose: number[][]): number {
    //     if (path.length === 0) return 0;
    //     let numNodes = 0;
    //     let totalHeight = 0;
    //     for (const node of path) {
    //         if (restpose[node.id]) {
    //             totalHeight += restpose[node.id][1]; // Assuming Y-axis is height
    //             numNodes++;
    //         }
    //     }
    //     if (numNodes === 0) return 0;
    //     return totalHeight / numNodes;
    // }
}