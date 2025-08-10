import Slider from '@mui/material/Slider';

type Props = {
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

export function WidgetLabelSlider(porps: Props) {
  return (
    <>
      <Slider
        value={porps.label_slider_value}
        min={0}
        max={porps.label_slider_framecount}
        step={1}
        valueLabelDisplay="auto"
        onChange={porps.label_slider_on_change}
        onMouseLeave={porps.label_slider_on_mouse_leave}
      />
      <div style={porps.label_slider_thumbnail_css}>
        <img src={porps.label_slider_thumbnail || undefined} />
      </div>
    </>
  );
}
