import { type PropsWithChildren, useCallback, useMemo, useReducer, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

export type Range = [number, number];
export type RangeLabel = { id: string; from: number; to: number; color?: string; label?: string };

type SliderSliderlistContext = {
  range: Range;
  set_slider_label_range: (r: Range) => void;

  range_marker: RangeLabel[];
  add_slider_label: (m: RangeLabel) => void;
  remove_slider_label: (id: string) => void;
  clear_slider_label_list: () => void;

  editing_id: string | null;
  start_editing_label: (id: string) => void; // setzt range auf [from,to] und merkt sich das Ziel
  save_current_edited_label: () => void; // speichert aktuellen range in den Marker mit editing_id
  cancel_current_edit_label: () => void; // beendet den Edit-Modus ohne zu speichern

  std_slider_value: number;
  set_std_slider_value: (n: number) => void;
};

const slider_sliderlist_context = createContext<SliderSliderlistContext | null>(null);

type MarkerAction =
  | { type: 'add'; range_label: RangeLabel }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | { type: 'update'; id: string; from: number; to: number };

function normalize(label: RangeLabel): RangeLabel {
  if (Number.isNaN(label.from) || Number.isNaN(label.to)) return label;
  const from = Math.min(label.from, label.to);
  const to = Math.max(label.from, label.to);
  return { ...label, from, to };
}

function markerReducer(state: RangeLabel[], action: MarkerAction): RangeLabel[] {
  switch (action.type) {
    case 'add': {
      const label = normalize(action.range_label);
      if (!label.id) return state;
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
        if (x.from === from && x.to === to) return x;
        changed = true;
        return { ...x, from, to };
      });
      return changed ? next : state;
    }
    default:
      return state;
  }
}

function overlaps(aFrom: number, aTo: number, bFrom: number, bTo: number) {
  return aFrom < bTo && aTo > bFrom;
}

export function SliderSliderlistProvider({ children }: PropsWithChildren) {
  const [range, set_range] = useState<Range>([0, 0]);
  const [range_marker, dispatch] = useReducer(markerReducer, [] as RangeLabel[]);
  const [editing_id, set_editing_id] = useState<string | null>(null);

  const add_label_rect = useCallback((m: RangeLabel) => dispatch({ type: 'add', range_label: m }), []);
  const remove_label_rect = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const clear_label_rects = useCallback(() => dispatch({ type: 'clear' }), []);

  const start_editing_label = useCallback(
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

  const save_current_edited_label = useCallback(() => {
    if (!editing_id) return;
    dispatch({ type: 'update', id: editing_id, from: range[0], to: range[1] });
    set_editing_id(null);
  }, [editing_id, range]);

  const cancel_current_edit_label = useCallback(() => {
    if (!editing_id) return;
    set_editing_id(null);
  }, [editing_id]);

  const [std_slider_value, set_std_slider_value] = useState(0);

  const value = useMemo<SliderSliderlistContext>(
    () => ({
      range,
      set_slider_label_range: set_range,
      range_marker,
      add_slider_label: add_label_rect,
      remove_slider_label: remove_label_rect,
      clear_slider_label_list: clear_label_rects,
      editing_id,
      start_editing_label: start_editing_label,
      save_current_edited_label: save_current_edited_label,
      cancel_current_edit_label: cancel_current_edit_label,
      std_slider_value,
      set_std_slider_value,
    }),
    [
      range,
      range_marker,
      add_label_rect,
      remove_label_rect,
      clear_label_rects,
      editing_id,
      start_editing_label,
      save_current_edited_label,
      cancel_current_edit_label,

      std_slider_value,
      set_std_slider_value,
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
    return v.set_slider_label_range;
  });
}

export function use_labeled_rect_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_labeled_rect_context must be used within <SliderSliderlistProvider>');
    return v.range_marker;
  });
}

export function use_add_slider_label_ctx() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_add_visited_context must be used within <SliderSliderlistProvider>');
    return v.add_slider_label;
  });
}

export function use_remove_slider_label_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_remove_visited_context must be used within <SliderSliderlistProvider>');
    return v.remove_slider_label;
  });
}

export function use_clear_slider_label_list_ctx() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_clear_visited_context must be used within <SliderSliderlistProvider>');
    return v.clear_slider_label_list;
  });
}

// === Edit-Selector-Hooks ===
export function use_editing_label_id_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_editing_visited_id_context must be used within <SliderSliderlistProvider>');
    return v.editing_id;
  });
}

export function use_start_edit_visited_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_start_edit_visited_context must be used within <SliderSliderlistProvider>');
    return v.start_editing_label;
  });
}

export function use_save_edit_visited_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_save_edit_visited_context must be used within <SliderSliderlistProvider>');
    return v.save_current_edited_label;
  });
}

export function use_cancel_edit_visited_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_cancel_edit_visited_context must be used within <SliderSliderlistProvider>');
    return v.cancel_current_edit_label;
  });
}

export function use_std_slider_value_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_std_slider_value_context must be used within <SliderSliderlistProvider>');
    return v.std_slider_value;
  });
}
export function use_set_std_slider_value_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_set_std_slider_value_context must be used within <SliderSliderlistProvider>');
    return v.set_std_slider_value;
  });
}

export function use_can_save_context() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_can_save_context must be used within <SliderSliderlistProvider>');
    const [fromRaw, toRaw] = v.range;
    const from = Math.min(fromRaw, toRaw);
    const to = Math.max(fromRaw, toRaw);
    const hasOverlap = v.range_marker.some((m) => overlaps(from, to, Math.min(m.from, m.to), Math.max(m.from, m.to)));
    return !hasOverlap;
  });
}
