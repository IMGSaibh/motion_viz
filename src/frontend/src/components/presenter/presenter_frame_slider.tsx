import { Box } from '@mui/material';
import { WidgetFrameTicks } from '@/components/widgets/widget_frame_ticks';
import { WidgetFrameLabelBar } from '@/components/widgets/widget_frame_label_bar';
import { WidgetFrameSliderPerformance } from '@/components/widgets/widget_frame_slider_performance';

type Props = {
  // current frame
  slider_frame: number;
  frame_count: number;

  // calculated hover frame from container
  hover_frame: number | null;

  // reference to slider-frame-track (for getBoundingClientRect within container)
  slider_track_ref: React.RefObject<HTMLDivElement | null>;

  on_mouse_down_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;
  on_mouse_move_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;
  on_mouse_up_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;
  on_mouse_leave_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;

  // Label-Bar-Infos
  // label_slider_range: [number, number];
  // label_slider_framecount: number;
};

export function PresenterFrameSlider(props: Props) {
  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.wip_color_theme[500],
      })}
    >
      {/* Ticks über dem Slider */}
      <WidgetFrameTicks frame_count={props.frame_count} />

      {/* eigentlicher Frame-Slider */}
      <WidgetFrameSliderPerformance
        slider_frame={props.slider_frame}
        frame_count={props.frame_count}
        hover_frame={props.hover_frame}
        slider_track_ref={props.slider_track_ref}
        on_mouse_down_slider_track={props.on_mouse_down_slider_track}
        on_mouse_move_slider_track={props.on_mouse_move_slider_track}
        on_mouse_up_slider_track={props.on_mouse_up_slider_track}
        on_mouse_leave_slider_track={props.on_mouse_leave_slider_track}
      />

      {/* Label-Bar darunter */}
      {/* <WidgetFrameLabelBar
        label_slider_range={props.label_slider_range}
        label_slider_framecount={props.label_slider_framecount}
      /> */}
    </Box>
  );
}
