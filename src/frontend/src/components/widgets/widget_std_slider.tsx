import Slider from '@mui/material/Slider';

type WidgetPlaySliderProps = 
{
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change: (e: Event, new_value: number) => void;
  std_slider_on_mouse_move: (e: React.MouseEvent<HTMLSpanElement>) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  std_slider_thumbnail_css: React.CSSProperties;
  std_slider_thumbnail: string | null;
};

export function WidgetStdSlider(widget_std_slider_props: WidgetPlaySliderProps) 
{
  return (
    <>
      <div className="slider-label">Frame: {widget_std_slider_props.std_slider_value} / {widget_std_slider_props.std_slider_framecount}</div>
      <Slider
        value={widget_std_slider_props.std_slider_value}
        min={0}
        max={widget_std_slider_props.std_slider_framecount}
        ref={widget_std_slider_props.std_slider_reference}
        step={1}
        valueLabelDisplay="auto"
        disableSwap={true}
        onChange={widget_std_slider_props.std_slider_on_change}
        onMouseMove={widget_std_slider_props.std_slider_on_mouse_move}
        onMouseLeave={widget_std_slider_props.std_slider_on_mouse_leave}
        sx={{
          color: '#45ab45',
          
          '& .MuiSlider-thumb': 
          {
            backgroundColor: '#fff',
            border: '2px solid #45ab45',
            '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 4px rgba(69, 171, 69, 0.3)',},
            '&.Mui-active': {boxShadow: '0 0 0 8px rgba(69, 171, 69, 0.5)'},
            transition: 'none !important',
          },
          '& .MuiSlider-rail': 
          {
            backgroundColor: '#ffffffff',
            opacity: 1,
          },
          '& .MuiSlider-track': 
          {
            backgroundColor: '#45ab45',
            transition: 'none !important',
          },
          '& .MuiSlider-valueLabel': 
          {
            color: '#fff',
            background: '#45ab45',
          },
        }}
      />
      <div id="preview-popup" style={widget_std_slider_props.std_slider_thumbnail_css}>
        <img src={widget_std_slider_props.std_slider_thumbnail || undefined} />
      </div>
    </>
  );
}