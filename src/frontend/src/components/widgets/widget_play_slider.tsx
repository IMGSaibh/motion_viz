import Slider from '@mui/material/Slider';

type WidgetPlaySliderProps = 
{
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change: (e: Event, newValue: number) => void;
  std_slider_on_mouse_move: (e: React.MouseEvent<HTMLSpanElement>) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  std_slider_thumbnail_css: React.CSSProperties;
  std_slider_thumbnail: string | null;
};

export function WidgetPlaySlider({ 
  std_slider_value,
  std_slider_framecount,
  std_slider_reference,
  std_slider_on_change,
  std_slider_on_mouse_move,
  std_slider_on_mouse_leave,
  std_slider_thumbnail_css,
  std_slider_thumbnail
}: WidgetPlaySliderProps) {
  return (
    <>
      <div id="frame-label">Frame: 0 / 0</div>
      {/* <input
        value={std_slider_value}
        type="range"
        id="frame-slider"
        min="0"
        max="100"
        // defaultValue="0"
        ref={std_slider_reference}
        // onChange={std_slider_on_change}
        onMouseMove={std_slider_on_mouse_move}
        onMouseLeave={std_slider_on_mouse_leave}
      /> */}
      <Slider
        value={std_slider_value}
        min={0}
        max={std_slider_framecount}
        ref={std_slider_reference}
        valueLabelDisplay="auto"
        onChange={std_slider_on_change}
        onMouseMove={std_slider_on_mouse_move}
        onMouseLeave={std_slider_on_mouse_leave}
        sx={{
          color: '#45ab45',
          
          '& .MuiSlider-thumb': 
          {
            backgroundColor: '#fff',
            border: '2px solid #45ab45',
            '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 4px rgba(69, 171, 69, 0.3)',},
            '&.Mui-active': {boxShadow: '0 0 0 8px rgba(69, 171, 69, 0.5)'},
          },
          '& .MuiSlider-rail': 
          {
            backgroundColor: '#ffffffff',
            opacity: 1,
          },
          '& .MuiSlider-track': 
          {
            backgroundColor: '#45ab45',
          },
          '& .MuiSlider-valueLabel': 
          {
            color: '#fff',
            background: '#45ab45',
          },
        }}
      />
      <div id="preview-popup" style={std_slider_thumbnail_css}>
        <img src={std_slider_thumbnail || undefined} />
      </div>
    </>
  );
}