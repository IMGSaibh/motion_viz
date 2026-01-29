import { useCallback } from 'react';
import type { ErgoLabel } from '@/domain/datatypes';
import { use_add_slider_label_ctx } from '@/context/context_slider_label_list';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';

export function ContainerLabelButtons() {
  const add_label = use_add_slider_label_ctx();

  const on_click_save_label = useCallback(
    (label: ErgoLabel) => {
      add_label(label);
    },
    [add_label],
  );

  return <PresenterLabelButtons on_click_save_label={on_click_save_label} />;
}
