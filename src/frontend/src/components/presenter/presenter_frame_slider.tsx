import { WidgetFrameSlider } from '@/components/widgets/widget_frame_slider';
import { WidgetFrameTicks } from '@/components/widgets/widget_frame_ticks';
import { WidgetFrameSliderPerformance } from '@/components/widgets/widget_frame_slider_performance';
import { Box } from '@mui/material';

type Props = {
  std_slider_value: number;
  frame_count: number;
  on_click_frame?: (frame: number) => void;
};

export function PresenterFrameSlider(props: Props) {
  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.wip_color_theme[500],
      })}
    >
      <WidgetFrameTicks frame_count={props.frame_count} />
      <WidgetFrameSliderPerformance
        std_slider_value={props.std_slider_value}
        frame_count={props.frame_count}
        on_click_frame={props.on_click_frame}
      />
    </Box>
  );
}
