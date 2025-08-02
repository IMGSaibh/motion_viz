import { WidgetPlaySlider } from './widgets/widget_play_slider';
import { DoubleHandleSlider } from '@/double_handle_slider';

type WidgetPresenterSliderProps = 
{
  sliderRef: React.RefObject<HTMLInputElement | null>;
  onMouseMove: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  previewStyle: React.CSSProperties;
  previewImgSrc: string | null;
};

export function WidgetPresenterSlider({
  sliderRef,
  onMouseMove,
  onMouseLeave,
  previewStyle,
  previewImgSrc
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
            <DoubleHandleSlider/>
        </div>
    </>
  );
}