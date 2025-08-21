'use client';
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type Range = [number, number];

// Wir trennen Value- und Setter-Context -> weniger Re-Renders bei Konsumenten, die nur setRange brauchen.
const slider_range_context = createContext<Range | null>(null);
const set_range_context = createContext<((r: Range) => void) | null>(null);

export function SliderSliderlistProvider({ children }: PropsWithChildren) {
  const [range, setRange] = useState<Range>([0, 0]);

  // stabile Referenzen
  const set = useCallback((r: Range) => setRange(r), []);
  const value = useMemo(() => range, [range]);

  return (
    <slider_range_context.Provider value={value}>
      <set_range_context.Provider value={set}>{children}</set_range_context.Provider>
    </slider_range_context.Provider>
  );
}

export function use_slider_range_context() {
  const ctx = useContext(slider_range_context);
  if (!ctx) throw new Error('use_slider_range_context must be used within <SliderSliderlistProvider>');
  return ctx;
}

export function use_set_range_context() {
  const ctx = useContext(set_range_context);
  if (!ctx) throw new Error('use_set_range_context must be used within <SliderSliderlistProvider>');
  return ctx;
}
