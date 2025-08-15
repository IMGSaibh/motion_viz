import { WidgetStdSlider } from './widgets/widget_std_slider';
import { WidgetLabelSlider } from './widgets/widget_label_slider';

type Props = {
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change: (e: Event, value: number) => void;
  std_slider_on_mouse_move: (e: React.MouseEvent<HTMLSpanElement>) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;

  label_slider_value: [number, number];
  label_slider_framecount: number;
  label_slider_on_change: (e: Event, value: number | number[], active_slider_hndl_idx: number) => void;
  label_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
};

export function WidgetPresenterSlider(props: Props) {
  return (
    <>
      <div className="slider-overlay">
        <div className="slider-widget">
          <label htmlFor="slider-label">
            FRAME: {props.label_slider_value} / {props.label_slider_framecount}
          </label>
          <WidgetLabelSlider
            {...{
              label_slider_value: props.label_slider_value,
              label_slider_framecount: props.label_slider_framecount,
              label_slider_on_change: props.label_slider_on_change,
              label_slider_on_mouse_leave: props.label_slider_on_mouse_leave,
            }}
          />
        </div>
        <div className="slider-widget">
          <label htmlFor="slider-label">
            FRAME: {props.std_slider_value} / {props.std_slider_framecount}
          </label>
          <WidgetStdSlider
            {...{
              std_slider_value: props.std_slider_value,
              std_slider_framecount: props.std_slider_framecount,
              std_slider_reference: props.std_slider_reference,
              std_slider_on_change: props.std_slider_on_change,
              std_slider_on_mouse_move: props.std_slider_on_mouse_move,
              std_slider_on_mouse_leave: props.std_slider_on_mouse_leave,
            }}
          />
        </div>
      </div>
    </>
  );
}
