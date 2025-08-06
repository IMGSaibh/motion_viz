import Slider from '@mui/material/Slider';

type WidgetLabelSliderProps = {
  label_slider_value: [number, number];
  label_slider_framecount: number;
  label_slider_on_change: (e: Event, value: number | number[], active_slider_hndl_idx: number) => void;
  label_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  label_slider_thumbnail_css:  React.CSSProperties;
  label_slider_thumbnail: string | null;
};

export function WidgetLabelSlider({
  label_slider_value,
  label_slider_framecount, 
  label_slider_on_change,
  label_slider_on_mouse_leave,
  label_slider_thumbnail_css,
  label_slider_thumbnail,

}: WidgetLabelSliderProps) {

  return (
    <>
      <div id="label-slider-label">Frame: 0 / {label_slider_framecount}</div>
      <Slider
        value={label_slider_value}
        min={0}
        max={label_slider_framecount}
        step={1}
        valueLabelDisplay="auto"
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
        onChange={label_slider_on_change}
        onMouseLeave={label_slider_on_mouse_leave}
      />
      <div id="preview-popup" style={label_slider_thumbnail_css}>
        <img src={label_slider_thumbnail || undefined} />
      </div>
    </>
  );
}
