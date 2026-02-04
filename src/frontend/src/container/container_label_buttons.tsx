import { useCallback } from 'react';
import type { ErgoLabel } from '@/domain/datatypes';
import { use_add_slider_label_ctx } from '@/context/context_slider_label_list';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';
import { use_frame_slider_context } from '@/context/context_frame_slider';
import { use_snackbar_ctx } from '@/context/context_snackbar';

type Props = {
  // TODO: remove logix from widgets to container
  // on_click_save_label?: (label: ErgoLabel) => void;
};

export function ContainerLabelButtons(props: Props) {
  const add_label = use_add_slider_label_ctx();
  const { range } = use_frame_slider_context();
  const { error } = use_snackbar_ctx();

  const on_click_save_label = useCallback(
    (label: ErgoLabel) => {
      if (range[0] == 0 && range[1] == 0) {
        error(`Label range cant be within: [${range[0]}, ${range[1]}]`);
        return;
      }
      add_label(label);
    },
    [add_label, error, range],
  );

  return <PresenterLabelButtons on_click_save_label={on_click_save_label} />;
}
