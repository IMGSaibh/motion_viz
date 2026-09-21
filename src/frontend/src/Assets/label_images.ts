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

// owas images
import btn_owas_b_1 from '@/Assets/owas_images/owas_back_1_straight.png';
import btn_owas_b_2 from '@/Assets/owas_images/owas_back_2_bent.png';
import btn_owas_b_3 from '@/Assets/owas_images/owas_back_3_straight_twisted.png';
import btn_owas_b_4 from '@/Assets/owas_images/owas_back_4_bent_twisted.png';
import btn_owas_a_1 from '@/Assets/owas_images/owas_arms_1_below.png';
import btn_owas_a_2 from '@/Assets/owas_images/owas_arms_2_one_above.png';
import btn_owas_a_3 from '@/Assets/owas_images/owas_arms_3_both_above.png';
import btn_owas_l_1 from '@/Assets/owas_images/owas_legs_1_straight.png';
import btn_owas_l_2 from '@/Assets/owas_images/owas_legs_2_one_load.png';
import btn_owas_l_3 from '@/Assets/owas_images/owas_legs_3_both_bent.png';
import btn_owas_l_4 from '@/Assets/owas_images/owas_legs_4_load_one.png';
import btn_owas_l_5 from '@/Assets/owas_images/owas_legs_5_kneeling.png';
import btn_owas_l_6 from '@/Assets/owas_images/owas_legs_6_moved.png';
import btn_owas_l_7 from '@/Assets/owas_images/owas_legs_7_hanging.png';

// lmm images
import btn1_lmm from '@/Assets/lmm_images/Label_1.png';
import btn2_lmm from '@/Assets/lmm_images/Label_2.png';
import btn3_lmm from '@/Assets/lmm_images/Label_3.png';

// RULA IMAGES
const LABEL_IMAGES_RULA_CAT_UA: ReadonlyArray<LabelImage> = [
  { name: '20\u00B0 - 20\u00B0 ', src: btn_rula_ua_1, category: 'CAT_UPPERARM' },
  { name: '< 20\u00B0 ', src: btn_rula_ua_2, category: 'CAT_UPPERARM' },
  { name: '> 20\u00B0 - 45\u00B0 ', src: btn_rula_ua_3, category: 'CAT_UPPERARM' },
  { name: '> 45\u00B0 -90\u00B0 ', src: btn_rula_ua_4, category: 'CAT_UPPERARM' },
  { name: '> 90\u00B0 ', src: btn_rula_ua_5, category: 'CAT_UPPERARM' },
  { name: 'Shoulder Raised', src: btn_rula_ua_6, category: 'CAT_UPPERARM' },
  { name: 'Abducted', src: btn_rula_ua_7, category: 'CAT_UPPERARM' },
  { name: 'Leaning', src: btn_rula_ua_8, category: 'CAT_UPPERARM' },
];

const LABEL_IMAGES_RULA_CAT_LA: ReadonlyArray<LabelImage> = [
  { name: '60\u00B0 - 100\u00B0', src: btn_rula_la_1, category: 'CAT_LOWERARM' },
  { name: '<0\u00B0 - 60\u00B0 | >100\u00B0', src: btn_rula_la_2, category: 'CAT_LOWERARM' },
  { name: 'Midline', src: btn_rula_la_3, category: 'CAT_LOWERARM' },
];

const LABEL_IMAGES_RULA_CAT_W: ReadonlyArray<LabelImage> = [
  { name: '0\u00B0', src: btn_rula_w_1, category: 'CAT_WRIST' },
  { name: '15\u00B0 - 15\u00B0', src: btn_rula_w_2, category: 'CAT_WRIST' },
  { name: '<15\u00B0 | >15\u00B0', src: btn_rula_w_3, category: 'CAT_WRIST' },
  { name: 'Bent', src: btn_rula_w_4, category: 'CAT_WRIST' },
];

const LABEL_IMAGES_RULA_CAT_N: ReadonlyArray<LabelImage> = [
  { name: '0\u00B0 - 10\u00B0', src: btn_rula_n_1, category: 'CAT_NECK' },
  { name: '10\u00B0 - 20\u00B0', src: btn_rula_n_2, category: 'CAT_NECK' },
  { name: '>20\u00B0 ', src: btn_rula_n_3, category: 'CAT_NECK' },
  { name: '<0\u00B0 ', src: btn_rula_n_4, category: 'CAT_NECK' },
  { name: 'Twist', src: btn_rula_n_5, category: 'CAT_NECK' },
  { name: 'Side-Bend', src: btn_rula_n_6, category: 'CAT_NECK' },
];

const LABEL_IMAGES_RULA_CAT_T: ReadonlyArray<LabelImage> = [
  { name: '0\u00B0', src: btn_rula_t_1, category: 'CAT_TRUNK' },
  { name: '0\u00B0 - 20\u00B0', src: btn_rula_t_2, category: 'CAT_TRUNK' },
  { name: '20\u00B0 - 60\u00B0', src: btn_rula_t_3, category: 'CAT_TRUNK' },
  { name: '>60\u00B0', src: btn_rula_t_4, category: 'CAT_TRUNK' },
  { name: 'Twist', src: btn_rula_t_5, category: 'CAT_TRUNK' },
  { name: 'Side-Bend', src: btn_rula_t_6, category: 'CAT_TRUNK' },
];

const LABEL_IMAGES_RULA_CAT_L: ReadonlyArray<LabelImage> = [
  { name: 'Not well', src: btn_rula_l_1, category: 'CAT_LEGS' },
];

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

export function get_label_all_label_images_rula(): ReadonlyMap<string, LabelImage> {
  const map = new Map<string, LabelImage>();

  for (const item of LABEL_IMAGES_RULA_CAT_UA) map.set(item.name, item);
  for (const item of LABEL_IMAGES_RULA_CAT_LA) map.set(item.name, item);
  for (const item of LABEL_IMAGES_RULA_CAT_W) map.set(item.name, item);
  for (const item of LABEL_IMAGES_RULA_CAT_N) map.set(item.name, item);
  for (const item of LABEL_IMAGES_RULA_CAT_T) map.set(item.name, item);
  for (const item of LABEL_IMAGES_RULA_CAT_L) map.set(item.name, item);

  return map;
}

// OWAS IMAGES
const LABEL_IMAGES_CAT1_OWAS: ReadonlyArray<LabelImage> = [
  { name: 'straight', src: btn_owas_b_1, category: 'CAT_BACK' },
  { name: 'bent', src: btn_owas_b_2, category: 'CAT_BACK' },  
  { name: 'straight and twisted', src: btn_owas_b_3, category: 'CAT_BACK' },
  { name: 'bent and twisted', src: btn_owas_b_4, category: 'CAT_BACK' },
];

const LABEL_IMAGES_CAT2_OWAS: ReadonlyArray<LabelImage> = [
  { name: 'both limbs on or below shoulder level', src: btn_owas_a_1, category: 'CAT_ARMS' },
  { name: 'one limb on or above shoulder level', src: btn_owas_a_2, category: 'CAT_ARMS' },
  { name: 'both limbs abouve shoulder level', src: btn_owas_a_3, category: 'CAT_ARMS' },
];

const LABEL_IMAGES_CAT3_OWAS: ReadonlyArray<LabelImage> = [
  { name: 'loading on both limbs, straight', src: btn_owas_l_1, category: 'CAT_LEGS' },
  { name: 'loading on one limb, straight', src: btn_owas_l_2, category: 'CAT_LEGS' },
  { name: 'loading on both limbs, bent', src: btn_owas_l_3, category: 'CAT_LEGS' },
  { name: 'loading on one limb, bent', src: btn_owas_l_4, category: 'CAT_LEGS' },
  { name: 'loading on one limb, kneeling ', src: btn_owas_l_5, category: 'CAT_LEGS' },
  { name: 'body is moved by the limbs', src: btn_owas_l_6, category: 'CAT_LEGS' },
  { name: 'both limbs hanging free', src: btn_owas_l_7, category: 'CAT_LEGS' },
];

const LABEL_IMAGES_CAT4_OWAS: ReadonlyArray<LabelImage> = [
  { name: 'TODO', src: btn_owas_a_1, category: 'CAT_LOAD' },
  { name: 'TODO', src: btn_owas_a_2, category: 'CAT_LOAD' },
  { name: 'TODO', src: btn_owas_a_3, category: 'CAT_LOAD' },
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
  { name: 'Button_1', src: btn1_lmm, category: 'CAT_1' },
  { name: 'Button_2', src: btn2_lmm, category: 'CAT_1' },
  { name: 'Button_3', src: btn3_lmm, category: 'CAT_1' },
];

export function get_label_images_cat1_llm(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT1_LLM;
}

export function get_label_all_label_images_llm(): ReadonlyMap<string, LabelImage> {
  const map = new Map<string, LabelImage>();

  for (const item of LABEL_IMAGES_CAT1_LLM) map.set(item.name, item);
  return map;
}

const RULA_IMAGES_BY_CATEGORY: Readonly<Record<string, readonly LabelImage[]>> = {
  CAT_UPPERARM: LABEL_IMAGES_RULA_CAT_UA,
  CAT_LOWERARM: LABEL_IMAGES_RULA_CAT_LA,
  CAT_WRIST: LABEL_IMAGES_RULA_CAT_W,
  CAT_NECK: LABEL_IMAGES_RULA_CAT_N,
  CAT_TRUNK: LABEL_IMAGES_RULA_CAT_T,
  CAT_LEGS: LABEL_IMAGES_RULA_CAT_L,
};

const OWAS_IMAGES_BY_CATEGORY: Readonly<Record<string, readonly LabelImage[]>> = {
  CAT_BACK: LABEL_IMAGES_CAT1_OWAS,
  CAT_ARMS: LABEL_IMAGES_CAT2_OWAS,
  CAT_LEGS: LABEL_IMAGES_CAT3_OWAS,
  CAT_LOAD: LABEL_IMAGES_CAT4_OWAS,
};

export function get_label_image_by_feature_id(
  ergo_method: string | undefined,
  category: string,
  feature_id: number,
): LabelImage | undefined {
  const images =
    ergo_method?.toUpperCase() === 'OWAS'
      ? OWAS_IMAGES_BY_CATEGORY[category]
      : RULA_IMAGES_BY_CATEGORY[category];
  return images?.[feature_id - 1];
}

// PLAYER IMAGES
export const PLAY_BUTTON_IMAGE: LabelImage = {
  name: 'Play_Button',
  src: play_button,
  category: 'Control',
};

export const PAUSE_BUTTON_IMAGE: LabelImage = {
  name: 'Pause_Button',
  src: pause_button,
  category: 'Control',
};
