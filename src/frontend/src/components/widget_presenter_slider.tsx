import { WidgetPlaySlider } from './widgets/widget_play_slider';
import { WidgetLabelSlider } from './widgets/widget_label_slider';

type WidgetPresenterSliderProps = 
{
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change: (e: Event, value: number) => void;
  std_slider_on_mouse_move: (e: React.MouseEvent<HTMLSpanElement>) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  std_slider_thumbnail_css: React.CSSProperties;
  std_slider_thumbnail: string | null;


  label_slider_value: [number, number];
  label_slider_framecount: number;
  label_slider_on_change: (e: Event, value: number | number[], active_slider_hndl_idx: number) => void;
  label_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  label_slider_thumbnail_css:  React.CSSProperties;
  label_slider_thumbnail: string | null;
};

export function WidgetPresenterSlider({
  std_slider_value,
  std_slider_framecount,
  std_slider_reference,
  std_slider_on_change,
  std_slider_on_mouse_move,
  std_slider_on_mouse_leave,
  std_slider_thumbnail_css,
  std_slider_thumbnail,

  label_slider_value,
  label_slider_framecount,
  label_slider_on_change,
  label_slider_on_mouse_leave,
  label_slider_thumbnail_css,
  label_slider_thumbnail,

}: WidgetPresenterSliderProps )
{
  return (
    <>
        <div id="timeline-container">
          <WidgetPlaySlider
            std_slider_value                ={std_slider_value}
            std_slider_framecount           ={std_slider_framecount}
            std_slider_reference            ={std_slider_reference}
            std_slider_on_change            ={std_slider_on_change}
            std_slider_on_mouse_move        ={std_slider_on_mouse_move}
            std_slider_on_mouse_leave       ={std_slider_on_mouse_leave}
            std_slider_thumbnail_css        ={std_slider_thumbnail_css}
            std_slider_thumbnail            ={std_slider_thumbnail}
          />
        </div>
        <div id="timeline-container_2">
          <WidgetLabelSlider
            label_slider_value              ={label_slider_value}
            label_slider_framecount         ={label_slider_framecount}
            label_slider_on_change          ={label_slider_on_change}
            label_slider_on_mouse_leave     ={label_slider_on_mouse_leave}
            label_slider_thumbnail_css      ={label_slider_thumbnail_css}
            label_slider_thumbnail          ={label_slider_thumbnail}
          />
        </div>
    </>
  );
}