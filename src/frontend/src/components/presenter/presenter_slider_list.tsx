import { WidgetSliderList } from '@/components/widgets/widget_slider_list';
export type SliderListEntry = { id: string; label: string; value: [number, number]; framecount: number };

type Props = {
  slider_list_items: SliderListEntry[];
  widget_slider_list_on_click?: (id: string) => void;
  handle_widget_slider_list_on_cick_clear_list?: () => void;
};

export function PresenterSliderList(props: Props) {
  return (
    <>
      <WidgetSliderList
        items={props.slider_list_items}
        widget_slider_list_on_click={props.widget_slider_list_on_click}
        handle_widget_slider_list_on_cick_clear_list={props.handle_widget_slider_list_on_cick_clear_list}
      />
    </>
  );
}
