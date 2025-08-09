import Slider from '@mui/material/Slider';

type WidgetLabelSliderProps = {
  label_slider_value: [number, number];
  label_slider_framecount: number;
  label_slider_on_change: (
    e: Event,
    value: number | number[],
    active_slider_hndl_idx: number
  ) => void;
  label_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  label_slider_thumbnail_css: React.CSSProperties;
  label_slider_thumbnail: string | null;
};

export function WidgetLabelSlider(label_slider_porps: WidgetLabelSliderProps) {
  return (
    <>
      <Slider
        value={label_slider_porps.label_slider_value}
        min={0}
        max={label_slider_porps.label_slider_framecount}
        step={1}
        valueLabelDisplay="auto"
        onChange={label_slider_porps.label_slider_on_change}
        onMouseLeave={label_slider_porps.label_slider_on_mouse_leave}
      />
      <div id="preview-popup" style={label_slider_porps.label_slider_thumbnail_css}>
        <img src={label_slider_porps.label_slider_thumbnail || undefined} />
      </div>
    </>
  );
}
