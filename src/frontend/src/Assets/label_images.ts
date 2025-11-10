// rula images
import btn1_rula from '@/Assets/rula_images/Label_1.png';
import btn2_rula from '@/Assets/rula_images/Label_2.png';
import btn3_rula from '@/Assets/rula_images/Label_3.png';
import btn4_rula from '@/Assets/rula_images/Label_4.png';
import btn5_rula from '@/Assets/rula_images/Label_5.png';
import btn6_rula from '@/Assets/rula_images/Label_6.png';
import btn7_rula from '@/Assets/rula_images/Label_7.png';
import btn8_rula from '@/Assets/rula_images/Label_8.png';
import btn9_rula from '@/Assets/rula_images/Label_9.png';

import btn10_rula from '@/Assets/rula_images/Label_10.png';

// owas images
import btn1_owas from '@/Assets/owas_images/Label_1.png';
import btn2_owas from '@/Assets/owas_images/Label_2.png';
import btn3_owas from '@/Assets/owas_images/Label_3.png';

// llm images
import btn1_llm from '@/Assets/llm_images/Label_1.png';
import btn2_llm from '@/Assets/llm_images/Label_2.png';
import btn3_llm from '@/Assets/llm_images/Label_3.png';

export type LabelImage = {
  label: string;
  src: string;
  category: string;
};

// RULA IMAGES
const LABEL_IMAGES_CAT1_RULA: ReadonlyArray<LabelImage> = [
  { label: 'Button_1', src: btn1_rula, category: 'Kategorie 1' },
  { label: 'Button_2', src: btn2_rula, category: 'Kategorie 1' },
  { label: 'Button_3', src: btn3_rula, category: 'Kategorie 1' },
  { label: 'Button_4', src: btn4_rula, category: 'Kategorie 1' },
];

const LABEL_IMAGES_CAT2_RULA: ReadonlyArray<LabelImage> = [
  { label: 'Button_5', src: btn5_rula, category: 'Kategorie 2' },
  { label: 'Button_6', src: btn6_rula, category: 'Kategorie 2' },
  { label: 'Button_7', src: btn7_rula, category: 'Kategorie 2' },
  { label: 'Button_8', src: btn8_rula, category: 'Kategorie 2' },
];

const LABEL_IMAGES_CAT3_RULA: ReadonlyArray<LabelImage> = [
  { label: 'Button_9', src: btn9_rula, category: 'Kategorie 3' },
  { label: 'Button_10', src: btn10_rula, category: 'Kategorie 3' },
];

export function get_label_images_cat1_rula(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT1_RULA;
}

export function get_label_images_cat2_rula(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT2_RULA;
}

export function get_label_images_cat3_rula(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT3_RULA;
}

export function get_label_all_label_images_rula(): ReadonlyMap<string, LabelImage> {
  const map = new Map<string, LabelImage>();

  for (const item of LABEL_IMAGES_CAT1_RULA) map.set(item.label, item);
  for (const item of LABEL_IMAGES_CAT2_RULA) map.set(item.label, item);
  for (const item of LABEL_IMAGES_CAT3_RULA) map.set(item.label, item);

  return map;
}

// OWAS IMAGES
const LABEL_IMAGES_CAT1_OWAS: ReadonlyArray<LabelImage> = [
  { label: 'Button_1', src: btn1_owas, category: 'Kategorie 1' },
  { label: 'Button_2', src: btn2_owas, category: 'Kategorie 1' },
  { label: 'Button_3', src: btn3_owas, category: 'Kategorie 1' },
];

export function get_label_images_cat1_owas(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT1_RULA;
}

export function get_label_all_label_images_owas(): ReadonlyMap<string, LabelImage> {
  const map = new Map<string, LabelImage>();

  for (const item of LABEL_IMAGES_CAT1_OWAS) map.set(item.label, item);
  for (const item of LABEL_IMAGES_CAT1_OWAS) map.set(item.label, item);
  for (const item of LABEL_IMAGES_CAT1_OWAS) map.set(item.label, item);

  return map;
}

// OWAS IMAGES
const LABEL_IMAGES_CAT1_LLM: ReadonlyArray<LabelImage> = [
  { label: 'Button_1', src: btn1_llm, category: 'Kategorie 1' },
  { label: 'Button_2', src: btn2_llm, category: 'Kategorie 1' },
  { label: 'Button_3', src: btn3_llm, category: 'Kategorie 1' },
];

export function get_label_images_cat1_llm(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT1_RULA;
}

export function get_label_all_label_images_llm(): ReadonlyMap<string, LabelImage> {
  const map = new Map<string, LabelImage>();

  for (const item of LABEL_IMAGES_CAT1_LLM) map.set(item.label, item);
  return map;
}
