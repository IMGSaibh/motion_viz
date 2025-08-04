import { WidgetPlaySlider } from './widgets/widget_play_slider';
import { WidgetLabelSlider } from './widgets/widget_label_slider';

type WidgetPresenterSliderProps = 
{
  sliderRef: React.RefObject<HTMLInputElement | null>;
  onMouseMove: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  previewStyle: React.CSSProperties;
  previewImgSrc: string | null;


  value: [number, number];
  framecount: number;
  onChange: (_e: Event, newValue: number | number[], activeThumbIdx: number) => void;
  preview_Style_labelslider:  React.CSSProperties;
  previewImgSrc_labelslider: string | null;
};

export function WidgetPresenterSlider({
  sliderRef,
  onMouseMove,
  onMouseLeave,
  previewStyle,
  previewImgSrc,

  value,
  framecount,
  onChange,
  preview_Style_labelslider,
  previewImgSrc_labelslider,

}: WidgetPresenterSliderProps )
{
  return (
    <>
        <div id="timeline-container">
          <WidgetPlaySlider
            sliderRef                   ={sliderRef}
            onMouseMove                 ={onMouseMove}
            onMouseLeave                ={onMouseLeave}
            previewStyle                ={previewStyle}
            previewImgSrc               ={previewImgSrc}
          />
        </div>
        <div id="timeline-container_2">
          <WidgetLabelSlider
            framecount                  ={framecount}
            value                       ={value}
            onChange                    ={onChange}
            preview_Style_labelslider   ={preview_Style_labelslider}
            previewImgSrc_labelslider   ={previewImgSrc_labelslider}
          />
        </div>
    </>
  );
}