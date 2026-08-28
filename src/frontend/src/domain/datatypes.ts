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

export type RulaCategoryName = 'CAT_UPPERARM' | 'CAT_LOWERARM' | 'CAT_WRIST' | 'CAT_NECK' | 'CAT_TRUNK' | 'CAT_LEGS';

export type RulaSelection = Record<RulaCategoryName, LabelImage | null>;

export type RulaOptionalsUpperArm = '';
export type OptionalsNeckAndTrunk = '';

export type OwasCategoryName = 'CAT_BACK' | 'CAT_ARMS' | 'CAT_LEGS' | 'CAT_LOAD';

export type OwasSelection = Record<OwasCategoryName, LabelImage | null>;

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
