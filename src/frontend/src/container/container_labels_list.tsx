import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';
import { useCallback, useEffect } from 'react';
import {
  use_remove_label_cxt,
  use_clear_label_list_ctx,
  use_get_labels_cxt,
  // use_update_label_meta_cxt,
} from '@/context/context_slider_label_list';
import { hook_download_labels } from '@/hooks/hook_download_labels';
import { hook_save_labels } from '@/hooks/hook_save_labels';
import { PresenterLabelList } from '@/components/presenter/presenter_label_list';
import { get_label_all_label_images_rula } from '@/Assets/label_images';
import { use_ergo_methods_context } from '@/context/contex_ergo_methods';

export function ContainerLabelsList() {
  const { frame_count, selected_motion } = use_three_js_engine_ctx();

  const labels = use_get_labels_cxt();
  const remove_label = use_remove_label_cxt();
  // const update_label_meta = use_update_label_meta_cxt();
  const clear_label_list = use_clear_label_list_ctx();
  const { set_owas_selected, set_rula_selected } = use_ergo_methods_context();

  const { save_label_list } = hook_save_labels();

  const { download_labels } = hook_download_labels();

  const label_image_map = get_label_all_label_images_rula();

  // useEffect(() => {
  //   labels.forEach((label) => {
  //     const name = label.button_text && label.button_text.trim() ? label.button_text : `Label_${label.id}`;

  //     // nur patchen, wenn wirklich nötig (reduziert re-renders)
  //     if (label.button_text !== name) {
  //       update_label_meta(label.id, { button_text: name });
  //     }
  //   });
  // }, [labels, frame_count, label_image_map, update_label_meta]);

  useEffect(() => {
    labels.forEach((label) => {
      const name = label.button_text && label.button_text.trim() ? label.button_text : `Label_${label.id}`;
      console.log('==================== im container ====================');
      console.log('label', label);
      console.log('label categories', label.categories);

      // nur patchen, wenn wirklich nötig (reduziert re-renders)
      if (label.button_text !== name) {
        // update_label_meta(label.id, { button_text: name });
      }
    });
  }, [labels, frame_count, label_image_map]);

  const delete_label_from_list_on_click = useCallback(
    (id: string) => {
      remove_label(id);
    },
    [remove_label],
  );

  const delete_label_list_on_click = useCallback(() => {
    clear_label_list();
    set_rula_selected({ CAT1: null, CAT2: null, CAT3: null });
    set_owas_selected({ CAT1: null, CAT2: null, CAT3: null, CAT4: null });
  }, [clear_label_list]);

  const save_label_list_on_click = useCallback(() => {
    if (!selected_motion) return;

    const exported_labels = labels.map((label) => {
      return label;
    });

    save_label_list(selected_motion, labels);
  }, [labels, selected_motion, save_label_list]);

  const download_labels_on_click = useCallback(() => {
    download_labels();
  }, [download_labels]);

  return (
    <PresenterLabelList
      lable_list={labels}
      delete_label_from_list_on_click={delete_label_from_list_on_click}
      delete_label_list_on_click={delete_label_list_on_click}
      save_label_list_on_click={save_label_list_on_click}
      download_labels_on_click={download_labels_on_click}
    />
  );
}
