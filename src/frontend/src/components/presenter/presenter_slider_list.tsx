import { WidgetSliderList } from '@/components/widgets/widget_slider_list';
import { Label } from '@/containers/container_label_list';

type Props = {
  slider_lables: Label[];
  slider_list_on_click?: (id: string) => void;
  slider_list_clear_on_click?: () => void;
  save_labels_on_click?: () => void;
};

export function PresenterSliderList(props: Props) {
  return (
    <>
      <WidgetSliderList
        slider_labels={props.slider_lables}
        slider_list_on_click={props.slider_list_on_click}
        slider_list_clear_on_click={props.slider_list_clear_on_click}
        save_labels_on_click={props.save_labels_on_click}
      />
    </>
  );
}
