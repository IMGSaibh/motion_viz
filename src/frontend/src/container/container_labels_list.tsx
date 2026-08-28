import { useCallback } from 'react';

import { PresenterLabelList } from '@/components/presenter/presenter_label_list';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import {
  use_clear_label_list_ctx,
  use_get_labels_cxt,
  use_remove_label_cxt,
} from '@/context/context_slider_label_list';
import { use_snackbar_ctx } from '@/context/context_snackbar';
import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';
import { useDownloadLabels } from '@/hooks/use_download_labels';
import { useSaveLabels } from '@/hooks/use_save_labels';
import { serialize_labels } from '@/api/labels_api';

function get_error_message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function ContainerLabelsList() {
  const { selected_motion } = use_three_js_engine_ctx();
  const labels = use_get_labels_cxt();
  const remove_label = use_remove_label_cxt();
  const clear_label_list = use_clear_label_list_ctx();
  const { set_owas_selected, set_rula_selected } = use_ergo_methods_cxt();
  const { success, warning, error } = use_snackbar_ctx();
  const save_labels = useSaveLabels();
  const labels_download = useDownloadLabels();

  const delete_label_from_list_on_click = useCallback(
    (id: string) => {
      remove_label(id);
    },
    [remove_label],
  );

  const delete_label_list_on_click = useCallback(() => {
    clear_label_list();
    set_rula_selected({
      CAT_UPPERARM: null,
      CAT_LOWERARM: null,
      CAT_WRIST: null,
      CAT_NECK: null,
      CAT_TRUNK: null,
      CAT_LEGS: null,
    });
    set_owas_selected({ CAT_BACK: null, CAT_ARMS: null, CAT_LEGS: null, CAT_LOAD: null });
  }, [clear_label_list, set_owas_selected, set_rula_selected]);

  const save_label_list_on_click = useCallback(async () => {
    if (!selected_motion) return;
    try {
      const response = await save_labels.mutateAsync({
        motion_name: selected_motion,
        labels: serialize_labels(labels),
      });
      if (response.warning) warning(response.warning);
      else success(response.message || 'Labels erfolgreich gespeichert');
    } catch (requestError: unknown) {
      error(get_error_message(requestError, 'Fehler beim Speichern der Labels'));
    }
  }, [error, labels, save_labels, selected_motion, success, warning]);

  const download_labels_on_click = useCallback(async () => {
    try {
      const result = await labels_download.mutateAsync();
      success(`Labels erfolgreich heruntergeladen (${result.file_name})`);
    } catch (requestError: unknown) {
      error(get_error_message(requestError, 'Fehler beim Herunterladen der Labels'));
    }
  }, [error, labels_download, success]);

  return (
    <PresenterLabelList
      lable_list={labels}
      delete_label_from_list_on_click={delete_label_from_list_on_click}
      delete_label_list_on_click={delete_label_list_on_click}
      save_label_list_on_click={save_label_list_on_click}
      download_labels_on_click={download_labels_on_click}
      save_is_pending={save_labels.isPending}
      download_is_pending={labels_download.isPending}
    />
  );
}
