// Define the joint categories that all bones are seperated into
const JOINT_CATEGORIES = {
  HIP: 'hip',
  SPINE: 'spine',
  HEAD: 'head',
  ARM_L: 'armL',
  ARM_R: 'armR',
  HAND_L: 'handL',
  HAND_R: 'handR',
  LEG_L: 'legL',
  LEG_R: 'legR',
  FOOT_L: 'footL',
  FOOT_R: 'footR',
  UNIDENTIFIED: 'unidentified'
} as const;

export type JointCategory = typeof JOINT_CATEGORIES[keyof typeof JOINT_CATEGORIES];

export class Bone_grouping {
    joint_group_map: JointCategory[] = [];
    joint_groups: Map<JointCategory, number[]>;
    constructor() {
        this.joint_groups = new Map<JointCategory, number[]>();
    }

assign_categories(skeleton_json : any) {
    const jointGraph = skeleton_json["joint-graph"];
      if (!jointGraph || !Array.isArray(jointGraph)) {
    console.error('Invalid skeleton JSON: missing joint-graph');
    return [];
    }
  
    // const categories: JointCategory[] = [];

    let currentID = 0;

    for (const joint of jointGraph) {
        const name = joint.name;
        let category = JOINT_NAME_PATTERNS[name.toLowerCase()];
        
        if (category) {
        this.joint_group_map.push(category);
        } else {
        console.warn(`No category found for joint: ${name}, assigning to UNIDENTIFIED`);
        category = JOINT_CATEGORIES.UNIDENTIFIED;
        this.joint_group_map.push(category);
        }
 
        //Add the id to the corresponding group in the hashmap so we get information about what and how
        //many joints are in each group
        const arr = this.joint_groups.get(category);

        if (arr) {
          arr.push(currentID); // mutate existing array
        } else {
          this.joint_groups.set(category, [currentID]); // initialize
        }

        currentID++;
    }
  
  }

get_color_by_joint_id(jointId: number): number {
  // Check if jointId is valid
  if (jointId < 0 || jointId >= this.joint_group_map.length) {
    console.warn(`Invalid joint ID: ${jointId}. Available joints: 0-${this.joint_group_map.length - 1}`);
    return 0xCCCCCC; // Default gray
  }
  
  const category = this.joint_group_map[jointId];
  const color = CATEGORY_COLORS[category];
  
  if (!color) {
    console.warn(`No color defined for category: ${category} (joint ${jointId})`);
    return 0xCCCCCC; // Default gray
  }
  
  return color;
}

print_joints(): void {
  console.log('========== JOINT CATEGORIES ==========');
  console.log(`Total Joints: ${this.joint_group_map.length}`);
  console.log('');
  
  for (let i = 0; i < this.joint_group_map.length; i++) {
    const category = this.joint_group_map[i];
    const jointName = `Joint ${i}`;
    
    // Get color for this category to show in console (using ANSI colors for visual reference)
    const colorHex = CATEGORY_COLORS[category].toString(16).padStart(6, '0');
    
    console.log(`  ${i.toString().padStart(3)} | ${jointName.padEnd(20)} → ${category} (${colorHex})`);
  }
  
  console.log('=======================================');
  }

  print_joint_categories(): void {
    for (const category of Object.values(JOINT_CATEGORIES)) {
      const joints = this.joint_groups.get(category) ?? [];
      console.log(
        `${category}: ${joints.length} joint(s) -> [${joints.join(', ')}]`
      );
    }
  }
}


// Color mapping for each category (with same colors for left and rigth)
const CATEGORY_COLORS: Record<JointCategory, number> = {
  [JOINT_CATEGORIES.HIP]: 0xFF6B6B,      // Soft Red
  [JOINT_CATEGORIES.SPINE]: 0x4ECDC4,    // Turquoise
  [JOINT_CATEGORIES.HEAD]: 0xFFE66D,     // Warm Yellow
  [JOINT_CATEGORIES.ARM_L]: 0x95E77E,    // Light Green
  [JOINT_CATEGORIES.ARM_R]: 0x95E77E,    // Light Green (same for both arms)
  [JOINT_CATEGORIES.HAND_L]: 0x6C91B0,   // Steel Blue
  [JOINT_CATEGORIES.HAND_R]: 0x6C91B0,   // Steel Blue
  [JOINT_CATEGORIES.LEG_L]: 0xFF9F4A,    // Orange
  [JOINT_CATEGORIES.LEG_R]: 0xFF9F4A,    // Orange
  [JOINT_CATEGORIES.FOOT_L]: 0xE28F6E,   // Terracotta
  [JOINT_CATEGORIES.FOOT_R]: 0xE28F6E,   // Terracotta
  [JOINT_CATEGORIES.UNIDENTIFIED]: 0xFFFFFF //black
};

// Color mapping for each category (with slightly different colors for left and right)
const CATEGORY_COLORS_DISTINCT: Record<JointCategory, number> = {
  [JOINT_CATEGORIES.HIP]: 0xFF6B6B,
  [JOINT_CATEGORIES.SPINE]: 0x4ECDC4,
  [JOINT_CATEGORIES.HEAD]: 0xFFE66D,
  [JOINT_CATEGORIES.ARM_L]: 0x95E77E,    // Light Green
  [JOINT_CATEGORIES.ARM_R]: 0x6BCB77,    // Medium Green (different)
  [JOINT_CATEGORIES.HAND_L]: 0x6C91B0,   // Steel Blue
  [JOINT_CATEGORIES.HAND_R]: 0x4A7C9E,   // Darker Steel Blue
  [JOINT_CATEGORIES.LEG_L]: 0xFF9F4A,    // Orange
  [JOINT_CATEGORIES.LEG_R]: 0xFF8C42,    // Darker Orange
  [JOINT_CATEGORIES.FOOT_L]: 0xE28F6E,   // Terracotta
  [JOINT_CATEGORIES.FOOT_R]: 0xD47C58,   // Darker Terracotta
  [JOINT_CATEGORIES.UNIDENTIFIED]: 0xFFFFFF //black
};

const JOINT_NAME_PATTERNS: Record<string, JointCategory> = {
  // Hip/Pelvis
  hips: JOINT_CATEGORIES.HIP,
  pelvis: JOINT_CATEGORIES.HIP,
  root: JOINT_CATEGORIES.HIP,

  // Spine
  spine: JOINT_CATEGORIES.SPINE,
  spine1: JOINT_CATEGORIES.SPINE,
  spine2: JOINT_CATEGORIES.SPINE,
  chest: JOINT_CATEGORIES.SPINE,
  chest2: JOINT_CATEGORIES.SPINE,
  chest3: JOINT_CATEGORIES.SPINE,
  chest4: JOINT_CATEGORIES.SPINE,

  // Head
  neck: JOINT_CATEGORIES.HEAD,
  head: JOINT_CATEGORIES.HEAD,
  hairb: JOINT_CATEGORIES.HEAD,
  haira: JOINT_CATEGORIES.HEAD,
  hat: JOINT_CATEGORIES.HEAD,
  hood: JOINT_CATEGORIES.HEAD,
  hood1: JOINT_CATEGORIES.HEAD,
  lhoodiestring: JOINT_CATEGORIES.HEAD,
  lhoodiestring1: JOINT_CATEGORIES.HEAD,
  lhoodiestring2: JOINT_CATEGORIES.HEAD,
  rhoodiestring: JOINT_CATEGORIES.HEAD,
  rhoodiestring1: JOINT_CATEGORIES.HEAD,
  rhoodiestring2: JOINT_CATEGORIES.HEAD,

  // Left Arm
  leftcollar: JOINT_CATEGORIES.ARM_L,
  leftshoulder: JOINT_CATEGORIES.ARM_L,
  leftarm: JOINT_CATEGORIES.ARM_L,
  leftuparm: JOINT_CATEGORIES.ARM_L,
  leftelbow: JOINT_CATEGORIES.ARM_L,
  leftlowarm: JOINT_CATEGORIES.ARM_L,
  leftforearm: JOINT_CATEGORIES.ARM_L,
  lsleeve: JOINT_CATEGORIES.ARM_L,
  lbackpack_strap: JOINT_CATEGORIES.ARM_L,

  // Right Arm
  rightcollar: JOINT_CATEGORIES.ARM_R,
  rightshoulder: JOINT_CATEGORIES.ARM_R,
  rightarm: JOINT_CATEGORIES.ARM_R,
  rightuparm: JOINT_CATEGORIES.ARM_R,
  rightelbow: JOINT_CATEGORIES.ARM_R,
  rightlowarm: JOINT_CATEGORIES.ARM_R,
  rightforearm: JOINT_CATEGORIES.ARM_R,
  rsleeve: JOINT_CATEGORIES.ARM_R,
  rbackpack_strap: JOINT_CATEGORIES.ARM_R,

  // Left Hand
  lefthand: JOINT_CATEGORIES.HAND_L,
  leftwrist: JOINT_CATEGORIES.HAND_L,
  lefthandthumb1: JOINT_CATEGORIES.HAND_L,
  lefthandthumb2: JOINT_CATEGORIES.HAND_L,
  lefthandthumb3: JOINT_CATEGORIES.HAND_L,
  lefthandindex1: JOINT_CATEGORIES.HAND_L,
  lefthandindex2: JOINT_CATEGORIES.HAND_L,
  lefthandindex3: JOINT_CATEGORIES.HAND_L,
  lefthandmiddle1: JOINT_CATEGORIES.HAND_L,
  lefthandmiddle2: JOINT_CATEGORIES.HAND_L,
  lefthandmiddle3: JOINT_CATEGORIES.HAND_L,
  lefthandring1: JOINT_CATEGORIES.HAND_L,
  lefthandring2: JOINT_CATEGORIES.HAND_L,
  lefthandring3: JOINT_CATEGORIES.HAND_L,
  lefthandpinky1: JOINT_CATEGORIES.HAND_L,
  lefthandpinky2: JOINT_CATEGORIES.HAND_L,
  lefthandpinky3: JOINT_CATEGORIES.HAND_L,

  // Right Hand
  righthand: JOINT_CATEGORIES.HAND_R,
  rightwrist: JOINT_CATEGORIES.HAND_R,
  righthandthumb1: JOINT_CATEGORIES.HAND_R,
  righthandthumb2: JOINT_CATEGORIES.HAND_R,
  righthandthumb3: JOINT_CATEGORIES.HAND_R,
  righthandindex1: JOINT_CATEGORIES.HAND_R,
  righthandindex2: JOINT_CATEGORIES.HAND_R,
  righthandindex3: JOINT_CATEGORIES.HAND_R,
  righthandmiddle1: JOINT_CATEGORIES.HAND_R,
  righthandmiddle2: JOINT_CATEGORIES.HAND_R,
  righthandmiddle3: JOINT_CATEGORIES.HAND_R,
  righthandring1: JOINT_CATEGORIES.HAND_R,
  righthandring2: JOINT_CATEGORIES.HAND_R,
  righthandring3: JOINT_CATEGORIES.HAND_R,
  righthandpinky1: JOINT_CATEGORIES.HAND_R,
  righthandpinky2: JOINT_CATEGORIES.HAND_R,
  righthandpinky3: JOINT_CATEGORIES.HAND_R,

  // Left Leg
  leftupleg: JOINT_CATEGORIES.LEG_L,
  lefthip: JOINT_CATEGORIES.LEG_L,
  leftleg: JOINT_CATEGORIES.LEG_L,
  leftlowleg: JOINT_CATEGORIES.LEG_L,
  leftknee: JOINT_CATEGORIES.LEG_L,
  leftpantleg: JOINT_CATEGORIES.LEG_L,

  // Right Leg
  rightupleg: JOINT_CATEGORIES.LEG_R,
  righthip: JOINT_CATEGORIES.LEG_R,
  rightleg: JOINT_CATEGORIES.LEG_R,
  rightlowleg: JOINT_CATEGORIES.LEG_R,
  rightknee: JOINT_CATEGORIES.LEG_R,
  rightpantleg: JOINT_CATEGORIES.LEG_R,

  // Left Foot
  leftfoot: JOINT_CATEGORIES.FOOT_L,
  leftankle: JOINT_CATEGORIES.FOOT_L,
  lefttoebase: JOINT_CATEGORIES.FOOT_L,
  lefttoe: JOINT_CATEGORIES.FOOT_L,
  lfoottongue: JOINT_CATEGORIES.FOOT_L,

  // Right Foot
  rightfoot: JOINT_CATEGORIES.FOOT_R,
  rightankle: JOINT_CATEGORIES.FOOT_R,
  righttoebase: JOINT_CATEGORIES.FOOT_R,
  righttoe: JOINT_CATEGORIES.FOOT_R,
  rfoottongue: JOINT_CATEGORIES.FOOT_R,

  // Other
  backpack: JOINT_CATEGORIES.SPINE,
  boyfacialanim_joint: JOINT_CATEGORIES.HEAD,
};
