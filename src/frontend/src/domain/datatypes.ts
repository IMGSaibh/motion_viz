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
  start_frame: number;
  end_frame: number;
  color?: string;
  button_text?: string;
  ergo_method?: string;
  categories: LabelCategory[];
};

export type LabelML = {
  ergo_method?: string;
  start_frame: number;
  end_frame: number;
  button_text?: string;
};
