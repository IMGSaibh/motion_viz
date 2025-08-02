import { WidgetPlaySlider } from './widgets/widget_play_slider';
import { DoubleHandleSlider } from '@/double_handle_slider';

type WidgetPresenterSliderProps = 
{
};

export function WidgetPresenterSlider({

    
}: WidgetPresenterSliderProps )
{
  return (
    <>
        <div id="timeline-container">
            <WidgetPlaySlider
            />
        </div>
        <div id="timeline-container_2">
            <DoubleHandleSlider
            />
        </div>
    </>
  );
}