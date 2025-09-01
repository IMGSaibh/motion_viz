import { PropsWithChildren, useMemo } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

import btn1 from '@/Assets/Label_1.png';
import btn2 from '@/Assets/Label_2.png';
import btn3 from '@/Assets/Label_3.png';
import btn4 from '@/Assets/Label_4.png';

export type LabelAsset = {
  label: string;
  src: string;
};

const DEFAULT_ASSETS: LabelAsset[] = [
  { label: 'Button_1', src: btn1 },
  { label: 'Button_2', src: btn2 },
  { label: 'Button_3', src: btn3 },
  { label: 'Button_4', src: btn4 },
];

const label_assets_ctx = createContext<LabelAsset[] | null>(null);

export function LabelAssetsProvider({ children }: PropsWithChildren) {
  return <label_assets_ctx.Provider value={DEFAULT_ASSETS}>{children}</label_assets_ctx.Provider>;
}

export function use_label_assets_ctx() {
  return useContextSelector(label_assets_ctx, (v) => {
    if (!v) throw new Error('use_label_assets must be used within <LabelAssetsProvider>');
    return v;
  });
}

export function use_label_asset_map_ctx() {
  return useContextSelector(label_assets_ctx, (v) => {
    if (!v) throw new Error('use_label_asset_map must be used within <LabelAssetsProvider>');
    return new Map(v.map((a) => [a.label, a]));
  });
}
