import { useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { WidgetFrameLabelBar } from '@/components/widgets/widget_frame_label_bar';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';
import { useThreeJSEngine } from '@/context/context_three_js_engine';

export function ContainerLabels() {
  const { frame_count } = useThreeJSEngine();
  const label_bar_props = useMemo(
    () => ({
      frame_count: frame_count ?? 0,
    }),
    [frame_count],
  );
  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.wip_color_theme[500],
      })}
    >
      <WidgetFrameLabelBar {...label_bar_props} />
      {/* <PresenterLabelButtons onClick={add_label_on_click} /> */}
    </Box>
  );
}
