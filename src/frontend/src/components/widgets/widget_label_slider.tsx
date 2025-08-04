import Slider from '@mui/material/Slider';

type WidgetLabelSliderProps = {
  framecount: number;
  value: [number, number];
  onChange: (_e: Event, newValue: number | number[], activeThumbIdx: number) => void;
  preview_Style_labelslider:  React.CSSProperties;
  previewImgSrc_labelslider: string | null;
};

export function WidgetLabelSlider({
  framecount, 
  onChange,

  value,
  preview_Style_labelslider   ,
  previewImgSrc_labelslider   ,

}: WidgetLabelSliderProps) {

  return (
    <>
      <div id="frame-label">Frame: 0 / {framecount}</div>
      <Slider
        value={value}
        min={0}
        max={100}
        valueLabelDisplay="auto"
        sx={{
          color: '#007bff'
        }}
        onChange={onChange}
      />
      <div id="preview-popup" style={preview_Style_labelslider}>
        <img src={previewImgSrc_labelslider || undefined} />
      </div>
    </>
  );
}
