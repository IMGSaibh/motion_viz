import Slider from '@mui/material/Slider';

type WidgetPlaySliderProps = {
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change: (e: Event, new_value: number) => void;
  std_slider_on_mouse_move: (e: React.MouseEvent<HTMLSpanElement>) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  std_slider_thumbnail_css: React.CSSProperties;
  std_slider_thumbnail: string | null;
};

export function WidgetStdSlider(widget_std_slider_props: WidgetPlaySliderProps) {
  return (
    <>
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
      />
      <div id="preview-popup" style={widget_std_slider_props.std_slider_thumbnail_css}>
        <img src={widget_std_slider_props.std_slider_thumbnail || undefined} />
      </div>
    </>
  );
}
