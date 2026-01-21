import { type PropsWithChildren, useCallback, useMemo, useReducer, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import type { LabelImage, LabelCategory, Label } from '@/domain/datatypes';
import { normalize_category, can_save_for_range } from '@/domain/label_logic';

export type Range = [number, number];

export type RectangleLabelBar = {
  from: number;
  to: number;
  leftPct: number;
  scaleX: number;
};

type MarkerAction =
  | { type: 'add'; label: Label }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | {
      type: 'update';
      id: string;
      from: number;
      to: number;
      label?: string;
      ergo_method?: string;
      color?: string;
      framecount?: number;
      categories?: LabelCategory[];
    };

type FrameSliderLabellistContext = {
  range: Range;
  set_slider_label_range: (r: Range) => void;

  label: Label[];
  add_slider_label: (m: Label) => void;
  remove_slider_label: (id: string) => void;
  clear_slider_label_list: () => void;

  editing_id: string | null;
  start_editing_label: (id: string) => void;
  save_current_edited_label: () => void;
  cancel_current_edit_label: () => void;

  slider_frame: number;
  set_slider_frame: (n: number) => void;

  rula_selected: Record<string, LabelImage | null>;
  set_rula_selected: (next: Record<string, LabelImage | null>) => void;
  unselect_rula: () => void;

  owas_selected: Record<string, LabelImage | null>;
  set_owas_selected: (next: Record<string, LabelImage | null>) => void;
  unselect_owas: () => void;

  update_label_meta: (id: string, patch: Partial<Pick<Label, 'button_text' | 'ergo_method' | 'color'>>) => void;
};

const frame_slider_label_list_context = createContext<FrameSliderLabellistContext | null>(null);

function normalize_label_data(label: Label): Label {
  if (Number.isNaN(label.start_frame) || Number.isNaN(label.end_frame)) return label;
  const from = Math.min(label.start_frame, label.end_frame);
  const to = Math.max(label.start_frame, label.end_frame);
  return { ...label, start_frame: from, end_frame: to };
}

function markerReducer(state: Label[], action: MarkerAction): Label[] {
  switch (action.type) {
    case 'add': {
      const label_bar_normalized = normalize_label_data(action.label);
      if (!label_bar_normalized.id) return state;
      if (state.some((x) => x.id === label_bar_normalized.id)) return state;
      return [...state, label_bar_normalized];
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

        const patch: Partial<Label> = {};
        if (x.start_frame !== from || x.end_frame !== to) {
          patch.start_frame = from;
          patch.end_frame = to;
          changed = true;
        }
        if (action.label !== undefined && x.button_text !== action.label) {
          patch.button_text = action.label;
          changed = true;
        }
        if (action.ergo_method !== undefined && x.ergo_method !== action.ergo_method) {
          patch.ergo_method = action.ergo_method;
          changed = true;
        }
        if (action.color !== undefined && x.color !== action.color) {
          patch.color = action.color;
          changed = true;
        }
        if (action.categories !== undefined && x.categories !== action.categories) {
          patch.categories = action.categories;
          changed = true;
        }

        return Object.keys(patch).length ? { ...x, ...patch } : x;
      });

      return changed ? next : state;
    }
    default:
      return state;
  }
}

export function use_current_label_range_geometry_cxt(frame_count: number): RectangleLabelBar {
  const range = use_range_slider_value_cxt();

  return useMemo(() => {
    const fc = Math.max(0, frame_count ?? 0);
    const maxIdx = Math.max(0, fc - 1);
    const clamp = (n: number) => Math.max(0, Math.min(n, maxIdx));
    const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

    const a = clamp(range[0]);
    const b = clamp(range[1]);
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    const length = Math.max(0, to - from);

    return {
      from,
      to,
      leftPct: pct(from, fc),
      scaleX: fc > 0 ? Math.max(0, length / fc) : 0,
    };
  }, [frame_count, range]);
}

export function FrameSliderLabellistProvider({ children }: PropsWithChildren) {
  const [range, set_range] = useState<Range>([0, 0]);
  const [labels_marker_reducer, dispatch] = useReducer(markerReducer, [] as Label[]);
  const [editing_id, set_editing_id] = useState<string | null>(null);

  const [slider_frame, set_slider_frame] = useState(0);

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

  const add_label_rect = useCallback(
    (label: Label) => {
      const ok = can_save_for_range({
        labels: labels_marker_reducer,
        category: label.ergo_method,
        from: label.start_frame,
        to: label.end_frame,
        ignore_id: null,
      });
      if (!ok) return; // blockiert Speichern im Context
      dispatch({ type: 'add', label: label });
    },
    [labels_marker_reducer],
  );

  const remove_label_rect = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const clear_label_rects = useCallback(() => dispatch({ type: 'clear' }), []);
  const start_editing_label = useCallback(
    (id: string) => {
      const m = labels_marker_reducer.find((x) => x.id === id);
      if (!m) return;

      set_range([m.start_frame, m.end_frame]);
      set_editing_id(id);

      if (normalize_category(m.ergo_method) === 'RULA') {
        const by_name = Object.fromEntries((m.categories ?? []).map((c) => [c.name, c.image])) as Record<
          string,
          LabelImage | null
        >;
        set_rula_selected({
          CAT1: by_name.CAT1 ?? null,
          CAT2: by_name.CAT2 ?? null,
          CAT3: by_name.CAT3 ?? null,
        });
      }

      if (normalize_category(m.ergo_method) === 'OWAS') {
        const by_name = Object.fromEntries((m.categories ?? []).map((c) => [c.name, c.image])) as Record<
          string,
          LabelImage | null
        >;
        set_owas_selected({
          CAT1: by_name.CAT1 ?? null,
          CAT2: by_name.CAT2 ?? null,
          CAT3: by_name.CAT3 ?? null,
          CAT4: by_name.CAT4 ?? null,
        });
      }
    },
    [labels_marker_reducer],
  );

  const save_current_edited_label = useCallback(() => {
    if (!editing_id) return;

    const editingMarker = labels_marker_reducer.find((m) => m.id === editing_id);
    const ok = can_save_for_range({
      labels: labels_marker_reducer,
      category: editingMarker?.ergo_method,
      from: range[0],
      to: range[1],
      ignore_id: editing_id,
    });

    if (!ok) return;

    const isRula = normalize_category(editingMarker?.ergo_method) === 'RULA';
    const rulaLabel = `${rula_selected.CAT1 ?? ''} | ${rula_selected.CAT2 ?? ''} | ${rula_selected.CAT3 ?? ''}`;

    dispatch({
      type: 'update',
      id: editing_id,
      from: range[0],
      to: range[1],
      ...(isRula ? { label: rulaLabel, ergo_method: 'RULA' } : {}),
    });
    console.log('Edited label:', editing_id, range);
    set_editing_id(null);

    set_rula_selected({ CAT1: null, CAT2: null, CAT3: null });
    set_owas_selected({ CAT1: null, CAT2: null, CAT3: null, CAT4: null });
  }, [editing_id, range, labels_marker_reducer, rula_selected]);

  const cancel_current_edit_label = useCallback(() => {
    if (!editing_id) return;
    set_editing_id(null);
    set_rula_selected({ CAT1: null, CAT2: null, CAT3: null });
    set_owas_selected({ CAT1: null, CAT2: null, CAT3: null, CAT4: null });
  }, [editing_id]);

  const unselect_rula = useCallback(() => {
    set_rula_selected({ CAT1: null, CAT2: null, CAT3: null });
  }, []);

  const unselect_owas = useCallback(() => {
    set_owas_selected({ CAT1: null, CAT2: null, CAT3: null, CAT4: null });
  }, []);

  const update_label_meta = useCallback(
    (id: string, patch: Partial<Pick<Label, 'button_text' | 'ergo_method' | 'color'>>) => {
      const current = labels_marker_reducer.find((m) => m.id === id);
      if (!current) return;

      dispatch({
        type: 'update',
        id,
        from: current.start_frame,
        to: current.end_frame,
        label: patch.button_text,
        ergo_method: patch.ergo_method,
        color: patch.color,
      });
    },
    [labels_marker_reducer],
  );

  const frame_slider_label_list_ctx_memo_ctx = useMemo<FrameSliderLabellistContext>(
    () => ({
      range,
      set_slider_label_range: set_range,
      label: labels_marker_reducer,
      add_slider_label: add_label_rect,
      remove_slider_label: remove_label_rect,
      clear_slider_label_list: clear_label_rects,
      editing_id,
      start_editing_label,
      save_current_edited_label,
      cancel_current_edit_label,
      slider_frame: slider_frame,
      set_slider_frame,

      rula_selected,
      set_rula_selected,
      unselect_rula,
      update_label_meta,

      owas_selected,
      set_owas_selected,
      unselect_owas,
    }),
    [
      range,
      labels_marker_reducer,
      add_label_rect,
      remove_label_rect,
      clear_label_rects,
      editing_id,
      start_editing_label,
      save_current_edited_label,
      cancel_current_edit_label,

      slider_frame,
      set_slider_frame,

      rula_selected,
      set_rula_selected,
      unselect_rula,
      update_label_meta,

      owas_selected,
      set_owas_selected,
      unselect_owas,
    ],
  );

  return (
    <frame_slider_label_list_context.Provider value={frame_slider_label_list_ctx_memo_ctx}>
      {children}
    </frame_slider_label_list_context.Provider>
  );
}

/* =================================================================
                            frame slider range ctx  
==================================================================*/

// ===== Selektor-Hooks – minimal re-render =====
export function use_range_slider_value_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_slider_range_cxt must be used within <FrameSliderLabellistProvider>');
    return v.range;
  });
}

export function use_set_range_slider_value_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_set_range_cxt must be used within <FrameSliderLabellistProvider>');
    return v.set_slider_label_range;
  });
}

export function use_range_marker_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_label_cxt must be used within <FrameSliderLabellistProvider>');
    return v.label;
  });
}

/* =================================================================
                            label ctx  
==================================================================*/

export function use_add_slider_label_ctx() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_add_slider_label_ctx must be used within <FrameSliderLabellistProvider>');
    return v.add_slider_label;
  });
}

export function use_remove_label_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_remove_label_cxt must be used within <FrameSliderLabellistProvider>');
    return v.remove_slider_label;
  });
}

export function use_clear_label_list_ctx() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_clear_label_list_ctx must be used within <FrameSliderLabellistProvider>');
    return v.clear_slider_label_list;
  });
}

export function use_editing_label_id_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_editing_label_id_cxt must be used within <FrameSliderLabellistProvider>');
    return v.editing_id;
  });
}

export function use_start_edit_label_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_start_edit_label_cxt must be used within <FrameSliderLabellistProvider>');
    return v.start_editing_label;
  });
}

export function use_save_edit_label_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_save_edit_label_cxt must be used within <FrameSliderLabellistProvider>');
    return v.save_current_edited_label;
  });
}

export function use_cancel_edit_label_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_cancel_edit_label_cxt must be used within <FrameSliderLabellistProvider>');
    return v.cancel_current_edit_label;
  });
}

export function use_can_save_label_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_can_save_label_cxt must be used within <FrameSliderLabellistProvider>');

    return (category?: string) => {
      const editingMarker = v.editing_id ? v.label.find((m) => m.id === v.editing_id) : null;
      const targetCategory = category ?? editingMarker?.ergo_method;

      return can_save_for_range({
        labels: v.label,
        category: targetCategory,
        from: v.range[0],
        to: v.range[1],
        ignore_id: v.editing_id,
      });
    };
  });
}

/* =================================================================
                            frame slider ctx  
==================================================================*/

export function use_slider_frame_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_std_slider_value_cxt must be used within <FrameSliderLabellistProvider>');
    return v.slider_frame;
  });
}
export function use_set_slider_frame_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_set_std_slider_value_cxt must be used within <FrameSliderLabellistProvider>');
    return v.set_slider_frame;
  });
}

/* =================================================================
                            rula buttons ctx  
==================================================================*/

export function use_rula_selected_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_set_rula_selected_cxt must be used within <FrameSliderLabellistProvider>');
    return v.rula_selected;
  });
}

export function use_set_rula_selected_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_set_rula_selected_cxt must be used within <FrameSliderLabellistProvider>');
    return v.set_rula_selected;
  });
}

export function use_unselect_rula_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_unselected_rula_cxt must be used within <FrameSliderLabellistProvider>');
    return v.unselect_rula;
  });
}

export function use_update_label_meta_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_update_label_meta_cxt must be used within <FrameSliderLabellistProvider>');
    return v.update_label_meta;
  });
}

/* =================================================================
                            owas buttons ctx  
==================================================================*/

export function use_owas_selected_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_owas_selected_cxt must be used within <FrameSliderLabellistProvider>');
    return v.owas_selected;
  });
}

export function use_set_owas_selected_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_set_owas_selected_cxt must be used within <FrameSliderLabellistProvider>');
    return v.set_owas_selected;
  });
}

export function use_unselect_owas_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_clear_owas_selected_cxt must be used within <FrameSliderLabellistProvider>');
    return v.unselect_owas;
  });
}
