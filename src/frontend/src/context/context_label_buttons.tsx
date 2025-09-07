import { PropsWithChildren } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

import btn1 from '@/Assets/Label_1.png';
import btn2 from '@/Assets/Label_2.png';
import btn3 from '@/Assets/Label_3.png';
import btn4 from '@/Assets/Label_4.png';

export type LabelImage = {
  label: string;
  src: string;
};

const LABLE_IMAGES: LabelImage[] = [
  { label: 'Button_1', src: btn1 },
  { label: 'Button_2', src: btn2 },
  { label: 'Button_3', src: btn3 },
  { label: 'Button_4', src: btn4 },
];

const label_btn_images_ctx = createContext<LabelImage[] | null>(null);

export function LabelImageProvider({ children }: PropsWithChildren) {
  return <label_btn_images_ctx.Provider value={LABLE_IMAGES}>{children}</label_btn_images_ctx.Provider>;
}

export function use_label_image_ctx() {
  return useContextSelector(label_btn_images_ctx, (v) => {
    if (!v) throw new Error('use_label_image_ctx must be used within <LabelImageProvider>');
    return v;
  });
}

export function use_label_image_map_ctx() {
  return useContextSelector(label_btn_images_ctx, (v) => {
    if (!v) throw new Error('use_label_image_map_ctx must be used within <LabelImageProvider>');
    return new Map(v.map((a) => [a.label, a]));
  });
}
