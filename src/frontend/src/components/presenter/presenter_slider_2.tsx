import { Box, Grid, Typography } from '@mui/material';
import { WidgetStdSlider } from '../widgets/widget_std_slider';
import { WidgetLabelSlider } from '../widgets/widget_label_slider';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import * as React from 'react';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

type Props = {
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change: (e: Event, value: number) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;

  label_slider_range: [number, number];
  label_slider_framecount: number;
  label_slider_reference: React.RefObject<HTMLSpanElement | null>;
  label_slider_on_change: (e: Event, value: number | number[], active_slider_hndl_idx: number) => void;
  label_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
};

export function PresenterSlider_2(props: Props) {
  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, p: 1 }}>
        <Grid container alignItems="center" wrap="nowrap">
          <Grid size={1.5}>
            <Typography sx={{ whiteSpace: 'nowrap' }}>
              Frame: {props.label_slider_range[0]} – {props.label_slider_range[1]} / {props.label_slider_framecount}
            </Typography>
          </Grid>
          <Grid size={9}>
            <Box sx={{ position: 'relative', height: 56, width: '100%' }}>
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <WidgetStdSlider
                  {...{
                    std_slider_value: props.std_slider_value,
                    std_slider_framecount: props.std_slider_framecount,
                    std_slider_reference: props.std_slider_reference,
                    std_slider_on_change: props.std_slider_on_change,
                    std_slider_on_mouse_leave: props.std_slider_on_mouse_leave,
                  }}
                />
              </Box>
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <WidgetLabelSlider
                  label_slider_range={props.label_slider_range}
                  label_slider_framecount={props.label_slider_framecount}
                  label_slider_reference={props.label_slider_reference}
                  label_slider_on_change={props.label_slider_on_change}
                  label_slider_on_mouse_leave={props.label_slider_on_mouse_leave}
                />
              </Box>
            </Box>
          </Grid>
          <Grid size={1.5} sx={{ display: 'grid', placeItems: 'center' }}></Grid>
        </Grid>
      </Box>
    </>
  );
}
