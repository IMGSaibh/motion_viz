// reine Datentypen (KEIN React)
export type LabelImage = {
  name: string;
  src: string;
  category: string;
};

export type LabelCategory = {
  name: string;
  image: LabelImage | null;
};

export type Label = {
  id: string;
  from: number;
  to: number;
  color?: string;
  label?: string;
  ergo_method?: string;
  categories: LabelCategory[];
  framecount?: number;
};
