import { type PropsWithChildren, useCallback, useMemo, useReducer, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

export type Range = [number, number];
export type Label_CTX = { id: string; from: number; to: number; color?: string; label?: string; category?: string };

type SliderSliderlistContext = {
  range: Range;
  set_slider_label_range: (r: Range) => void;

  label_CTX: Label_CTX[];
  add_slider_label: (m: Label_CTX) => void;
  remove_slider_label: (id: string) => void;
  clear_slider_label_list: () => void;

  editing_id: string | null;
  start_editing_label: (id: string) => void;
  save_current_edited_label: () => void;
  cancel_current_edit_label: () => void;

  std_slider_value: number;
  set_std_slider_value: (n: number) => void;
};

const slider_sliderlist_context = createContext<SliderSliderlistContext | null>(null);

type MarkerAction =
  | { type: 'add'; range_bar: Label_CTX }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | { type: 'update'; id: string; from: number; to: number };

function normalize(range_bar: Label_CTX): Label_CTX {
  if (Number.isNaN(range_bar.from) || Number.isNaN(range_bar.to)) return range_bar;
  const from = Math.min(range_bar.from, range_bar.to);
  const to = Math.max(range_bar.from, range_bar.to);
  return { ...range_bar, from, to };
}

function markerReducer(state: Label_CTX[], action: MarkerAction): Label_CTX[] {
  switch (action.type) {
    case 'add': {
      const range_bar_normalized = normalize(action.range_bar);
      if (!range_bar_normalized.id) return state;
      if (state.some((x) => x.id === range_bar_normalized.id)) return state;
      return [...state, range_bar_normalized];
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

export function SliderLabelListProvider({ children }: PropsWithChildren) {
  const [range, set_range] = useState<Range>([0, 0]);
  const [label_ctx, dispatch] = useReducer(markerReducer, [] as Label_CTX[]);
  const [editing_id, set_editing_id] = useState<string | null>(null);

  const add_label_rect = useCallback((m: Label_CTX) => dispatch({ type: 'add', range_bar: m }), []);
  const remove_label_rect = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const clear_label_rects = useCallback(() => dispatch({ type: 'clear' }), []);

  const start_editing_label = useCallback(
    (id: string) => {
      const m = label_ctx.find((x) => x.id === id);
      if (!m) return;
      set_range([m.from, m.to]);
      set_editing_id(id);
    },
    [label_ctx],
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
      label_CTX: label_ctx,
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
      label_ctx,
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
export function use_range_slider_value_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_slider_range_cxt must be used within <SliderSliderlistProvider>');
    return v.range;
  });
}

export function use_set_range_slider_value_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_set_range_cxt must be used within <SliderSliderlistProvider>');
    return v.set_slider_label_range;
  });
}

export function use_range_marker_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_label_cxt must be used within <SliderSliderlistProvider>');
    return v.label_CTX;
  });
}

export function use_add_label_ctx() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_add_label_ctx must be used within <SliderSliderlistProvider>');
    return v.add_slider_label;
  });
}

export function use_remove_label_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_remove_label_cxt must be used within <SliderSliderlistProvider>');
    return v.remove_slider_label;
  });
}

export function use_clear_label_list_ctx() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_clear_label_list_ctx must be used within <SliderSliderlistProvider>');
    return v.clear_slider_label_list;
  });
}

export function use_editing_label_id_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_editing_label_id_cxt must be used within <SliderSliderlistProvider>');
    return v.editing_id;
  });
}

export function use_start_edit_label_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_start_edit_label_cxt must be used within <SliderSliderlistProvider>');
    return v.start_editing_label;
  });
}

export function use_save_edit_label_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_save_edit_label_cxt must be used within <SliderSliderlistProvider>');
    return v.save_current_edited_label;
  });
}

export function use_cancel_edit_label_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_cancel_edit_label_cxt must be used within <SliderSliderlistProvider>');
    return v.cancel_current_edit_label;
  });
}

export function use_std_slider_value_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_std_slider_value_cxt must be used within <SliderSliderlistProvider>');
    return v.std_slider_value;
  });
}
export function use_set_std_slider_value_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_set_std_slider_value_cxt must be used within <SliderSliderlistProvider>');
    return v.set_std_slider_value;
  });
}

export function use_can_save_label_cxt() {
  return useContextSelector(slider_sliderlist_context, (v) => {
    if (!v) throw new Error('use_can_save_label_cxt must be used within <SliderSliderlistProvider>');

    return (category?: string) => {
      const [fromRaw, toRaw] = v.range;
      const from = Math.min(fromRaw, toRaw);
      const to = Math.max(fromRaw, toRaw);

      const editingMarker = v.editing_id ? v.label_CTX.find((m) => m.id === v.editing_id) : null;
      const targetCategory = (category ?? editingMarker?.category ?? 'Uncategorized').trim() || 'Uncategorized';

      const has_overlap_same_category = v.label_CTX.some((m) => {
        if (editingMarker && m.id === editingMarker.id) return false; // ignore own marker
        const mCat = (m.category ?? 'Uncategorized').trim() || 'Uncategorized';
        if (mCat !== targetCategory) return false; // check only same category
        const mf = Math.min(m.from, m.to);
        const mt = Math.max(m.from, m.to);
        return from < mt && to > mf;
      });

      return !has_overlap_same_category;
    };
  });
}
