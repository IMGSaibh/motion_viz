import { WidgetLabelList } from '@/components/widgets/widget_label_list';
import { Label } from '@/containers/container_bottom_ui';

type Props = {
  slider_lables: Label[];
  slider_list_on_click?: (id: string) => void;
  slider_list_clear_on_click?: () => void;
  save_labels_on_click?: () => void;
};

export function PresenterLabelListUI(props: Props) {
  return (
    <>
      <WidgetLabelList
        slider_labels={props.slider_lables}
        slider_list_on_click={props.slider_list_on_click}
        slider_list_clear_on_click={props.slider_list_clear_on_click}
        save_labels_on_click={props.save_labels_on_click}
      />
    </>
  );
}
