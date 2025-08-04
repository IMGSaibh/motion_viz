import Slider from '@mui/material/Slider';

type WidgetLabelSliderProps = {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  //onChange: (min: number, max: number) => void;


  value: number;
  onChange: (_e: Event, newValue: number | number[], activeThumbIdx: number) => void;
  onMouseMove_SliderLabel:(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseLeave_SliderLabel: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  preview_Style_labelslider:  React.CSSProperties;
  previewImgSrc_labelslider: string | null;
};

export function WidgetLabelSlider({
  min, 
  max, 
  minValue, 
  maxValue, 
  onChange,

  value,
  onMouseMove_SliderLabel     ,
  onMouseLeave_SliderLabel    ,
  preview_Style_labelslider   ,
  previewImgSrc_labelslider   ,

}: WidgetLabelSliderProps) {

  return (
    <>
      {/* <div style={{ width: 400, margin: "50px auto" }}> */}
        <div id="frame-label">Frame: 0 / {maxValue}</div>
        <Slider
          // value={[minValue, maxValue]}
          value={value}
          min={min}
          max={max}
          valueLabelDisplay="auto"
          sx={{
            color: '#007bff'
          }}
          onChange={onChange}
          onMouseMove={onMouseMove_SliderLabel}
          onMouseLeave={onMouseLeave_SliderLabel}
        />
        <div id="preview-popup" style={preview_Style_labelslider}>
          <img src={previewImgSrc_labelslider || undefined} />
        </div>
    </>
  );
}
