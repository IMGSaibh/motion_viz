import { BodyArea, mapNameToLimb, BodyPart } from "./limb_classifier"

type BranchHeuristics = Map<BodyPart, number>; // Map of body part to heuristic score

export type TopologicalBranch = {
    start: SkeletonNode,
    end: SkeletonNode,
    path: SkeletonNode[],
    nodeCount: number,
    bodyPart: BodyArea //defined in LimbClassifier
    branchHeuristics: BranchHeuristics
}

export type SkeletonNode = {
    id: number,
    pid: number,
    name: string,
    children: SkeletonNode[],
    parent: SkeletonNode | null
}

export class Skeleton {
    nodes: SkeletonNode[] = []
    topologicalBranches: TopologicalBranch[] = []
    root: SkeletonNode | null = null
    virtualNodes: SkeletonNode[] = []     
    
    constructor(skeleton_json: any) {
        this.buildSkeleton(skeleton_json);
    }

    /**
     * Build skeleton from JSON joint-graph
     */
    private buildSkeleton(jsonData: any): void {
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
            // In some .json files, the root node has the same pid as id
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
        
        this.nodes = Array.from(nodeMap.values());
        this.root = root;
        this.topologicalBranches = [];
        
        // Collapse the skeleton after building
        this.collapseSkeleton();
    }

    /**
     * Collapse the skeleton into topological branches
     */
    private collapseSkeleton(): void {
        if (!this.root) return;
        
        // Compute valence for each node
        for (const node of this.nodes) {
            const valence = node.children.length + (node.parent ? 1 : 0);
            (node as any).valence = valence;
        }
        
        // Find special nodes: root, leaves (valence 1), branches (valence > 2)
        const leafNodes = this.nodes.filter(node => (node as any).valence === 1);
        const branchNodes = this.nodes.filter(node => (node as any).valence > 2 || node === this.root);
        const specialNodes = [...leafNodes, ...branchNodes];
        
        const collapsedEdges: TopologicalBranch[] = [];
        
        // For each branch node, explore outwards to the next special node
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
                    
                    const isDuplicate = collapsedEdges.some(b =>
                        (b.start === startNode && b.end === current) ||
                        (b.start === current && b.end === startNode)
                    );
                    
                    if (!isDuplicate) {
                        const heuristics = new Map<BodyPart, number>();
                        this.getNamingHeuristic(path, heuristics);
                        
                        let collapsedEdge: TopologicalBranch = {
                            start: startNode,
                            end: current,
                            path: path,
                            nodeCount: path.length,
                            bodyPart: BodyArea.NONE,
                            branchHeuristics: heuristics
                        };
                        collapsedEdges.push(collapsedEdge);
                    }
                }
            }
        }
        
        this.topologicalBranches = collapsedEdges;
    }

    /**
     * Get naming heuristic for a path
     */
    private getNamingHeuristic(path: SkeletonNode[], heuristics: BranchHeuristics): void {
        for (const node of path) {
            const bodyPart = mapNameToLimb(node.name);
            if (bodyPart !== BodyPart.NONE) {
                const currentValue = heuristics.get(bodyPart) || 0;
                heuristics.set(bodyPart, currentValue + 1);
            }
        }
    }

    /**
     * Get graph representation of the collapsed skeleton
     */
    public getGraphRepresentation(): GraphNode[] {
        const graph: GraphNode[] = [];
        const coveredIDs = new Set<number>();
        
        for (const branch of this.topologicalBranches) {
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
        
        return graph;
    }

    public getNodeById(id: number): SkeletonNode | undefined {
        return this.nodes.find(node => node.id === id);
    }

    public getNodeCount(): number {
        return this.nodes.length;
    }

    public getLeafNodes(): SkeletonNode[] {
        return this.nodes.filter(node => (node as any).valence === 1);
    }

    public getBranchNodes(): SkeletonNode[] {
        return this.nodes.filter(node => (node as any).valence > 2 || node === this.root);
    }
}

// Export GraphNode type for use in other files
export type GraphNode = {
    id: number,
    neighbours: number[],
    bodyPart: BodyPart
}