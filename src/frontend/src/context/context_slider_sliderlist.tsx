import { type PropsWithChildren, useCallback, useMemo, useReducer, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

export type Range = [number, number];
export type RangeLabel = { id: string; from: number; to: number; color?: string };

type SliderSliderlistContext = {
  range: Range;
  set_range: (r: Range) => void;

  range_marker: RangeLabel[];
  add_label_rect: (m: RangeLabel) => void;
  remove_label_rect: (id: string) => void;
  clear_label_rects: () => void;

  // Editing-Flow
  editing_id: string | null;
  start_edit_label_rect: (id: string) => void; // setzt range auf [from,to] und merkt sich das Ziel
  save_current_edit_label_rect: () => void; // speichert aktuellen range in den Marker mit editing_id
  cancel_edit_label_rect: () => void; // beendet den Edit-Modus ohne zu speichern
};

const slider_sliderlist_context = createContext<SliderSliderlistContext | null>(null);

// ===== Marker-Reducer: vermeidet unnötige Referenzwechsel =====
function normalize(range: RangeLabel): RangeLabel {
  if (Number.isNaN(range.from) || Number.isNaN(range.to)) return range;
  const from = Math.min(range.from, range.to);
  const to = Math.max(range.from, range.to);
  return { ...range, from, to };
}

type MarkerAction =
  | { type: 'add'; range_label: RangeLabel }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | { type: 'update'; id: string; from: number; to: number };

function markerReducer(state: RangeLabel[], action: MarkerAction): RangeLabel[] {
  switch (action.type) {
    case 'add': {
      const label = normalize(action.range_label);
      if (!label.id) return state;
      // Duplikate (id) vermeiden; No-Op → gleiche Referenz zurückgeben
      if (state.some((x) => x.id === label.id)) return state;
      return [...state, label];
    }
    case 'remove': {
      const next = state.filter((x) => x.id !== action.id);
      return next.length === state.length ? state : next;
    }
    case 'clear': {
      return state.length === 0 ? state : [];
    }
    case 'update': {
      const from = Math.min(action.from, action.to);
      const to = Math.max(action.from, action.to);
      let changed = false;
      const next = state.map((x) => {
        if (x.id !== action.id) return x;
        if (x.from === from && x.to === to) return x; // No-Op
        changed = true;
        return { ...x, from, to };
      });
      return changed ? next : state;
    }
    default:
      return state;
  }
}

export function SliderSliderlistProvider({ children }: PropsWithChildren) {
  const [range, set_range] = useState<Range>([0, 0]);
  const [range_marker, dispatch] = useReducer(markerReducer, [] as RangeLabel[]);
  const [editing_id, set_editing_id] = useState<string | null>(null);

  const add_label_rect = useCallback((m: RangeLabel) => dispatch({ type: 'add', range_label: m }), []);
  const remove_label_rect = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const clear_label_rects = useCallback(() => dispatch({ type: 'clear' }), []);

  // === Edit-Flow ===
  const start_edit_label_rect = useCallback(
    (id: string) => {
      const m = range_marker.find((x) => x.id === id);
      if (!m) return;
      set_range([m.from, m.to]);
      set_editing_id(id);
      console.log('start edit', id);
      console.log('range_marker', range_marker);
    },
    [range_marker],
  );

  const save_current_edit_label_rect = useCallback(() => {
    if (!editing_id) return;
    dispatch({ type: 'update', id: editing_id, from: range[0], to: range[1] });
    set_editing_id(null);
  }, [editing_id, range]);

  const cancel_edit_label_rect = useCallback(() => {
    if (!editing_id) return;
    set_editing_id(null);
  }, [editing_id]);

  const value = useMemo<SliderSliderlistContext>(
    () => ({
      range,
      set_range,
      range_marker,
      add_label_rect,
      remove_label_rect,
      clear_label_rects,
      editing_id,
      start_edit_label_rect,
      save_current_edit_label_rect,
      cancel_edit_label_rect,
    }),
    [
      range,
      range_marker,
      add_label_rect,
      remove_label_rect,
      clear_label_rects,
      editing_id,
      start_edit_label_rect,
      save_current_edit_label_rect,
      cancel_edit_label_rect,
    ],
  );

  return <slider_sliderlist_context.Provider value={value}>{children}</slider_sliderlist_context.Provider>;
}

// ===== Selektor-Hooks – minimal re-render =====
export function use_slider_range_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_slider_range_context must be used within <SliderSliderlistProvider>');
    return v.range;
  });
}

export function use_set_range_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_set_range_context must be used within <SliderSliderlistProvider>');
    return v.set_range;
  });
}

export function use_labeled_rect_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_labeled_rect_context must be used within <SliderSliderlistProvider>');
    return v.range_marker;
  });
}

export function use_add_visited_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_add_visited_context must be used within <SliderSliderlistProvider>');
    return v.add_label_rect;
  });
}

export function use_remove_visited_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_remove_visited_context must be used within <SliderSliderlistProvider>');
    return v.remove_label_rect;
  });
}

export function use_clear_visited_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_clear_visited_context must be used within <SliderSliderlistProvider>');
    return v.clear_label_rects;
  });
}

// === Neue Edit-Selector-Hooks ===
export function use_editing_visited_id_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_editing_visited_id_context must be used within <SliderSliderlistProvider>');
    return v.editing_id;
  });
}

export function use_start_edit_visited_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_start_edit_visited_context must be used within <SliderSliderlistProvider>');
    return v.start_edit_label_rect;
  });
}

export function use_save_edit_visited_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_save_edit_visited_context must be used within <SliderSliderlistProvider>');
    return v.save_current_edit_label_rect;
  });
}

export function use_cancel_edit_visited_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_cancel_edit_visited_context must be used within <SliderSliderlistProvider>');
    return v.cancel_edit_label_rect;
  });
}
