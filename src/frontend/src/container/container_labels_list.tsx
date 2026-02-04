import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';
import { useCallback } from 'react';
import {
  use_remove_label_cxt,
  use_clear_label_list_ctx,
  use_get_labels_cxt,
} from '@/context/context_slider_label_list';
import { hook_download_labels } from '@/hooks/hook_download_labels';
import { hook_save_labels } from '@/hooks/hook_save_labels';
import { PresenterLabelList } from '@/components/presenter/presenter_label_list';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';

export function ContainerLabelsList() {
  const { frame_count, selected_motion } = use_three_js_engine_ctx();

  const labels = use_get_labels_cxt();
  const remove_label = use_remove_label_cxt();
  const clear_label_list = use_clear_label_list_ctx();
  const { set_owas_selected, set_rula_selected } = use_ergo_methods_cxt();

  const { save_label_list } = hook_save_labels();
  const { download_labels } = hook_download_labels();

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
