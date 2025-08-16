import { WidgetStdSlider } from './widgets/widget_std_slider';
import { WidgetLabelSlider } from './widgets/widget_label_slider';
import { SliderListEntry, WidgetSliderList } from './widgets/widget_slider_list';
import { useRef, useState } from 'react';
import { BottomSliderBar } from './widgets/widget_bottom_slider_bar';
import { Box, Container, Paper, Typography } from '@mui/material';
import { Label } from '@mui/icons-material';

type Props = {
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
};

export function WidgetPresenterSlider(props: Props) {
  return (
    <>
      <Box
        sx={(theme) => ({
          position: 'absolute',
          left: '1vw',
          right: '1vw',
          bottom: '3vw',
          zIndex: 0,
          padding: '1rem',
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderRadius: '0.5rem',
        })}
      >
        {/* <Typography sx={{ whiteSpace: 'nowrap' }}>
          FRAME: {props.label_slider_value} / {props.label_slider_framecount}
        </Typography> */}

        <div style={{ position: 'relative', flex: 1, minWidth: 0, height: 30 }}>
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
          <WidgetLabelSlider
            {...{
              label_slider_value: props.label_slider_value,
              label_slider_framecount: props.label_slider_framecount,
              label_slider_reference: props.label_slider_reference,
              label_slider_on_change: props.label_slider_on_change,
              label_slider_on_mouse_leave: props.label_slider_on_mouse_leave,
            }}
          />
        </div>

        {/* Hier kannst du später noch Buttons, Dropdowns, Icons etc. ergänzen */}
      </Box>
    </>
  );
}
