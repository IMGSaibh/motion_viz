import Slider from '@mui/material/Slider';

type Props = {
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change: (e: Event, new_value: number) => void;
  std_slider_on_mouse_move: (e: React.MouseEvent<HTMLSpanElement>) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  std_slider_thumbnail_css: React.CSSProperties;
  std_slider_thumbnail: string | null;
};

export function WidgetStdSlider(props: Props) {
  return (
    <>
      <Slider
        value={props.std_slider_value}
        min={0}
        max={props.std_slider_framecount}
        ref={props.std_slider_reference}
        step={1}
        valueLabelDisplay="auto"
        disableSwap={true}
        onChange={props.std_slider_on_change}
        onMouseMove={props.std_slider_on_mouse_move}
        onMouseLeave={props.std_slider_on_mouse_leave}
      />
      <div style={props.std_slider_thumbnail_css}>
        <img src={props.std_slider_thumbnail || undefined} />
      </div>
    </>
  );
}
