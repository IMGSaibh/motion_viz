import type { OwasSelection, RulaSelection } from '@/domain/datatypes';
import { create_empty_rula_selection } from '@/domain/label_logic';
import { createContext, useState, useContext } from 'react';

type ErgoMethodsContext = {
  rula_selected: RulaSelection;
  set_rula_selected: (next: RulaSelection) => void;
  owas_selected: OwasSelection;
  set_owas_selected: (next: OwasSelection) => void;
};
const ergo_methods_context = createContext<ErgoMethodsContext | null>(null);

/**
 * Provides the current RULA and OWAS input selections to distant labeling components.
 *
 * This context stores in-progress method selections only. Completed label records belong in
 * the slider-label context, label validation and construction in the domain layer, and the
 * controls that modify these values in method-specific widgets.
 */
export function ErgoMethodsContexProvider({ children }: { children: React.ReactNode }) {
  const [rula_selected, set_rula_selected] = useState<RulaSelection>(create_empty_rula_selection);

  const [owas_selected, set_owas_selected] = useState<OwasSelection>({
    CAT_BACK: null,
    CAT_ARMS: null,
    CAT_LEGS: null,
    CAT_LOAD: null,
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
