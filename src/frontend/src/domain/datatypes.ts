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
  category?: string;
  categories: LabelCategory[];
  label_image?: LabelImage | null;
  framecount?: number;
};
