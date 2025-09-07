import { useCallback, useRef, useMemo } from 'react';
import { useThreeJSEngine } from '@/context/context_three_js_engine';
import { PresenterSliderList } from '@/components/presenter/presenter_slider_list';
import { hook_save_labels_to_json } from '@/hooks/hook_upload_motion_files';

import { use_remove_label_cxt, use_clear_label_list_ctx, use_label_cxt } from '@/context/context_slider_label_list';
import { use_snackbar_ctx } from '@/context/context_snackbar';

export type Label = { id: string; label: string; range: [number, number]; framecount: number };
export const slider_lables: Label[] = [];

export function ContainerSliderList() {
  const { frame_count, selected_motion } = useThreeJSEngine();
  const markers = use_label_cxt();
  const { success, error } = use_snackbar_ctx();

  const slider_label_id = useRef<number>(slider_lables.length + 1);
  const hook_save_labels = hook_save_labels_to_json();

  const remove_slider_label = use_remove_label_cxt();
  const clear_slider_label_list = use_clear_label_list_ctx();

  const slider_list_on_click = useCallback(
    (id: string) => {
      remove_slider_label(id);
    },
    [remove_slider_label],
  );

  const slider_list_on_click_clear_list = useCallback(() => {
    slider_label_id.current = 1;
    clear_slider_label_list();
  }, [clear_slider_label_list]);

  const slider_labels: Label[] = useMemo(() => {
    const fc = Math.max(0, frame_count ?? 0);
    return markers.map((m) => ({
      id: m.id,
      label: m.label ?? `Label_${m.id}`,
      range: [m.from, m.to] as [number, number],
      framecount: fc,
    }));
  }, [markers, frame_count]);

  // saves lable list to backend
  const on_save_click = useCallback(() => {
    if (!selected_motion) return;

    const labels = markers.map((m) => {
      const startframe = Math.min(m.from, m.to);
      const endframe = Math.max(m.from, m.to);
      return { startframe, endframe };
    });

    const motion_name = (selected_motion.split(/[/\\]/).pop() ?? selected_motion).trim();

    // TODO: check hook and api function to implement them with same convention
    hook_save_labels.mutate(
      { motion_name, labels },
      {
        onSuccess: (respond: any) => {
          if (respond.message) success(respond.message);
          if (respond.warning) error(respond.warning);
        },
        onError: (err: any) => error(err?.message || 'Saving labels failed'),
      },
    );
  }, [markers, selected_motion, hook_save_labels]);

  return (
    <>
      <PresenterSliderList
        slider_lables={slider_labels}
        slider_list_on_click={slider_list_on_click}
        slider_list_clear_on_click={slider_list_on_click_clear_list}
        save_labels_on_click={on_save_click}
      />
    </>
  );
}
