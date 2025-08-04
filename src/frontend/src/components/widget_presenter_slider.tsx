import { WidgetPlaySlider } from './widgets/widget_play_slider';
import { WidgetLabelSlider } from './widgets/widget_label_slider';

type WidgetPresenterSliderProps = 
{
  sliderRef: React.RefObject<HTMLInputElement | null>;
  onMouseMove: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  previewStyle: React.CSSProperties;
  previewImgSrc: string | null;


  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  // onChange: (min: number, max: number) => void;

  value: number;
  onChange: (_e: Event, newValue: number | number[], activeThumbIdx: number) => void;
  onMouseMove_SliderLabel:(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseLeave_SliderLabel: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  preview_Style_labelslider:  React.CSSProperties;
  previewImgSrc_labelslider: string | null;


};

export function WidgetPresenterSlider({
  sliderRef,
  onMouseMove,
  onMouseLeave,
  previewStyle,
  previewImgSrc,

  minValue,
  maxValue,
  min, 
  max,
  onChange,

  value,
  onMouseMove_SliderLabel     ,
  onMouseLeave_SliderLabel    ,
  preview_Style_labelslider   ,
  previewImgSrc_labelslider   ,

}: WidgetPresenterSliderProps )
{
  return (
    <>
        <div id="timeline-container">
          <WidgetPlaySlider
            sliderRef={sliderRef}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            previewStyle={previewStyle}
            previewImgSrc={previewImgSrc}
          />
        </div>
        <div id="timeline-container_2">
          <WidgetLabelSlider
            minValue={minValue}
            maxValue={maxValue}
            min={0}
            max={max}
            onChange={onChange}

            value={value}
            onMouseMove_SliderLabel     ={onMouseMove_SliderLabel}
            onMouseLeave_SliderLabel    ={onMouseLeave_SliderLabel}
            preview_Style_labelslider   ={preview_Style_labelslider}
            previewImgSrc_labelslider   ={previewImgSrc_labelslider}

          />
        </div>
    </>
  );
}