import { useCallback } from 'react';
import type { Label } from '@/domain/datatypes';
import { use_add_slider_label_ctx } from '@/context/context_slider_label_list';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';

export function ContainerLabelButtons() {
  const add_label = use_add_slider_label_ctx();

  const on_click_save_label = useCallback(
    (label: Label) => {
      add_label(label);
    },
    [add_label],
  );

  return <PresenterLabelButtons onClick={on_click_save_label} />;
}
