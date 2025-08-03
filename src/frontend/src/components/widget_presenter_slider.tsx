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
  onChange: (min: number, max: number) => void;
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
  onChange

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
            max={100}
            onChange={onChange}
          />
        </div>
    </>
  );
}