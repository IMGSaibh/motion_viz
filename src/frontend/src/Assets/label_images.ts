// play / pause button images
// TODO: load vite plugin for svg as react component
import play_button from '@/Assets/play-button.svg';
import pause_button from '@/Assets/pause-button.svg';

import type { LabelImage } from '@/domain/datatypes';

// rula images
import btn_rula_ua_1 from '@/Assets/rula_images/rula_ua_1.png';
import btn_rula_ua_2 from '@/Assets/rula_images/rula_ua_2.png';
import btn_rula_ua_3 from '@/Assets/rula_images/rula_ua_3.png';
import btn_rula_ua_4 from '@/Assets/rula_images/rula_ua_4.png';
import btn_rula_ua_5 from '@/Assets/rula_images/rula_ua_5.png';
import btn_rula_ua_6 from '@/Assets/rula_images/rula_plus.png';
import btn_rula_ua_7 from '@/Assets/rula_images/rula_plus.png';
import btn_rula_ua_8 from '@/Assets/rula_images/rula_minus.png';

import btn_rula_la_1 from '@/Assets/rula_images/rula_la_1.png';
import btn_rula_la_2 from '@/Assets/rula_images/rula_la_2.png';
import btn_rula_la_3 from '@/Assets/rula_images/rula_la_3.png';

import btn_rula_w_1 from '@/Assets/rula_images/rula_w_1.png';
import btn_rula_w_2 from '@/Assets/rula_images/rula_w_2.png';
import btn_rula_w_3 from '@/Assets/rula_images/rula_w_3.png';
import btn_rula_w_4 from '@/Assets/rula_images/rula_w_4.png';

import btn_rula_n_1 from '@/Assets/rula_images/rula_n_1.png';
import btn_rula_n_2 from '@/Assets/rula_images/rula_n_2.png';
import btn_rula_n_3 from '@/Assets/rula_images/rula_n_3.png';
import btn_rula_n_4 from '@/Assets/rula_images/rula_n_4.png';
import btn_rula_n_5 from '@/Assets/rula_images/rula_plus.png';
import btn_rula_n_6 from '@/Assets/rula_images/rula_plus.png';

import btn_rula_t_1 from '@/Assets/rula_images/rula_t_1.png';
import btn_rula_t_2 from '@/Assets/rula_images/rula_t_2.png';
import btn_rula_t_3 from '@/Assets/rula_images/rula_t_3.png';
import btn_rula_t_4 from '@/Assets/rula_images/rula_t_4.png';
import btn_rula_t_5 from '@/Assets/rula_images/rula_plus.png';
import btn_rula_t_6 from '@/Assets/rula_images/rula_plus.png';

import btn_rula_l_1 from '@/Assets/rula_images/rula_plus.png';

// RULA IMAGES
const LABEL_IMAGES_RULA_CAT_UA: ReadonlyArray<LabelImage> = [
  { name: '20\u00B0 - 20\u00B0 ', src: btn_rula_ua_1, category: 'Cat_UpperArm' },
  { name: '< 20\u00B0 ', src: btn_rula_ua_2, category: 'Cat_UpperArm' },
  { name: '> 20\u00B0 - 45\u00B0 ', src: btn_rula_ua_3, category: 'Cat_UpperArm' },
  { name: '> 45\u00B0 -90\u00B0 ', src: btn_rula_ua_4, category: 'Cat_UpperArm' },
  { name: '> 90\u00B0 ', src: btn_rula_ua_5, category: 'Cat_UpperArm' },
  { name: 'Sh. Raised ', src: btn_rula_ua_6, category: 'Cat_UpperArm' },
  { name: 'Abducted', src: btn_rula_ua_7, category: 'Cat_UpperArm' },
  { name: 'Leaning', src: btn_rula_ua_8, category: 'Cat_UpperArm' },
];

const LABEL_IMAGES_RULA_CAT_LA: ReadonlyArray<LabelImage> = [
  { name: '60\u00B0 - 100\u00B0', src: btn_rula_la_1, category: 'Cat_LowerArm' },
  { name: '<0\u00B0 | >100\u00B0', src: btn_rula_la_2, category: 'Cat_LowerArm' },
  { name: 'Midline', src: btn_rula_la_3, category: 'Cat_LowerArm' },
];

const LABEL_IMAGES_RULA_CAT_W: ReadonlyArray<LabelImage> = [
  { name: '0\u00B0', src: btn_rula_w_1, category: 'Cat_Wrist' },
  { name: '15\u00B0 - 15\u00B0', src: btn_rula_w_2, category: 'Cat_Wrist' },
  { name: '<15\u00B0 | >15\u00B0', src: btn_rula_w_3, category: 'Cat_Wrist' },
  { name: 'Bent', src: btn_rula_w_4, category: 'Cat_Wrist'  },
];

const LABEL_IMAGES_RULA_CAT_N: ReadonlyArray<LabelImage> = [
  { name: '0\u00B0 - 10\u00B0', src: btn_rula_n_1, category: 'Cat_Neck' },
  { name: '10\u00B0 - 20\u00B0', src: btn_rula_n_2, category: 'Cat_Neck' },
  { name: '>20\u00B0 ', src: btn_rula_n_3, category: 'Cat_Neck' },
  { name: '<0\u00B0 ', src: btn_rula_n_4, category: 'Cat_Neck' },
  { name: 'Twist', src: btn_rula_n_5, category: 'Cat_Neck' },
  { name: 'Side-Bend', src: btn_rula_n_6, category: 'Cat_Neck' },
];


const LABEL_IMAGES_RULA_CAT_T: ReadonlyArray<LabelImage> = [
  { name: '0\u00B0', src: btn_rula_t_1, category: 'Cat_Trunk' },
  { name: '0\u00B0 - 20\u00B0', src: btn_rula_t_2, category: 'Cat_Trunk' },
  { name: '20\u00B0 - 60\u00B0', src: btn_rula_t_3, category: 'Cat_Trunk' },
  { name: '>60\u00B0', src: btn_rula_t_4, category: 'Cat_Trunk' },
  { name: 'Twist', src: btn_rula_t_5, category: 'Cat_Trunk' },
  { name: 'Side-Bend', src: btn_rula_t_6, category: 'Cat_Trunk' },
];

const LABEL_IMAGES_RULA_CAT_L: ReadonlyArray<LabelImage> = [
  { name: 'Not well', src: btn_rula_l_1, category: 'Cat_Legs'},
];



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

// lmm images
import btn1_lmm from '@/Assets/lmm_images/Label_1.png';
import btn2_lmm from '@/Assets/lmm_images/Label_2.png';
import btn3_lmm from '@/Assets/lmm_images/Label_3.png';


export function get_label_images_rula_cat_ua(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_RULA_CAT_UA;
}

export function get_label_images_rula_cat_la(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_RULA_CAT_LA;
}

export function get_label_images_rula_cat_w(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_RULA_CAT_W;
}

export function get_label_images_rula_cat_n(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_RULA_CAT_N;
}

export function get_label_images_rula_cat_t(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_RULA_CAT_T;
}

export function get_label_images_rula_cat_l(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_RULA_CAT_L;
}



// OWAS IMAGES
const LABEL_IMAGES_CAT1_OWAS: ReadonlyArray<LabelImage> = [
  { name: 'Code 1', src: btn1_owas, category: 'Kategorie 1'},
  { name: 'Code 2', src: btn2_owas, category: 'Kategorie 1'},
  { name: 'Code 3', src: btn3_owas, category: 'Kategorie 1'},
  { name: 'Code 4', src: btn4_owas, category: 'Kategorie 1'},
];

const LABEL_IMAGES_CAT2_OWAS: ReadonlyArray<LabelImage> = [
  { name: 'Code 1', src: btn5_owas, category: 'Kategorie 2'},
  { name: 'Code 2', src: btn6_owas, category: 'Kategorie 2'},
  { name: 'Code 3', src: btn7_owas, category: 'Kategorie 2' },
];

const LABEL_IMAGES_CAT3_OWAS: ReadonlyArray<LabelImage> = [
  { name: 'Code 1', src: btn8_owas, category: 'Kategorie 3'},
  { name: 'Code 2', src: btn9_owas, category: 'Kategorie 3'},
  { name: 'Code 3', src: btn10_owas, category: 'Kategorie 3'},
  { name: 'Code 4', src: btn11_owas, category: 'Kategorie 3'},
  { name: 'Code 5', src: btn12_owas, category: 'Kategorie 3'},
  { name: 'Code 6', src: btn13_owas, category: 'Kategorie 3'},
  { name: 'Code 7', src: btn14_owas, category: 'Kategorie 3' },
];

const LABEL_IMAGES_CAT4_OWAS: ReadonlyArray<LabelImage> = [
  { name: 'Code 1', src: btn5_owas, category: 'Kategorie 4'},
  { name: 'Code 2', src: btn6_owas, category: 'Kategorie 4'},
  { name: 'Code 3', src: btn7_owas, category: 'Kategorie 4'},
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

  for (const item of LABEL_IMAGES_CAT1_OWAS) map.set(item.name, item);
  for (const item of LABEL_IMAGES_CAT2_OWAS) map.set(item.name, item);
  for (const item of LABEL_IMAGES_CAT3_OWAS) map.set(item.name, item);
  for (const item of LABEL_IMAGES_CAT4_OWAS) map.set(item.name, item);
  return map;
}

// LMM IMAGES
const LABEL_IMAGES_CAT1_LLM: ReadonlyArray<LabelImage> = [
  { name: 'Button_1', src: btn1_lmm, category: 'Kategorie 1'},
  { name: 'Button_2', src: btn2_lmm, category: 'Kategorie 1'},
  { name: 'Button_3', src: btn3_lmm, category: 'Kategorie 1'},
];

export function get_label_images_cat1_llm(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT1_LLM;
}

export function get_label_all_label_images_llm(): ReadonlyMap<string, LabelImage> {
  const map = new Map<string, LabelImage>();

  for (const item of LABEL_IMAGES_CAT1_LLM) map.set(item.name, item);
  return map;
}

// PLAYER IMAGES
export const PLAY_BUTTON_IMAGE: LabelImage = {
  name: 'Play_Button',
  src: play_button,
  category: 'Control'
};

export const PAUSE_BUTTON_IMAGE: LabelImage = {
  name: 'Pause_Button',
  src: pause_button,
  category: 'Control'
};

