import Slider from '@mui/material/Slider';

type WidgetLabelSliderProps = {
  labelslider_framecount: number;
  value: [number, number];
  labelslider_on_change: (e: Event, newValue: number | number[], activeThumbIdx: number) => void;
  labelslider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  labelslider_thumbnail_css:  React.CSSProperties;
  labelslider_thumbnail: string | null;
};

export function WidgetLabelSlider({
  value,
  labelslider_framecount, 
  labelslider_on_change,
  labelslider_on_mouse_leave,
  labelslider_thumbnail_css,
  labelslider_thumbnail,

}: WidgetLabelSliderProps) {

  return (
    <>
      <div id="frame-label">Frame: 0 / {labelslider_framecount}</div>
      <Slider
        value={value}
        min={0}
        max={100}
        valueLabelDisplay="auto"
        sx={{
          color: '#45ab45',
          '& .MuiSlider-thumb': {
            backgroundColor: '#fff',
            border: '2px solid #45ab45',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#ffffffff',
            opacity: 1,
          },
          '& .MuiSlider-track': {
            backgroundColor: '#45ab45',
          },
          '& .MuiSlider-valueLabel': {
            color: '#fff',
            background: '#45ab45',
          },
        }}
        onChange={labelslider_on_change}
        onMouseLeave={labelslider_on_mouse_leave}
      />
      <div id="preview-popup" style={labelslider_thumbnail_css}>
        <img src={labelslider_thumbnail || undefined} />
      </div>
    </>
  );
}
