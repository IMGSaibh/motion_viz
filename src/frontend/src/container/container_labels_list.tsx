import { useThreeJSEngine } from '@/context/context_three_js_engine';
import { useRef, useCallback, useMemo } from 'react';
import {
  use_slider_frame_cxt,
  use_remove_label_cxt,
  use_clear_label_list_ctx,
  use_range_marker_cxt,
} from '@/context/context_slider_label_list';
import { hook_save_labels_to_json } from '@/hooks/hook_upload_motion_files';
import { use_snackbar_ctx } from '@/context/context_snackbar';
import { PresenterLabelList } from '@/components/presenter/presenter_label_list';
import { LabelImage, get_label_all_label_images_rula } from '@/Assets/label_images';

export type Label = {
  id: string;
  label: string;
  label_image: LabelImage | null;
  range: [number, number];
  framecount: number;
  category: string;
};
export const lable_list: Label[] = [];

export function ContainerLabelsList() {
  const { frame_count, selected_motion } = useThreeJSEngine();

  const markers = use_range_marker_cxt();
  const label_id = useRef<number>(lable_list.length + 1);
  const hook_save_labels = hook_save_labels_to_json();
  const remove_label = use_remove_label_cxt();
  const clear_label_list = use_clear_label_list_ctx();

  const range_markers = use_range_marker_cxt();
  const frame = use_slider_frame_cxt();
  const label_image_map = get_label_all_label_images_rula();

  const { success, error } = use_snackbar_ctx();

  const label_list_on_click = useCallback(
    (id: string) => {
      remove_label(id);
    },
    [remove_label],
  );

  const clear_label_list_on_click = useCallback(() => {
    label_id.current = 1;
    clear_label_list();
  }, [clear_label_list]);

  const label_list: Label[] = useMemo(() => {
    const fc = Math.max(0, frame_count ?? 0);
    return markers.map((m) => {
      const from = Math.min(m.from, m.to);
      const to = Math.max(m.from, m.to);
      const name = m.label ? m.label : `Label_${m.id}`;
      const img = label_image_map.get(name) ?? null;

      return {
        id: m.id,
        label: name,
        label_image: img,
        range: [from, to] as [number, number],
        framecount: fc,
        category: m.category || 'Uncategorized',
      };
    });
  }, [markers, frame_count, label_image_map]);

  const current_label_image = useMemo(() => {
    const hit = range_markers.find((m) => {
      const from = Math.min(m.from, m.to);
      const to = Math.max(m.from, m.to);
      return frame >= from && frame < to;
    });
    if (!hit?.label) return null;
    return label_image_map.get(hit.label) ?? null;
  }, [range_markers, frame, label_image_map]);

  const on_save_click = useCallback(() => {
    if (!selected_motion) return;

    const labels_map = markers.map((m) => {
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
  }, [markers, selected_motion, hook_save_labels, success, error]);

  return (
    <>
      <PresenterLabelList
        lables_list={label_list}
        slider_list_on_click={label_list_on_click}
        slider_list_clear_on_click={clear_label_list_on_click}
        save_labels_on_click={on_save_click}
        label_image={current_label_image}
      />
    </>
  );
}
