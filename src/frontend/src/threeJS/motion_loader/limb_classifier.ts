export enum BodyPart {
    HEAD = "head",
    TORSO = "torso",
    ARM_LEFT = "arm_l",
    ARM_RIGHT = "arm_r",
    LEG_LEFT = "leg_l",
    LEG_RIGHT = "leg_r",
    NONE = "none"
}

// Record of possible name values mapped to limbs
const nameToLimbMap: Record<string, BodyPart> = {
    // Head
    "head": BodyPart.HEAD,
    "skull": BodyPart.HEAD,
    "face": BodyPart.HEAD,
    "jaw": BodyPart.HEAD,
    "neck": BodyPart.HEAD,
    
    // Torso
    "hips": BodyPart.TORSO,
    "hip": BodyPart.TORSO,
    "chest": BodyPart.TORSO,
    "spine": BodyPart.TORSO,
    "pelvis": BodyPart.TORSO,
    "torso": BodyPart.TORSO,
    "waist": BodyPart.TORSO,
    "belly": BodyPart.TORSO,
    
    // Left arm
    "leftarm": BodyPart.ARM_LEFT,
    "leftupperarm": BodyPart.ARM_LEFT,
    "leftlowerarm": BodyPart.ARM_LEFT,
    "lefthand": BodyPart.ARM_LEFT,
    "leftshoulder": BodyPart.ARM_LEFT,
    "leftcollar": BodyPart.ARM_LEFT,
    "leftelbow": BodyPart.ARM_LEFT,
    "leftwrist": BodyPart.ARM_LEFT,
    "left_arm": BodyPart.ARM_LEFT,
    "left_upper_arm": BodyPart.ARM_LEFT,
    "left_lower_arm": BodyPart.ARM_LEFT,
    "left_hand": BodyPart.ARM_LEFT,
    "left_shoulder": BodyPart.ARM_LEFT,
    
    // Right arm
    "rightarm": BodyPart.ARM_RIGHT,
    "rightupperarm": BodyPart.ARM_RIGHT,
    "rightlowerarm": BodyPart.ARM_RIGHT,
    "righthand": BodyPart.ARM_RIGHT,
    "rightshoulder": BodyPart.ARM_RIGHT,
    "rightcollar": BodyPart.ARM_RIGHT,
    "rightelbow": BodyPart.ARM_RIGHT,
    "rightwrist": BodyPart.ARM_RIGHT,
    "right_arm": BodyPart.ARM_RIGHT,
    "right_upper_arm": BodyPart.ARM_RIGHT,
    "right_lower_arm": BodyPart.ARM_RIGHT,
    "right_hand": BodyPart.ARM_RIGHT,
    "right_shoulder": BodyPart.ARM_RIGHT,
    
    // Left leg
    "leftupleg": BodyPart.LEG_LEFT,
    "leftlowleg": BodyPart.LEG_LEFT,
    "leftfoot": BodyPart.LEG_LEFT,
    "leftthigh": BodyPart.LEG_LEFT,
    "leftcalf": BodyPart.LEG_LEFT,
    "lefttoe": BodyPart.LEG_LEFT,
    "leftankle": BodyPart.LEG_LEFT,
    "lefthip": BodyPart.LEG_LEFT,
    "left_up_leg": BodyPart.LEG_LEFT,
    "left_low_leg": BodyPart.LEG_LEFT,
    "left_foot": BodyPart.LEG_LEFT,
    "left_thigh": BodyPart.LEG_LEFT,
    
    // Right leg
    "rightupleg": BodyPart.LEG_RIGHT,
    "rightlowleg": BodyPart.LEG_RIGHT,
    "rightfoot": BodyPart.LEG_RIGHT,
    "rightthigh": BodyPart.LEG_RIGHT,
    "rightcalf": BodyPart.LEG_RIGHT,
    "righttoe": BodyPart.LEG_RIGHT,
    "rightankle": BodyPart.LEG_RIGHT,
    "righthip": BodyPart.LEG_RIGHT,
    "right_up_leg": BodyPart.LEG_RIGHT,
    "right_low_leg": BodyPart.LEG_RIGHT,
    "right_foot": BodyPart.LEG_RIGHT,
    "right_thigh": BodyPart.LEG_RIGHT,
};

/**
 * Map a joint name to its corresponding limb
 */
export function mapNameToLimb(name: string): BodyPart {
    if(!name) return BodyPart.NONE;
    const lowerName = name.toLowerCase().replace(/\s/g, '');

    // Check exact match first
    if (nameToLimbMap[lowerName]) {
        return nameToLimbMap[lowerName];
    }
    
    // Check partial matches
    for (const [key, limb] of Object.entries(nameToLimbMap)) {
        if (lowerName.includes(key)) {
            return limb;
        }
    }
    
    return BodyPart.NONE;
}