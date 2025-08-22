// 'use client';
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type Range = [number, number];

const slider_range_context = createContext<Range | null>(null);
const set_range_context = createContext<((r: Range) => void) | null>(null);

// NEW: visited ranges
export type VisitedRange = { id: string; from: number; to: number; color?: string };
const visited_context = createContext<VisitedRange[] | null>(null);
const add_visited_context = createContext<((v: VisitedRange) => void) | null>(null);
const remove_visited_context = createContext<((id: string) => void) | null>(null);
const clear_visited_context = createContext<(() => void) | null>(null);

export function SliderSliderlistProvider({ children }: PropsWithChildren) {
  const [range, setRange] = useState<Range>([0, 0]);

  // stabile Referenzen
  const set = useCallback((r: Range) => setRange(r), []);
  const value = useMemo(() => range, [range]);

  const [visited, setVisited] = useState<VisitedRange[]>([]);

  const addVisited = useCallback((v: VisitedRange) => setVisited((prev) => [...prev, v]), []);
  const removeVisited = useCallback((id: string) => setVisited((prev) => prev.filter((x) => x.id !== id)), []);
  const clearVisited = useCallback(() => setVisited([]), []);

  return (
    // <slider_range_context.Provider value={value}>
    //   <set_range_context.Provider value={set}>{children}</set_range_context.Provider>
    // </slider_range_context.Provider>
    <slider_range_context.Provider value={value}>
      <set_range_context.Provider value={set}>
        <visited_context.Provider value={visited}>
          <add_visited_context.Provider value={addVisited}>
            <remove_visited_context.Provider value={removeVisited}>
              <clear_visited_context.Provider value={clearVisited}>{children}</clear_visited_context.Provider>
            </remove_visited_context.Provider>
          </add_visited_context.Provider>
        </visited_context.Provider>
      </set_range_context.Provider>
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

// NEW: hooks
export function use_visited_context() {
  const ctx = useContext(visited_context);
  if (!ctx) throw new Error('use_visited_context must be used within <SliderSliderlistProvider>');
  return ctx;
}
export function use_add_visited_context() {
  const ctx = useContext(add_visited_context);
  if (!ctx) throw new Error('use_add_visited_context must be used within <SliderSliderlistProvider>');
  return ctx;
}
export function use_remove_visited_context() {
  const ctx = useContext(remove_visited_context);
  if (!ctx) throw new Error('use_remove_visited_context must be used within <SliderSliderlistProvider>');
  return ctx;
}
export function use_clear_visited_context() {
  const ctx = useContext(clear_visited_context);
  if (!ctx) throw new Error('use_clear_visited_context must be used within <SliderSliderlistProvider>');
  return ctx;
}
