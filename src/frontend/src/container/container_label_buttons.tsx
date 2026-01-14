import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Box, Grid } from '@mui/material';
import { WidgetFrameLabelBar } from '@/components/widgets/widget_frame_label_bar';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';
import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';

import {
  use_add_slider_label_ctx,
  use_range_slider_value_cxt,
  use_set_range_slider_value_cxt,
  use_slider_frame_cxt,
  use_range_marker_cxt,
} from '@/context/context_slider_label_list';
import type { Label } from '@/domain/datatypes';

export function ContainerLabelButtons() {
  const { frame_count } = use_three_js_engine_ctx();
  const slider_frame = use_slider_frame_cxt();
  const frame_slider_range = use_range_slider_value_cxt();
  const set_range = use_set_range_slider_value_cxt();

  const add_label = use_add_slider_label_ctx();

  // const add_rula_category = use_add_rula_cat_ctx();

  // const lable_list = use_range_marker_cxt();

  // const label_id = useRef<number>(lable_list.length + 1);

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

  const on_click_save_label = useCallback(
    (label: Label) => {
      add_label(label);
      console.log('Added label:', label);
    },
    [add_label],
  );

  const label_bar_props = useMemo(
    () => ({
      frame_count: frame_count ?? 0,
      frame_slider_range: frame_slider_range,
    }),
    [frame_count, frame_slider_range],
  );
  return (
    <>
      <Box
        sx={(theme) => ({
          bgcolor: theme.palette.wip_color_theme[500],
        })}
      >
        <Grid container spacing={0} alignItems="center">
          <Grid size={{ md: 1 }} />
          <Grid size={{ md: 10 }}>
            <WidgetFrameLabelBar {...label_bar_props} />
          </Grid>
          <Grid size={{ md: 1 }} />
        </Grid>
      </Box>

      <PresenterLabelButtons onClick={on_click_save_label} />
    </>
  );
}
