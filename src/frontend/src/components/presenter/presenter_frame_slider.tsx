import { WidgetFrameSlider } from '@/components/widgets/widget_frame_slider';
import { WidgetFrameTicks } from '@/components/widgets/widget_frame_ticks';

type Props = {
  std_slider_value: number;
  frame_count: number;
  on_click_frame?: (frame: number) => void;
};

export function PresenterFrameSlider(props: Props) {
  return (
    <>
      <WidgetFrameTicks frame_count={props.frame_count} />
      <WidgetFrameSlider
        std_slider_value={props.std_slider_value}
        frame_count={props.frame_count}
        on_click_frame={props.on_click_frame}
      />
    </>
  );
}
