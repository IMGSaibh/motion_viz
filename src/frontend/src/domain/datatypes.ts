// reine Datentypen (KEIN React)
export type Range = [number, number];

export type RectangleLabelBar = {
  from: number;
  to: number;
  leftPct: number;
  scaleX: number;
};

export type LabelImage = {
  name: string;
  src: string;
  category: string;
};

export type RulaCategoryName =
  | 'CAT_UPPERARM'
  | 'CAT_LOWERARM'
  | 'CAT_WRIST'
  | 'CAT_NECK'
  | 'CAT_TRUNK'
  | 'CAT_LEGS';

export type RulaSelection = Record<RulaCategoryName, LabelImage | null>;

export type OwasCategoryName = 'CATEGORY_1' | 'CATEGORY_2' | 'CATEGORY_3' | 'CATEGORY_4';

export type OwasSelection = Record<OwasCategoryName, LabelImage | null>;

export type LabelCategory = {
  name: string;
  image: LabelImage | null;
};

export type ErgoLabel = {
  id: string;
  start_frame: number;
  end_frame: number;
  color?: string;
  button_text?: string;
  ergo_method?: string;
  categories: LabelCategory[];
};

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
      label?: string;
      ergo_method?: string;
      color?: string;
      framecount?: number;
      categories?: LabelCategory[];
    };
