import btn1 from '@/Assets/images/Label_1.png';
import btn2 from '@/Assets/images/Label_2.png';
import btn3 from '@/Assets/images/Label_3.png';
import btn4 from '@/Assets/images/Label_4.png';
import btn5 from '@/Assets/images/Label_5.png';
import btn6 from '@/Assets/images/Label_6.png';
import btn7 from '@/Assets/images/Label_7.png';
import btn8 from '@/Assets/images/Label_8.png';

import btn9 from '@/Assets/images/Label_9.png';
import btn10 from '@/Assets/images/Label_10.png';

export type LabelImage = {
  label: string;
  src: string;
};

const LABEL_IMAGES_CAT1: ReadonlyArray<LabelImage> = [
  { label: 'Button_1', src: btn1 },
  { label: 'Button_2', src: btn2 },
  { label: 'Button_3', src: btn3 },
  { label: 'Button_4', src: btn4 },
];

const LABEL_IMAGES_CAT2: ReadonlyArray<LabelImage> = [
  { label: 'Button_5', src: btn5 },
  { label: 'Button_6', src: btn6 },
  { label: 'Button_7', src: btn7 },
  { label: 'Button_8', src: btn8 },
];

const LABEL_IMAGES_CAT3: ReadonlyArray<LabelImage> = [
  { label: 'Button_9', src: btn9 },
  { label: 'Button_10', src: btn10 },
];

export function get_label_images_cat1(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT1;
}

export function get_label_images_cat2(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT2;
}

export function get_label_images_cat3(): ReadonlyArray<LabelImage> {
  return LABEL_IMAGES_CAT3;
}

export function get_label_all_label_images(): ReadonlyMap<string, LabelImage> {
  const map = new Map<string, LabelImage>();

  for (const item of LABEL_IMAGES_CAT1) map.set(item.label, item);
  for (const item of LABEL_IMAGES_CAT2) map.set(item.label, item);
  for (const item of LABEL_IMAGES_CAT3) map.set(item.label, item);

  return map;
}
