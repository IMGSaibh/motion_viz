import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

// Reuse your existing widgets
import { WidgetStdSlider } from './widget_std_slider';
import { WidgetLabelSlider } from './widget_label_slider';

// ---------------------------------------------
// Fixed bottom slider bar with transparent grey bg (Material UI)
// ---------------------------------------------
export type BottomSliderBarProps = {
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change: (e: Event, value: number) => void;
  std_slider_on_mouse_move: (e: React.MouseEvent<HTMLSpanElement>) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;

  label_slider_value: [number, number];
  label_slider_framecount: number;
  label_slider_reference: React.RefObject<HTMLSpanElement | null>;
  label_slider_on_change: (e: Event, value: number | number[], active_slider_hndl_idx: number) => void;
  label_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;

  // Optional: show/hide
  open?: boolean;
};

export function BottomSliderBar({ open = true, ...props }: BottomSliderBarProps) {
  if (!open) return null;
  return (
    <Paper
      elevation={6}
      sx={(theme) => ({
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.drawer + 1,
        px: 2,
        py: 1.5,
        bgcolor: 'rgba(97, 97, 97, 0.45)', // transparent grey
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderTop: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            FRAME: {props.label_slider_value.join(' – ')} / {props.label_slider_framecount}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <WidgetLabelSlider
              {...{
                label_slider_value: props.label_slider_value,
                label_slider_framecount: props.label_slider_framecount,
                label_slider_reference: props.label_slider_reference,
                label_slider_on_change: props.label_slider_on_change,
                label_slider_on_mouse_leave: props.label_slider_on_mouse_leave,
              }}
            />
          </Box>
        </Box>

        <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            FRAME: {props.std_slider_value} / {props.std_slider_framecount}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <WidgetStdSlider
              {...{
                std_slider_value: props.std_slider_value,
                std_slider_framecount: props.std_slider_framecount,
                std_slider_reference: props.std_slider_reference,
                std_slider_on_change: props.std_slider_on_change,
                std_slider_on_mouse_move: props.std_slider_on_mouse_move,
                std_slider_on_mouse_leave: props.std_slider_on_mouse_leave,
              }}
            />
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
