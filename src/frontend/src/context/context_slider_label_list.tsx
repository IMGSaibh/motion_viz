import { type PropsWithChildren, useCallback, useMemo, useReducer, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { LabelImage } from '@/Assets/label_images';

export type Range = [number, number];

export type LabelCategory = {
  name: string;
  image: LabelImage | null;
};

export type Label = {
  id: string;
  from: number;
  to: number;
  color?: string;
  label?: string;
  category?: string;
  categories: LabelCategory[];
  label_image?: LabelImage | null;
  framecount?: number;
};
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
      category?: string;
      color?: string;
      label_image?: LabelImage | null;
      framecount?: number;
      categories?: LabelCategory[]; // ✅ NEU
    };

type FrameSliderLabellistContext = {
  range: Range;
  set_slider_label_range: (r: Range) => void;

  label: Label[];
  add_slider_label: (m: Label) => void;
  add_rula_cat_2: (rula_cat: LabelCategory[]) => void;
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
  unselected_rula: () => void;

  owas_selected: Record<string, string | null>;
  set_owas_selected: (next: Record<string, string | null>) => void;
  clear_owas_selected: () => void;

  update_label_meta: (
    id: string,
    patch: Partial<Pick<Label, 'label' | 'category' | 'color' | 'label_image' | 'framecount'>>,
  ) => void;
};

const frame_slider_label_list_context = createContext<FrameSliderLabellistContext | null>(null);

function normalize(label: Label): Label {
  if (Number.isNaN(label.from) || Number.isNaN(label.to)) return label;
  const from = Math.min(label.from, label.to);
  const to = Math.max(label.from, label.to);
  return { ...label, from, to };
}

function uid() {
  // Browser: crypto.randomUUID; fallback wenn nicht vorhanden
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = typeof crypto !== 'undefined' ? crypto : null;
  return c?.randomUUID ? c.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function markerReducer(state: Label[], action: MarkerAction): Label[] {
  switch (action.type) {
    case 'add': {
      const label_bar_normalized = normalize(action.label);
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
        if (x.from !== from || x.to !== to) {
          patch.from = from;
          patch.to = to;
          changed = true;
        }
        if (action.label !== undefined && x.label !== action.label) {
          patch.label = action.label;
          changed = true;
        }
        if (action.category !== undefined && x.category !== action.category) {
          patch.category = action.category;
          changed = true;
        }
        if (action.color !== undefined && x.color !== action.color) {
          patch.color = action.color;
          changed = true;
        }
        if (action.label_image !== undefined && x.label_image !== action.label_image) {
          patch.label_image = action.label_image;
          changed = true;
        }
        if (action.framecount !== undefined && x.framecount !== action.framecount) {
          patch.framecount = action.framecount;
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

export function overlaps(aFrom: number, aTo: number, bFrom: number, bTo: number) {
  return aFrom < bTo && aTo > bFrom;
}

function normalizeCategory(c?: string) {
  return (c ?? 'Uncategorized').trim() || 'Uncategorized';
}

function canSaveForRange(args: {
  labels: Label[];
  category?: string;
  from: number;
  to: number;
  ignoreId?: string | null;
}) {
  const fromN = Math.min(args.from, args.to);
  const toN = Math.max(args.from, args.to);
  const targetCategory = normalizeCategory(args.category);

  const hasOverlapSameCategory = args.labels.some((m) => {
    if (args.ignoreId && m.id === args.ignoreId) return false;
    const mCat = normalizeCategory(m.category);
    if (mCat !== targetCategory) return false;
    const mf = Math.min(m.from, m.to);
    const mt = Math.max(m.from, m.to);
    return fromN < mt && toN > mf;
  });

  return !hasOverlapSameCategory;
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

  // const [rula_selected, set_rula_selected] = useState<Record<string, string | null>>({
  //   CAT1: null,
  //   CAT2: null,
  //   CAT3: null,
  // });

  const [rula_selected, set_rula_selected] = useState<Record<string, LabelImage | null>>({
    CAT1: null,
    CAT2: null,
    CAT3: null,
  });

  const [owas_selected, set_owas_selected] = useState<Record<string, string | null>>({
    CAT1: null,
    CAT2: null,
    CAT3: null,
    CAT4: null,
  });

  const add_label_rect = useCallback(
    (label: Label) => {
      const ok = canSaveForRange({
        labels: labels_marker_reducer,
        category: label.category,
        from: label.from,
        to: label.to,
        ignoreId: null,
      });
      if (!ok) return; // blockiert Speichern im Context
      dispatch({ type: 'add', label: label });
    },
    [labels_marker_reducer],
  );

  const add_rula_cat_2 = useCallback(
    (rula_cat: LabelCategory[] | null) => {
      if (!rula_cat || rula_cat.length === 0) return;

      const from = Math.min(range[0], range[1]);
      const to = Math.max(range[0], range[1]);

      const ok = canSaveForRange({
        labels: labels_marker_reducer,
        category: 'RULA',
        from,
        to,
        ignoreId: null,
      });
      if (!ok) return;

      // optional: kompakter Label-String aus den Images
      const image_name = rula_cat.map((c) => c.image?.name ?? '').join(' | ');

      dispatch({
        type: 'add',
        label: {
          id: uid(),
          from,
          to,
          category: 'RULA',
          label: image_name,
          categories: rula_cat,
          label_image: null,
        },
      });
    },
    [range, labels_marker_reducer],
  );

  const remove_label_rect = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const clear_label_rects = useCallback(() => dispatch({ type: 'clear' }), []);

  const start_editing_label = useCallback(
    (id: string) => {
      const m = labels_marker_reducer.find((x) => x.id === id);
      if (!m) return;

      set_range([m.from, m.to]);
      set_editing_id(id);

      //RULA-Label beim Edit korrekt in die Buttons laden
      if (normalizeCategory(m.category) === 'RULA') {
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

      //OWAS-Label beim Edit korrekt in die Buttons laden
      if (normalizeCategory(m.category) === 'OWAS' && typeof m.label === 'string') {
        const parts = m.label.split('|').map((s: string) => s.trim());
        set_owas_selected({
          CAT1: parts[0] ?? null,
          CAT2: parts[1] ?? null,
          CAT3: parts[2] ?? null,
          CAT4: parts[3] ?? null,
        });
      }
    },
    [labels_marker_reducer],
  );

  const save_current_edited_label = useCallback(() => {
    if (!editing_id) return;
    set_rula_selected({ CAT1: null, CAT2: null, CAT3: null });
    const editingMarker = labels_marker_reducer.find((m) => m.id === editing_id);
    const ok = canSaveForRange({
      labels: labels_marker_reducer,
      category: editingMarker?.category,
      from: range[0],
      to: range[1],
      ignoreId: editing_id,
    });

    if (!ok) return;

    const isRula = normalizeCategory(editingMarker?.category) === 'RULA';
    const rulaLabel = `${rula_selected.CAT1 ?? ''} | ${rula_selected.CAT2 ?? ''} | ${rula_selected.CAT3 ?? ''}`;

    dispatch({
      type: 'update',
      id: editing_id,
      from: range[0],
      to: range[1],
      // ✅ beim RULA-Edit auch die Konfiguration speichern
      ...(isRula ? { label: rulaLabel, category: 'RULA' } : {}),
    });

    set_editing_id(null);

    // ✅ optional aber sinnvoll: nach Edit-Ende RULA-Auswahl leeren
    // set_rula_selected({ CAT1: null, CAT2: null, CAT3: null });
    set_owas_selected({ CAT1: null, CAT2: null, CAT3: null, CAT4: null });
  }, [editing_id, range, labels_marker_reducer, rula_selected]);

  const cancel_current_edit_label = useCallback(() => {
    if (!editing_id) return;
    set_editing_id(null);
    set_rula_selected({ CAT1: null, CAT2: null, CAT3: null });
    set_owas_selected({ CAT1: null, CAT2: null, CAT3: null, CAT4: null });
  }, [editing_id]);

  const unselected_rula = useCallback(() => {
    set_rula_selected({ CAT1: null, CAT2: null, CAT3: null });
  }, []);

  const clear_owas_selected = useCallback(() => {
    set_owas_selected({ CAT1: null, CAT2: null, CAT3: null, CAT4: null });
  }, []);

  const update_label_meta = useCallback(
    (id: string, patch: Partial<Pick<Label, 'label' | 'category' | 'color' | 'label_image' | 'framecount'>>) => {
      const current = labels_marker_reducer.find((m) => m.id === id);
      if (!current) return;

      dispatch({
        type: 'update',
        id,
        from: current.from,
        to: current.to,
        label: patch.label,
        category: patch.category,
        color: patch.color,
        label_image: patch.label_image,
        framecount: patch.framecount,
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
      add_rula_cat_2,
      remove_slider_label: remove_label_rect,
      clear_slider_label_list: clear_label_rects,
      editing_id,
      start_editing_label: start_editing_label,
      save_current_edited_label: save_current_edited_label,
      cancel_current_edit_label: cancel_current_edit_label,
      slider_frame: slider_frame,
      set_slider_frame: set_slider_frame,

      rula_selected: rula_selected,
      set_rula_selected: set_rula_selected,
      unselected_rula,
      update_label_meta,

      owas_selected,
      set_owas_selected,
      clear_owas_selected,
    }),
    [
      range,
      labels_marker_reducer,
      add_label_rect,
      remove_label_rect,
      add_rula_cat_2,
      clear_label_rects,
      editing_id,
      start_editing_label,
      save_current_edited_label,
      cancel_current_edit_label,

      slider_frame,
      set_slider_frame,

      rula_selected,
      set_rula_selected,
      unselected_rula,
      update_label_meta,

      owas_selected,
      set_owas_selected,
      clear_owas_selected,
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

export function use_add_rula_cat_ctx() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_add_slider_label_ctx must be used within <FrameSliderLabellistProvider>');
    return v.add_rula_cat_2;
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
      const targetCategory = category ?? editingMarker?.category;

      return canSaveForRange({
        labels: v.label,
        category: targetCategory,
        from: v.range[0],
        to: v.range[1],
        ignoreId: v.editing_id,
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

export function use_unselected_rula_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_unselected_rula_cxt must be used within <FrameSliderLabellistProvider>');
    return v.unselected_rula;
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

export function use_clear_owas_selected_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_clear_owas_selected_cxt must be used within <FrameSliderLabellistProvider>');
    return v.clear_owas_selected;
  });
}
