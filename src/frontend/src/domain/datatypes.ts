// Pure data types (NO React)

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
};

export type LabelImage = {
  name: string;
  src: string;
  category: string;
};

export type RulaCategory = 'CAT_UPPERARM' | 'CAT_LOWERARM' | 'CAT_WRIST' | 'CAT_NECK' | 'CAT_TRUNK' | 'CAT_LEGS';
export type OwasCategory = 'CAT_BACK' | 'CAT_ARMS' | 'CAT_LEGS' | 'CAT_LOAD';

export type RulaFeatureSelection = {
  feature_id: number | null;
  optional_feature_ids: number[];
};

export type RulaSelection = {
  CAT_UPPERARM: RulaFeatureSelection;
  CAT_LOWERARM: number | null;
  CAT_WRIST: RulaFeatureSelection;
  CAT_NECK: RulaFeatureSelection;
  CAT_TRUNK: RulaFeatureSelection;
  CAT_LEGS: number | null;
};
export type OwasSelection = Record<OwasCategory, number | null>;

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
