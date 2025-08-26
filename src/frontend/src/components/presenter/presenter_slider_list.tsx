import { WidgetSliderList } from '@/components/widgets/widget_slider_list';
import { SliderLabel } from '@/containers/container_slider_list';

type Props = {
  slider_lables: SliderLabel[];
  slider_list_on_click?: (id: string) => void;
  slider_list_clear_on_click?: () => void;
};

export function PresenterSliderList(props: Props) {
  return (
    <>
      <WidgetSliderList
        slider_labels={props.slider_lables}
        slider_list_on_click={props.slider_list_on_click}
        slider_list_clear_on_click={props.slider_list_clear_on_click}
      />
    </>
  );
}
