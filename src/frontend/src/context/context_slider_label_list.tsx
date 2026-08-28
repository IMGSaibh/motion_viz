import { type PropsWithChildren, useCallback, useMemo, useReducer, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import type { ErgoLabel, LabelCategory, LabelImage } from '@/domain/datatypes';
import { can_save_for_range } from '@/domain/label_logic';
import type { MarkerAction } from '@/domain/datatypes';
import type { RectangleLabelBar } from '@/domain/datatypes';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import { use_frame_slider_context } from '@/context/context_frame_slider';

type FrameSliderLabelListContext = {
  ergo_labels: ErgoLabel[];
  add_slider_label: (m: ErgoLabel) => void;
  load_slider_labels_for_file: (labels: ErgoLabel[]) => void;
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
      dispatch({ type: 'add', label: label });
    },
    [ergo_labels],
  );
  const remove_label_rect = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const load_slider_labels_for_file = useCallback((labels: ErgoLabel[]) => dispatch({ type: 'replace', labels }), []);
  const clear_label_rects = useCallback(() => dispatch({ type: 'clear' }), []);
  const start_editing_label = useCallback(
    (id: string) => {
      const label = ergo_labels.find((x) => x.id === id);
      if (!label) return;

      set_range([label.start_frame, label.end_frame]);
      set_editing_id(id);

      if (label.ergo_method === 'RULA') {
        const by_name = Object.fromEntries(
          (label.categories ?? []).map((c) => [c.name, c.features[0]?.image]),
        ) as Record<string, LabelImage | null>;
        set_rula_selected({
          CAT_UPPERARM: by_name.CAT_UPPERARM ?? null,
          CAT_LOWERARM: by_name.CAT_LOWERARM ?? null,
          CAT_WRIST: by_name.CAT_WRIST ?? null,
          CAT_NECK: by_name.CAT_NECK ?? null,
          CAT_TRUNK: by_name.CAT_TRUNK ?? null,
          CAT_LEGS: by_name.CAT_LEGS ?? null,
        });
      }

      if (label.ergo_method === 'OWAS') {
        const by_name = Object.fromEntries(
          label.categories.map((category) => [category.name, category.features[0]?.image]),
        ) as Record<string, LabelImage | null>;
        set_owas_selected({
          CAT_BACK: by_name.CATEGORY_1 ?? null,
          CAT_ARMS: by_name.CATEGORY_2 ?? null,
          CAT_LEGS: by_name.CATEGORY_3 ?? null,
          CAT_LOAD: by_name.CATEGORY_4 ?? null,
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
      id: editing_id,
    });
    if (!ok) return;

    const createCategory = (id: number, name: string, image: LabelImage | null): LabelCategory | null =>
      image
        ? {
            id,
            name,
            features: [{ id: 1, name: image.name, image }],
          }
        : null;

    const categories: LabelCategory[] | undefined =
      editingLabel.ergo_method === 'RULA'
        ? [
            createCategory(1, 'CAT_UPPERARM', rula_selected.CAT_UPPERARM),
            createCategory(2, 'CAT_LOWERARM', rula_selected.CAT_LOWERARM),
            createCategory(3, 'CAT_WRIST', rula_selected.CAT_WRIST),
            createCategory(4, 'CAT_NECK', rula_selected.CAT_NECK),
            createCategory(5, 'CAT_TRUNK', rula_selected.CAT_TRUNK),
            createCategory(6, 'CAT_LEGS', rula_selected.CAT_LEGS),
          ].filter((category): category is LabelCategory => category !== null)
        : editingLabel.ergo_method === 'OWAS'
          ? [
              createCategory(1, 'CAT_BACK', owas_selected.CAT_BACK),
              createCategory(2, 'CAT_ARMS', owas_selected.CAT_ARMS),
              createCategory(3, 'CAT_LEGS', owas_selected.CAT_LEGS),
              createCategory(4, 'CAT_LOAD', owas_selected.CAT_LOAD),
            ].filter((category): category is LabelCategory => category !== null)
          : undefined;

    dispatch({
      type: 'update',
      id: editing_id,
      from: range[0],
      to: range[1],
      ergo_method: editingLabel.ergo_method,
      ...(categories !== undefined ? { categories } : {}),
    });

    set_editing_id(null);
    set_rula_selected({
      CAT_UPPERARM: null,
      CAT_LOWERARM: null,
      CAT_WRIST: null,
      CAT_NECK: null,
      CAT_TRUNK: null,
      CAT_LEGS: null,
    });
    set_owas_selected({ CAT_BACK: null, CAT_ARMS: null, CAT_LEGS: null, CAT_LOAD: null });
  }, [editing_id, range, ergo_labels, rula_selected, owas_selected]);

  const cancel_current_edit_label = useCallback(() => {
    if (!editing_id) return;
    set_editing_id(null);
    set_rula_selected({
      CAT_UPPERARM: null,
      CAT_LOWERARM: null,
      CAT_WRIST: null,
      CAT_NECK: null,
      CAT_TRUNK: null,
      CAT_LEGS: null,
    });
  }, [editing_id]);

  const value = useMemo<FrameSliderLabelListContext>(
    () => ({
      ergo_labels,
      add_slider_label,
      load_slider_labels_for_file,
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
      load_slider_labels_for_file,
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
    case 'replace': {
      return action.labels.map(normalize_label_data);
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

      const next = labels.map((x) => {
        if (x.id !== action.id) return x;

        const patch: Partial<ErgoLabel> = {};
        if (x.start_frame !== from || x.end_frame !== to) {
          patch.start_frame = from;
          patch.end_frame = to;
          changed = true;
        }
        if (action.ergo_method !== undefined && x.ergo_method !== action.ergo_method) {
          patch.ergo_method = action.ergo_method;
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
    return v.add_slider_label;
  });
}

export function use_load_slider_labels_for_file_ctx() {
  return useContextSelector(frame_slider_label_list_context, (v) => {
    if (!v) throw new Error('use_load_slider_labels_for_file_ctx must be used within <FrameSliderLabellistProvider>');
    return v.load_slider_labels_for_file;
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
        id: v.editing_id,
      });
    };
  });
}
