export enum BodyArea {
    HEAD = "head",
    TORSO = "torso",
    ARM = "arm",
    LEG = "leg",
    HAND = "hand",
    NONE = "none"
}

export enum BodyPart {
    HEAD = "head",
    TORSO = "torso",
    ARM_L = "arm_left",
    ARM_R = "arm_right",
    LEG_L = "leg_left",
    LEG_R = "leg_right",
    HAND_L = "hand_left",
    HAND_R = "hand_right",
    NONE = "none"
}

// Record of possible name values mapped to body parts (no left/right)
const nameToBodyAreaMap: Record<string, BodyArea> = {
    // Head
    "head": BodyArea.HEAD,
    "skull": BodyArea.HEAD,
    "face": BodyArea.HEAD,
    "jaw": BodyArea.HEAD,
    "neck": BodyArea.HEAD,
    "cranium": BodyArea.HEAD,
    "forehead": BodyArea.HEAD,
    "chin": BodyArea.HEAD,
    "ear": BodyArea.HEAD,
    "eye": BodyArea.HEAD,
    "nose": BodyArea.HEAD,
    "mouth": BodyArea.HEAD,
    "cheek": BodyArea.HEAD,
    "temple": BodyArea.HEAD,
    "occipital": BodyArea.HEAD,
    "parietal": BodyArea.HEAD,
    "frontal": BodyArea.HEAD,
    "temporal": BodyArea.HEAD,
    "mandible": BodyArea.HEAD,
    "maxilla": BodyArea.HEAD,
    "zygomatic": BodyArea.HEAD,
    "hyoid": BodyArea.HEAD,
    
    // Torso
    "hip": BodyArea.TORSO,
    "chest": BodyArea.TORSO,
    "spine": BodyArea.TORSO,
    "pelvis": BodyArea.TORSO,
    "torso": BodyArea.TORSO,
    "waist": BodyArea.TORSO,
    "belly": BodyArea.TORSO,
    "abdomen": BodyArea.TORSO,
    "back": BodyArea.TORSO,
    "collar": BodyArea.TORSO,    // Base collar
    "clavicle": BodyArea.TORSO,  // Base clavicle
    "sternum": BodyArea.TORSO,
    "rib": BodyArea.TORSO,
    "thorax": BodyArea.TORSO,
    "lumbar": BodyArea.TORSO,
    "sacrum": BodyArea.TORSO,
    "coccyx": BodyArea.TORSO,
    "scapula": BodyArea.TORSO,
    "shoulderblade": BodyArea.TORSO,
    "breast": BodyArea.TORSO,
    "pectoral": BodyArea.TORSO,
    
    // Arm (base, no side)
    "arm": BodyArea.ARM,
    "upperarm": BodyArea.ARM,
    "lowerarm": BodyArea.ARM,
    "shoulder": BodyArea.ARM, 
    "elbow": BodyArea.ARM,
    "humerus": BodyArea.ARM,
    "radius": BodyArea.ARM,
    "ulna": BodyArea.ARM,
    "forearm": BodyArea.ARM,
    "bicep": BodyArea.ARM,
    "tricep": BodyArea.ARM,
    "brachium": BodyArea.ARM,
    "antebrachium": BodyArea.ARM,
    "cubital": BodyArea.ARM,
    "carpal": BodyArea.ARM,
    
    // Hand (specifically hands)
    "hand": BodyArea.HAND,
    "palm": BodyArea.HAND,
    "finger": BodyArea.HAND,
    "thumb": BodyArea.HAND,
    "index": BodyArea.HAND,
    "middle": BodyArea.HAND,
    "ring": BodyArea.HAND,
    "pinky": BodyArea.HAND,
    "knuckle": BodyArea.HAND,
    "metacarpal": BodyArea.HAND,
    "phalanx": BodyArea.HAND,
    "phalange": BodyArea.HAND,
    "carpus": BodyArea.HAND,
    "wrist": BodyArea.HAND,      // Override: wrist can be arm or hand
    "fingertip": BodyArea.HAND,
    "nail": BodyArea.HAND,
    "digit": BodyArea.HAND,
    
    // Leg (base, no side)
    "leg": BodyArea.LEG,
    "thigh": BodyArea.LEG,
    "calf": BodyArea.LEG,
    "knee": BodyArea.LEG,
    "femur": BodyArea.LEG,
    "tibia": BodyArea.LEG,
    "fibula": BodyArea.LEG,
    "patella": BodyArea.LEG,
    "quadriceps": BodyArea.LEG,
    "hamstring": BodyArea.LEG,
    "glute": BodyArea.LEG,
    "buttock": BodyArea.LEG,
    "popliteal": BodyArea.LEG,
    
    // Feet
    "foot": BodyArea.LEG,
    "toe": BodyArea.LEG,
    "ankle": BodyArea.LEG,
    "heel": BodyArea.LEG,
    "arch": BodyArea.LEG,
    "sole": BodyArea.LEG,
    "instep": BodyArea.LEG,
    "ball": BodyArea.LEG,
    "metatarsal": BodyArea.LEG,
    "tarsal": BodyArea.LEG,
    "calcaneus": BodyArea.LEG,
    "talus": BodyArea.LEG,
    "navicular": BodyArea.LEG,
    "cuboid": BodyArea.LEG,
    "cuneiform": BodyArea.LEG,
};

const leftRightMap: Record<string, string> = {
    "left": "left",
    "l": "left",
    "right": "right",
    "r": "right",
    "_r": "right",
    "_l": "left",
    "l_": "left",
    "r_": "right"
};

//identified name is the part of the string that was identified as a body area, while fullName is the original string.
//e.g. if the input string is "lefthand", the identified name would be "hand" and the full name would be "left hand".
type identifiedPart = {
    fullName: string;
    identifiedName?: string;
    area: BodyArea;
};

//This method returns an identified part object, because the mapNameToLimb function needs to know what part of 
//the string is the body area and what part is the side (left/right).
function classifyBodyPart(name: string): identifiedPart {
    if(!name) return { fullName: '', area: BodyArea.NONE };
    const lowerName = name.toLowerCase().replace(/\s/g, '');

    // Check exact match first
    if (nameToBodyAreaMap[lowerName]) {
        return { fullName: lowerName, area: nameToBodyAreaMap[lowerName] };
    }
    
    // Check partial matches
    for (const [key, value] of Object.entries(nameToBodyAreaMap)) {
        if (lowerName.includes(key)) {
            return { fullName: lowerName, identifiedName: key, area: value };
        }
    }
    
    return { fullName: '', area: BodyArea.NONE };
}

export function mapNameToLimb(name: string): BodyPart {
    const identifiedPart = classifyBodyPart(name);
    // console.log("fullName:", identifiedPart.fullName, "identifiedName:", identifiedPart.identifiedName, "area:", identifiedPart.area);
    const remainingName = removeIdentifiedName(identifiedPart);
    // console.log("remainingName after removing identifiedName:", remainingName);

    switch (identifiedPart.area) {
        case BodyArea.HEAD:
            return BodyPart.HEAD;
        case BodyArea.TORSO:
            return BodyPart.TORSO;
        case BodyArea.ARM:
            for(const [key, value] of Object.entries(leftRightMap)) {
                if (remainingName.includes(key)) {
                    // console.log("remainingName:", remainingName, "fullName:", identifiedPart.fullName);
                    return value === "left" ? BodyPart.ARM_L : BodyPart.ARM_R;
                }
            }
            break;
        case BodyArea.LEG:
            for(const [key, value] of Object.entries(leftRightMap)) {
                if (remainingName.includes(key)) {
                    // console.log("remainingName:", remainingName, "fullName:", identifiedPart.fullName);
                    return value === "left" ? BodyPart.LEG_L : BodyPart.LEG_R;
                }
            }
            break;
        //TODO: Change this to actually treat hands differently, for now there are only arms
        case BodyArea.HAND:
            for(const [key, value] of Object.entries(leftRightMap)) {
                if (remainingName.includes(key)) {
                    return value === "left" ? BodyPart.ARM_L : BodyPart.ARM_R;
                }
            }
            break;
        default:    
            return BodyPart.NONE;
    }

    return BodyPart.NONE;
}

function removeIdentifiedName(part: identifiedPart): string {
    if (!part.identifiedName) return part.fullName;
    
    // Remove the identifiedName from fullName (case insensitive)
    const remaining = part.fullName.replace(
        new RegExp(part.identifiedName, 'i'), 
        ''
    );
    
    return remaining;
}