import { Box } from '@mui/material';
import { WidgetFrameTicks } from '@/components/widgets/widget_frame_ticks';
import { WidgetFrameSlider } from '@/components/widgets/widget_frame_slider';
import { WidgetFrameLabelBar } from '@/components/widgets/widget_frame_label_bar';

type Props = {
  // current frame
  frame_slider_value: number;
  frame_count: number;
  frame_slider_range: [number, number];

  // calculated hover frame from container
  hover_frame: number | null;

  // reference to slider-frame-track (for getBoundingClientRect within container)
  slider_track_ref: React.RefObject<HTMLDivElement | null>;

  on_mouse_down_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;
  on_mouse_move_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;
  on_mouse_up_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;
  on_mouse_leave_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;
  is_playing: boolean;
  on_click_play_toggle?: () => void;
};

export function PresenterFrameSlider(props: Props) {
  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.wip_color_theme[500],
      })}
    >
      {/* Slider ticks */}
      <WidgetFrameTicks frame_count={props.frame_count} />

      {/* Frame-Slider */}
      <WidgetFrameSlider
        frame_slider_value={props.frame_slider_value}
        frame_count={props.frame_count}
        hover_frame={props.hover_frame}
        slider_track_ref={props.slider_track_ref}
        on_mouse_down_slider_track={props.on_mouse_down_slider_track}
        on_mouse_move_slider_track={props.on_mouse_move_slider_track}
        on_mouse_up_slider_track={props.on_mouse_up_slider_track}
        on_mouse_leave_slider_track={props.on_mouse_leave_slider_track}
        is_playing={props.is_playing}
        on_click_play_toggle={props.on_click_play_toggle}
      />

      {/* Frame-bar under frame slider */}
      <WidgetFrameLabelBar frame_count={props.frame_count} />
    </Box>
  );
}
