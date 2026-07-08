import { BodyPart, mapNameToLimb } from "./limb_classifier"
import { getRestPose } from "@/hooks/hook_generate_animation_clip"

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

type BranchHeuristics = {
    leg_l_weight: number,
    leg_r_weight: number,
    arm_l_weight: number,
    arm_r_weight: number,
    torso_weight: number,
    head_weight: number
}

export class SkeletonMapper {
    skeleton1: Skeleton | null = null;
    skeleton2: Skeleton | null = null;
    restpose1: number[][] = [];
    restpose2: number[][] = [];

    async mapSkeletons(skeleton1_json_url: string, skeleton2_json_url: string) {
        let response = await fetch(skeleton1_json_url);
        let json1 = await response.json();
        
        response = await fetch(skeleton2_json_url);
        let json2 = await response.json();
        
        this.skeleton1 = this.buildSkeleton(json1);
        this.skeleton2 = this.buildSkeleton(json2);

        let skeleton1_npy_url = skeleton1_json_url.replace('.json', '.npy').replace('/json/', '/npy/');

        // console.log(skeleton1_npy_url);
        let restPoseResponse = await getRestPose("data/npy/example.npy");
        this.restpose1 = restPoseResponse.restPose;
        console.log("Rest pose:", this.restpose1);

        restPoseResponse = await getRestPose("data/npy/A_test.npy");
        this.restpose2 = restPoseResponse.restPose;
        // console.log("Rest pose 2:", this.restpose2);
        
        // Collapse both skeletons
        this.collapseSkeleton(this.skeleton1);
        this.collapseSkeleton(this.skeleton2);
        
        
        this.getHeightHeuristic(this.skeleton2.topologicalBranches, this.restpose2);
        // this.getNamingHeuristic(this.skeleton1.topologicalBranches);
        console.log("Skeleton 1:", this.skeleton1);
        console.log("Skeleton 2:", this.skeleton2);
        
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