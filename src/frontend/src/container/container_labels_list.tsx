import { useThreeJSEngine } from '@/context/context_three_js_engine';
import { useCallback, useEffect, useMemo } from 'react';
import {
  use_slider_frame_cxt,
  use_remove_label_cxt,
  use_clear_label_list_ctx,
  use_range_marker_cxt,
  use_update_label_meta_cxt,
} from '@/context/context_slider_label_list';
import { hook_save_labels_to_json } from '@/hooks/hook_upload_motion_files';
import { use_snackbar_ctx } from '@/context/context_snackbar';
import { PresenterLabelList } from '@/components/presenter/presenter_label_list';
import { get_label_all_label_images_rula } from '@/Assets/label_images';

export function ContainerLabelsList() {
  const { frame_count, selected_motion } = useThreeJSEngine();

  const labels = use_range_marker_cxt();
  const update_label_meta = use_update_label_meta_cxt();

  const hook_save_labels = hook_save_labels_to_json();
  const remove_label = use_remove_label_cxt();
  const clear_label_list = use_clear_label_list_ctx();

  const frame = use_slider_frame_cxt();
  const label_image_map = get_label_all_label_images_rula();

  const { success, error } = use_snackbar_ctx();

  // ✅ Sync: framecount + label_image (und fallback label) in den Context schreiben
  useEffect(() => {
    const fc = Math.max(0, frame_count ?? 0);

    labels.forEach((m) => {
      const name = m.label && m.label.trim() ? m.label : `Label_${m.id}`;
      const img = label_image_map.get(name) ?? null;

      // nur patchen, wenn wirklich nötig (reduziert re-renders)
      if (m.framecount !== fc || m.label_image !== img || m.label !== name) {
        update_label_meta(m.id, { framecount: fc, label_image: img, label: name });
      }
    });
  }, [labels, frame_count, label_image_map, update_label_meta]);

  const delete_label_from_list_on_click = useCallback(
    (id: string) => {
      remove_label(id);
    },
    [remove_label],
  );

  const clear_label_list_on_click = useCallback(() => {
    clear_label_list();
  }, [clear_label_list]);

  const current_label_image = useMemo(() => {
    const hit = labels.find((m) => {
      const from = Math.min(m.from, m.to);
      const to = Math.max(m.from, m.to);
      return frame >= from && frame < to;
    });
    return hit?.label_image ?? null;
  }, [labels, frame]);

  const on_save_click = useCallback(() => {
    if (!selected_motion) return;

    const labels_map = labels.map((m) => {
      const startframe = Math.min(m.from, m.to);
      const endframe = Math.max(m.from, m.to);
      return { startframe, endframe };
    });

    const motion_name = (selected_motion.split(/[/\\]/).pop() ?? selected_motion).trim();

    hook_save_labels.mutate(
      { motion_name, labels: labels_map },
      {
        onSuccess: (respond: any) => {
          if (respond.message) success(respond.message);
          if (respond.warning) error(respond.warning);
        },
        onError: (err: any) => error(err?.message || 'Saving labels failed'),
      },
    );
  }, [labels, selected_motion, hook_save_labels, success, error]);

  return (
    <PresenterLabelList
      lables_list={labels}
      delete_label_from_list_on_click={delete_label_from_list_on_click}
      slider_list_clear_on_click={clear_label_list_on_click}
      save_labels_on_click={on_save_click}
      label_image={current_label_image}
    />
  );
}
