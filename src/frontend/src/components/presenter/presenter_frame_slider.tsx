import { Box } from '@mui/material';
import { WidgetFrameSlider } from '@/components/widgets/widget_frame_slider';
import { WidgetFrameTicks } from '@/components/widgets/widget_frame_ticks';
import { WidgetFrameLabelBar } from '@/components/widgets/widget_frame_label_bar';
import { WidgetFrameSliderPerformance } from '@/components/widgets/widget_frame_slider_performance';

type Props = {
  std_slider_value: number;
  frame_count: number;
  on_click_frame?: (frame: number) => void;
  on_mouse_move?: (e: React.MouseEvent<HTMLDivElement>) => void;
  label_slider_range: [number, number];
  label_slider_framecount: number;
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
        on_mouse_move={props.on_mouse_move}
      />
      <WidgetFrameLabelBar
        label_slider_range={props.label_slider_range}
        label_slider_framecount={props.label_slider_framecount}
      ></WidgetFrameLabelBar>
    </Box>
  );
}
