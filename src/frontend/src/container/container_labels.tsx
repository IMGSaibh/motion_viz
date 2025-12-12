import { useCallback, useEffect, useMemo } from 'react';
import { Box, Grid } from '@mui/material';
import { WidgetFrameLabelBar } from '@/components/widgets/widget_frame_label_bar';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';
import { useThreeJSEngine } from '@/context/context_three_js_engine';
import {
  use_range_slider_value_cxt,
  use_set_range_slider_value_cxt,
  use_slider_frame_cxt,
} from '@/context/context_slider_label_list';

export function ContainerLabels() {
  const { frame_count } = useThreeJSEngine();

  const slider_frame = use_slider_frame_cxt();
  const frame_slider_range = use_range_slider_value_cxt();
  const set_range = use_set_range_slider_value_cxt();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!frame_count || frame_count <= 0) return;

      const maxIdx = Math.max(0, frame_count - 1);
      const clamp = (n: number) => Math.max(0, Math.min(n, maxIdx));

      if (e.code === 'KeyA') {
        e.preventDefault();
        set_range([clamp(slider_frame), frame_slider_range[1]]);
      }
      if (e.code === 'KeyE') {
        e.preventDefault();
        set_range([frame_slider_range[0], clamp(slider_frame)]);
      }
      if (e.code === 'Digit1' && e.location === 0) {
        set_range([clamp(slider_frame), frame_slider_range[1]]);
      }
      if (e.code === 'Digit2' && e.location === 0) {
        set_range([frame_slider_range[0], clamp(slider_frame)]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frame_count, frame_slider_range, set_range, slider_frame]);

  const label_bar_props = useMemo(
    () => ({
      frame_count: frame_count ?? 0,
      frame_slider_range: frame_slider_range,
    }),
    [frame_count, frame_slider_range],
  );
  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.wip_color_theme[500],
      })}
    >
      {/* <WidgetFrameLabelBar {...label_bar_props} /> */}
      {/* <PresenterLabelButtons onClick={add_label_on_click} /> */}

      <Grid container spacing={0} alignItems="center">
        <Grid size={{ md: 1 }} />
        <Grid size={{ md: 10 }}>
          <WidgetFrameLabelBar {...label_bar_props} />
        </Grid>
        <Grid size={{ md: 1 }} />
      </Grid>
    </Box>
  );
}
