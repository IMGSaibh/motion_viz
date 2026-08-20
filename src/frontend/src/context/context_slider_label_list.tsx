import { type PropsWithChildren, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import type { LabelImage, ErgoLabel } from '@/domain/datatypes';
import { normalize_category, can_save_for_range } from '@/domain/label_logic';
import type { MarkerAction } from '@/domain/datatypes';
import type { RectangleLabelBar } from '@/domain/datatypes';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import { use_frame_slider_context } from '@/context/context_frame_slider';

type FrameSliderLabelListContext = {
  ergo_labels: ErgoLabel[];
  add_slider_label: (m: ErgoLabel) => void;
  remove_slider_label: (id: string) => void;
  clear_slider_label_list: () => void;

  editing_id: string | null;
  start_editing_label: (id: string) => void;
  save_current_edited_label: () => void;
  cancel_current_edit_label: () => void;
};

const frame_slider_label_list_context = createContext<FrameSliderLabelListContext | null>(null);

export function FrameSliderLabellistProvider({ children }: PropsWithChildren) {
  const { range, set_range } = use_frame_slider_context();
  const [ergo_labels, dispatch] = useReducer(markerReducer, [] as ErgoLabel[]);
  const [editing_id, set_editing_id] = useState<string | null>(null);
  const { set_rula_selected, rula_selected, set_owas_selected, owas_selected } = use_ergo_methods_cxt();

  const add_slider_label = useCallback(
    (label: ErgoLabel) => {
      const ok = can_save_for_range({
        labels: ergo_labels,
        category: label.ergo_method,
        from: label.start_frame,
        to: label.end_frame,
        ignore_id: null,
      });
      console.log('can_save_for_range result:', label);
      if (!ok) return; // blockiert Speichern im Context
      dispatch({ type: 'add', label: label });
    },
    [ergo_labels],
  );
  const remove_label_rect = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const clear_label_rects = useCallback(() => dispatch({ type: 'clear' }), []);
  const start_editing_label = useCallback(
    (id: string) => {
      const label = ergo_labels.find((x) => x.id === id);
      if (!label) return;

      set_range([label.start_frame, label.end_frame]);
      set_editing_id(id);

      if (normalize_category(label.ergo_method) === 'RULA') {
        const by_name = Object.fromEntries((label.categories ?? []).map((c) => [c.name, c.image])) as Record<
          string,
          LabelImage | null
        >;
        //console.log('by_name:', by_name);
        set_rula_selected({
          CAT_UA: by_name.CAT_UA ?? null,
          CAT_LA: by_name.CAT_LA ?? null,
          CAT_W: by_name.CAT_W ?? null,
          CAT_N: by_name.CAT_N ?? null,
          CAT_T: by_name.CAT_T ?? null,
          CAT_L: by_name.CAT_L ?? null,

        });
      }

      if (normalize_category(label.ergo_method) === 'OWAS') {
        const by_name = Object.fromEntries((label.categories ?? []).map((c) => [c.name, c.image])) as Record<
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
    [ergo_labels],
  );

  const save_current_edited_label = useCallback(() => {
    if (!editing_id) return;

    const editingLabel = ergo_labels.find((m) => m.id === editing_id);
    if (!editingLabel) return;

    const ok = can_save_for_range({
      labels: ergo_labels,
      category: editingLabel.ergo_method,
      from: range[0],
      to: range[1],
      ignore_id: editing_id,
    });
    if (!ok) return;

    const norm = normalize_category(editingLabel.ergo_method);

    const categories =
      norm === 'RULA'
        ? [
            { name: 'CAT_UA', image: rula_selected.CAT_UA ?? null, element_id: null },
            { name: 'CAT_LA', image: rula_selected.CAT_LA ?? null, element_id: null },
            { name: 'CAT_W', image: rula_selected.CAT_W ?? null, element_id: null },
            { name: 'CAT_N', image: rula_selected.CAT_N ?? null, element_id: null },
            { name: 'CAT_T', image: rula_selected.CAT_T ?? null, element_id: null },
            { name: 'CAT_L', image: rula_selected.CAT_L ?? null, element_id: null },
          ]
        : norm === 'OWAS'
          ? [
              { name: 'CAT1', image: owas_selected.CAT1 ?? null, element_id: null },
              { name: 'CAT2', image: owas_selected.CAT2 ?? null, element_id: null },
              { name: 'CAT3', image: owas_selected.CAT3 ?? null, element_id: null },
              { name: 'CAT4', image: owas_selected.CAT4 ?? null, element_id: null },
            ]
          : undefined;

    const rulaLabel =
      norm === 'RULA'
        //? `${rula_selected.CAT1 ?? ''} | ${rula_selected.CAT2 ?? ''} | ${rula_selected.CAT3 ?? ''}`
        ? `${rula_selected.CAT_UA ?? ''} | ${rula_selected.CAT_LA ?? ''} | ${rula_selected.CAT_W ?? ''} 
        | ${rula_selected.CAT_N ?? ''} | ${rula_selected.CAT_T ?? ''} | ${rula_selected.CAT_L ?? ''}`
        : undefined;
          
    dispatch({
      type: 'update',
      id: editing_id,
      from: range[0],
      to: range[1],
      
      ...(rulaLabel !== undefined ? { label: rulaLabel, ergo_method: 'RULA' } : {}),
      ...(categories !== undefined ? { categories } : {}),
       
    });
    console.log('label id', editing_id);
    console.log('Saved edited label', ergo_labels);

    set_editing_id(null);
    set_rula_selected({ CAT_UA: null, CAT_LA: null, CAT_W: null, CAT_N: null, CAT_T: null, CAT_L: null });
    set_owas_selected({ CAT1: null, CAT2: null, CAT3: null, CAT4: null });
  }, [editing_id, range, ergo_labels, rula_selected, owas_selected]);

  const cancel_current_edit_label = useCallback(() => {
    if (!editing_id) return;
    set_editing_id(null);
    set_rula_selected({ CAT_UA: null, CAT_LA: null, CAT_W: null, CAT_N: null, CAT_T: null, CAT_L: null });
  }, [editing_id]);

  const value = useMemo<FrameSliderLabelListContext>(
    () => ({
      ergo_labels,
      add_slider_label,
      remove_slider_label: remove_label_rect,
      clear_slider_label_list: clear_label_rects,
      editing_id,
      start_editing_label,
      save_current_edited_label,
      cancel_current_edit_label,
    }),
    [
      ergo_labels,
      add_slider_label,
      remove_label_rect,
      clear_label_rects,
      editing_id,
      start_editing_label,
      save_current_edited_label,
      cancel_current_edit_label,
    ],
  );

  return <frame_slider_label_list_context.Provider value={value}>{children}</frame_slider_label_list_context.Provider>;
}

function normalize_label_data(label: ErgoLabel): ErgoLabel {
  if (Number.isNaN(label.start_frame) || Number.isNaN(label.end_frame)) return label;
  const from = Math.min(label.start_frame, label.end_frame);
  const to = Math.max(label.start_frame, label.end_frame);
  return { ...label, start_frame: from, end_frame: to };
}

function markerReducer(labels: ErgoLabel[], action: MarkerAction): ErgoLabel[] {
  switch (action.type) {
    case 'add': {
      
      const label_bar_normalized = normalize_label_data(action.label);
      if (!label_bar_normalized.id) return labels;
      if (labels.some((x) => x.id === label_bar_normalized.id)) return labels;
      return [...labels, label_bar_normalized];
    }
    case 'remove': {
      const next = labels.filter((x) => x.id !== action.id);
      return next.length === labels.length ? labels : next;
    }
    case 'clear': {
      return labels.length === 0 ? labels : [];
    }
    case 'update': {
      const from = Math.min(action.from, action.to);
      const to = Math.max(action.from, action.to);
      let changed = false;

      console.log("->", action)

      const next = labels.map((x) => {
        if (x.id !== action.id) return x;

        const patch: Partial<ErgoLabel> = {};
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

      return changed ? next : labels;
    }
    default:
      return labels;
  }
}

export function use_current_label_range_geometry_cxt(frame_count: number): RectangleLabelBar {
  const { range } = use_frame_slider_context();

  return useMemo(() => {
    const fc = Math.max(0, frame_count ?? 0);

    if (fc === 0) {
      return { from: 0, to: 0, leftPct: 0, scaleX: 0 };
    }

    const maxIdx = fc - 1;
    const clamp = (n: number) => Math.max(0, Math.min(n, maxIdx));

    const a = clamp(range[0]);
    const b = clamp(range[1]);

    const from = Math.min(a, b);
    const to = Math.max(a, b);

    const framesCovered = Math.max(1, to - from + 1);

    return {
      from,
      to,
      leftPct: (from / fc) * 100,
      scaleX: Math.min(1, framesCovered / fc),
    };
  }, [frame_count, range]);
}

/* =================================================================
                            frame slider range ctx  
==================================================================*/

export function use_get_labels_cxt() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_get_labels_cxt must be used within <FrameSliderLabellistProvider>');
    return v.ergo_labels;
  });
}

/* =================================================================
                            label ctx  
==================================================================*/

export function use_add_slider_label_ctx() {
  
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_add_slider_label_ctx must be used within <FrameSliderLabellistProvider>');
    console.log('use_add_slider_label_ctx v:', v);
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
      const editingMarker = v.editing_id ? v.ergo_labels.find((m) => m.id === v.editing_id) : null;
      const targetCategory = category ?? editingMarker?.ergo_method;
      const { range, set_range } = use_frame_slider_context();
      return can_save_for_range({
        labels: v.ergo_labels,
        category: targetCategory,
        from: range[0],
        to: range[1],
        ignore_id: v.editing_id,
      });
    };
  });
}
