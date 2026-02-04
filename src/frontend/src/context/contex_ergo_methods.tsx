import { LabelImage } from '@/domain/datatypes';
import { createContext, useState, useContext } from 'react';

type ErgoMethodsContext = {
  rula_selected: Record<string, LabelImage | null>;
  set_rula_selected: (next: Record<string, LabelImage | null>) => void;
  owas_selected: Record<string, LabelImage | null>;
  set_owas_selected: (next: Record<string, LabelImage | null>) => void;
};
const ergo_methods_context = createContext<ErgoMethodsContext | null>(null);

export function ErgoMethodsContexProvider({ children }: { children: React.ReactNode }) {
  const [rula_selected, set_rula_selected] = useState<Record<string, LabelImage | null>>({
    CAT1: null,
    CAT2: null,
    CAT3: null,
  });

  const [owas_selected, set_owas_selected] = useState<Record<string, LabelImage | null>>({
    CAT1: null,
    CAT2: null,
    CAT3: null,
    CAT4: null,
  });

  // TODO: use memoized default value if needed
  const value: ErgoMethodsContext = {
    rula_selected,
    set_rula_selected,
    owas_selected,
    set_owas_selected,
  };
  return <ergo_methods_context.Provider value={value}>{children}</ergo_methods_context.Provider>;
}

export const use_ergo_methods_cxt = () => {
  const ctx = useContext(ergo_methods_context);
  if (!ctx) throw new Error('use_ergo_methods_ctx must be used within a ErgoMethodsContexProvider');
  return ctx;
};
