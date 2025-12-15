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
import btn4_owas from '@/Assets/owas_images/Label_4.png';
import btn5_owas from '@/Assets/owas_images/Label_5.png';
import btn6_owas from '@/Assets/owas_images/Label_6.png';
import btn7_owas from '@/Assets/owas_images/Label_7.png';
import btn8_owas from '@/Assets/owas_images/Label_8.png';
import btn9_owas from '@/Assets/owas_images/Label_9.png';
import btn10_owas from '@/Assets/owas_images/Label_10.png';
import btn11_owas from '@/Assets/owas_images/Label_11.png';
import btn12_owas from '@/Assets/owas_images/Label_12.png';
import btn13_owas from '@/Assets/owas_images/Label_13.png';
import btn14_owas from '@/Assets/owas_images/Label_14.png';

// llm images
import btn1_llm from '@/Assets/llm_images/Label_1.png';
import btn2_llm from '@/Assets/llm_images/Label_2.png';
import btn3_llm from '@/Assets/llm_images/Label_3.png';

// play / pause button images
// TODO: load vite plugin for svg as react component
import play_button from '@/Assets/play-button.svg';
import pause_button from '@/Assets/pause-button.svg';

export type LabelImage = {
  label: string;
  src: string;
  category: string;
};

// RULA IMAGES
const LABEL_IMAGES_CAT1_RULA: ReadonlyArray<LabelImage> = [
  { label: 'Oberarm | 20\u00B0 - 20\u00B0 |', src: btn1_rula, category: 'Kategorie 1' },
  { label: 'Oberarm | > 20\u00B0 - 45\u00B0 |', src: btn2_rula, category: 'Kategorie 1' },
  { label: 'Oberarm | > 45\u00B0 -90\u00B0 |', src: btn3_rula, category: 'Kategorie 1' },
  { label: 'Oberarm | > 90\u00B0 |', src: btn4_rula, category: 'Kategorie 1' },
];

const LABEL_IMAGES_CAT2_RULA: ReadonlyArray<LabelImage> = [
  { label: 'Nacken | 0\u00B0 - 10\u00B0 |', src: btn5_rula, category: 'Kategorie 2' },
  { label: 'Nacken | > 10\u00B0 - 20\u00B0 |', src: btn6_rula, category: 'Kategorie 2' },
  { label: 'Nacken | > 20\u00B0 |', src: btn7_rula, category: 'Kategorie 2' },
  { label: 'Nacken | in Extension |', src: btn8_rula, category: 'Kategorie 2' },
];

const LABEL_IMAGES_CAT3_RULA: ReadonlyArray<LabelImage> = [
  { label: 'statisch > 1 min', src: btn9_rula, category: 'Kategorie 3' },
  { label: 'Kraft/Last | 2–10 kg |', src: btn10_rula, category: 'Kategorie 3' },
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
  { label: 'Code 1', src: btn1_owas, category: 'Kategorie 1' },
  { label: 'Code 2', src: btn2_owas, category: 'Kategorie 1' },
  { label: 'Code 3', src: btn3_owas, category: 'Kategorie 1' },
  { label: 'Code 4', src: btn4_owas, category: 'Kategorie 1' },
];

const LABEL_IMAGES_CAT2_OWAS: ReadonlyArray<LabelImage> = [
  { label: 'Code 1', src: btn5_owas, category: 'Kategorie 2' },
  { label: 'Code 2', src: btn6_owas, category: 'Kategorie 2' },
  { label: 'Code 3', src: btn7_owas, category: 'Kategorie 2' },
];

const LABEL_IMAGES_CAT3_OWAS: ReadonlyArray<LabelImage> = [
  { label: 'Code 1', src: btn8_owas, category: 'Kategorie 3' },
  { label: 'Code 2', src: btn9_owas, category: 'Kategorie 3' },
  { label: 'Code 3', src: btn10_owas, category: 'Kategorie 3' },
  { label: 'Code 4', src: btn11_owas, category: 'Kategorie 3' },
  { label: 'Code 5', src: btn12_owas, category: 'Kategorie 3' },
  { label: 'Code 6', src: btn13_owas, category: 'Kategorie 3' },
  { label: 'Code 7', src: btn14_owas, category: 'Kategorie 3' },
];

const LABEL_IMAGES_CAT4_OWAS: ReadonlyArray<LabelImage> = [
  { label: 'Code 1', src: btn5_owas, category: 'Kategorie 4' },
  { label: 'Code 2', src: btn6_owas, category: 'Kategorie 4' },
  { label: 'Code 3', src: btn7_owas, category: 'Kategorie 4' },
];

export function get_label_images_cat1_owas(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT1_OWAS;
}

export function get_label_images_cat2_owas(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT2_OWAS;
}

export function get_label_images_cat3_owas(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT3_OWAS;
}

export function get_label_images_cat4_owas(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT4_OWAS;
}

export function get_label_all_label_images_owas(): ReadonlyMap<string, LabelImage> {
  const map = new Map<string, LabelImage>();

  for (const item of LABEL_IMAGES_CAT1_OWAS) map.set(item.label, item);
  for (const item of LABEL_IMAGES_CAT2_OWAS) map.set(item.label, item);
  for (const item of LABEL_IMAGES_CAT3_OWAS) map.set(item.label, item);
  for (const item of LABEL_IMAGES_CAT4_OWAS) map.set(item.label, item);
  return map;
}

// LLM IMAGES
const LABEL_IMAGES_CAT1_LLM: ReadonlyArray<LabelImage> = [
  { label: 'Button_1', src: btn1_llm, category: 'Kategorie 1' },
  { label: 'Button_2', src: btn2_llm, category: 'Kategorie 1' },
  { label: 'Button_3', src: btn3_llm, category: 'Kategorie 1' },
];

export function get_label_images_cat1_llm(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT1_LLM;
}

export function get_label_all_label_images_llm(): ReadonlyMap<string, LabelImage> {
  const map = new Map<string, LabelImage>();

  for (const item of LABEL_IMAGES_CAT1_LLM) map.set(item.label, item);
  return map;
}

// PLAYER IMAGES
export const PLAY_BUTTON_IMAGE: LabelImage = {
  label: 'Play_Button',
  src: play_button,
  category: 'Control',
};

export const PAUSE_BUTTON_IMAGE: LabelImage = {
  label: 'Pause_Button',
  src: pause_button,
  category: 'Control',
};
