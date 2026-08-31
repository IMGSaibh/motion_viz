// reine Datentypen (KEIN React)

export type Range = [number, number];

export type RectangleLabelBar = {
  from: number;
  to: number;
  leftPct: number;
  scaleX: number;
};

export type ErgoLabel = {
  id: string | undefined;
  start_frame: number;
  end_frame: number;
  ergo_method?: string;
  categories: LabelCategory[];
};

export type LabelCategory = {
  id: number;
  name: string;
  features: LabelFeature[];
};

export type LabelFeature = {
  id: number;
  name: string;
  image: LabelImage;
};

export type LabelImage = {
  name: string;
  src: string;
  category: string;
};

export type RulaCategory = 'CAT_UPPERARM' | 'CAT_LOWERARM' | 'CAT_WRIST' | 'CAT_NECK' | 'CAT_TRUNK' | 'CAT_LEGS';
export type OwasCategory = 'CAT_BACK' | 'CAT_ARMS' | 'CAT_LEGS' | 'CAT_LOAD';

export type RulaFeatureSelection<TOptional extends string> = {
  feature: LabelImage | null;
  optionals: TOptional[];
};

export type RulaSelection = {
  CAT_UPPERARM: RulaFeatureSelection<RulaOptionalsUpperArm>;
  CAT_LOWERARM: LabelImage | null;
  CAT_WRIST: RulaFeatureSelection<OptionalsWrist>;
  CAT_NECK: RulaFeatureSelection<OptionalsNeckAndTrunk>;
  CAT_TRUNK: RulaFeatureSelection<OptionalsNeckAndTrunk>;
  CAT_LEGS: LabelImage | null;
};
export type OwasSelection = Record<OwasCategory, LabelImage | null>;

export type RulaOptionalsUpperArm = 'Shoulder Raised' | 'Leaning' | 'Abducted';
export type OptionalsNeckAndTrunk = 'Twist' | 'Side-Bend';
export type OptionalsWrist = 'Bent';

export type MarkerAction =
  | { type: 'add'; label: ErgoLabel }
  | { type: 'replace'; labels: ErgoLabel[] }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | {
      type: 'update';
      id: string;
      from: number;
      to: number;
      ergo_method?: string;
      categories?: LabelCategory[];
    };
