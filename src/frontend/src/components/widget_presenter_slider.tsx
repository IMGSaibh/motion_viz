import { WidgetPlaySlider } from './widgets/widget_play_slider';
import { WidgetLabelSlider } from './widgets/widget_label_slider';

type WidgetPresenterSliderProps = 
{
  std_slider_reference: React.RefObject<HTMLInputElement | null>;
  std_slider_on_mouse_move: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  std_slider_thumbnail_css: React.CSSProperties;
  std_slider_thumbnail: string | null;


  value: [number, number];
  labelslider_framecount: number;
  labelslider_on_change: (e: Event, newValue: number | number[], activeThumbIdx: number) => void;
  labelslider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  labelslider_thumbnail_css:  React.CSSProperties;
  labelslider_thumbnail: string | null;
};

export function WidgetPresenterSlider({
  std_slider_reference,
  std_slider_on_mouse_move,
  std_slider_on_mouse_leave,
  std_slider_thumbnail_css,
  std_slider_thumbnail,

  value,
  labelslider_framecount,
  labelslider_on_change,
  labelslider_on_mouse_leave,
  labelslider_thumbnail_css,
  labelslider_thumbnail,

}: WidgetPresenterSliderProps )
{
  return (
    <>
        <div id="timeline-container">
          <WidgetPlaySlider
            std_slider_reference            ={std_slider_reference}
            std_slider_on_mouse_move        ={std_slider_on_mouse_move}
            std_slider_on_mouse_leave       ={std_slider_on_mouse_leave}
            std_slider_thumbnail_css        ={std_slider_thumbnail_css}
            std_slider_thumbnail            ={std_slider_thumbnail}
          />
        </div>
        <div id="timeline-container_2">
          <WidgetLabelSlider
            value                           ={value}
            labelslider_framecount          ={labelslider_framecount}
            labelslider_on_change           ={labelslider_on_change}
            labelslider_on_mouse_leave      ={labelslider_on_mouse_leave}
            labelslider_thumbnail_css       ={labelslider_thumbnail_css}
            labelslider_thumbnail           ={labelslider_thumbnail}
          />
        </div>
    </>
  );
}