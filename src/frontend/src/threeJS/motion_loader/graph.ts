import { Skeleton, TopologicalBranch } from "./skeleton";
import { BodyPart } from "./limb_classifier";

export type GraphNode = {
    id: number,
    neighbours: number[],
    bodyPart: BodyPart
}

export class Graph {
    nodes: GraphNode[] = [];
    skeleton: Skeleton;

    constructor(skeleton: Skeleton) {
        this.skeleton = skeleton;
        this.buildGraph();
    }

    /**
     * Build graph representation from the skeleton's topological branches
     */
    private buildGraph(): void {
        const graph: GraphNode[] = [];
        const coveredIDs = new Set<number>();
        
        for (const branch of this.skeleton.topologicalBranches) {
            const startId = branch.start.id;
            const endId = branch.end.id;
            
            // Add start node
            if (!coveredIDs.has(startId)) {
                graph.push({ id: startId, neighbours: [endId], bodyPart: BodyPart.NONE });
                coveredIDs.add(startId);
            } else {
                const existingNode = graph.find(node => node.id === startId);
                if (existingNode && !existingNode.neighbours.includes(endId)) {
                    existingNode.neighbours.push(endId);
                }
            }
            
            // Add end node
            if (!coveredIDs.has(endId)) {
                graph.push({ id: endId, neighbours: [startId], bodyPart: BodyPart.NONE });
                coveredIDs.add(endId);
            } else {
                const existingNode = graph.find(node => node.id === endId);
                if (existingNode && !existingNode.neighbours.includes(startId)) {
                    existingNode.neighbours.push(startId);
                }
            }
        }
        
        this.nodes = graph;
        this.evaluateGraph();
    }

    /**
     * Assign body parts to each graph node based on topological branch heuristics
     */
    public evaluateGraph(): void {
        for (const node of this.nodes) {
            // Get branches that include this node (as start or end)
            const branches = this.skeleton.topologicalBranches.filter(
                branch => branch.start.id === node.id || branch.end.id === node.id
            );
            
            // Aggregate heuristics from all branches
            const heuristics = new Map<BodyPart, number>();
            for (const branch of branches) {
                for (const [key, value] of branch.branchHeuristics.entries()) {
                    const currentValue = heuristics.get(key) || 0;
                    heuristics.set(key, currentValue + value);
                }
            }
            
            // Leaf nodes cannot be torso
            if (node.neighbours.length === 1) {
                heuristics.delete(BodyPart.TORSO);
            }
            
            // Find the body part with the highest score
            let maxValue = 0;
            let estimatedBodyPart = BodyPart.NONE;
            for (const [key, value] of heuristics.entries()) {
                if (value > maxValue) {
                    maxValue = value;
                    estimatedBodyPart = key;
                }
            }
            
            node.bodyPart = estimatedBodyPart;
            console.log("Node ", node.id, " has estimated body part ", node.bodyPart)
        }
    }

    public getNodeById(id: number): GraphNode | undefined {
        return this.nodes.find(node => node.id === id);
    }

    public getNodeCount(): number {
        return this.nodes.length;
    }

    public getNodes(): GraphNode[] {
        return this.nodes;
    }

    public getNeighbours(id: number): number[] | undefined {
        const node = this.getNodeById(id);
        return node?.neighbours;
    }

    public hasNode(id: number): boolean {
        return this.nodes.some(node => node.id === id);
    }
}