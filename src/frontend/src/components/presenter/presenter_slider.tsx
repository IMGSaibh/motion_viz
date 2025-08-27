import { Box, Typography } from '@mui/material';
import { WidgetStdSlider } from '../widgets/widget_std_slider';
import { WidgetLabelSlider } from '../widgets/widget_label_slider';

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

export function PresenterSlider(props: Props) {
  return (
    <>
      {/* overlay wrapper: sliders precisely on top of each other */}
      <Box
        sx={{
          position: 'relative',
          height: 56,
          bgcolor: 'background.paper',
          mb: '1vw',
          borderRadius: 2,
          p: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ whiteSpace: 'nowrap', mr: 4, flexShrink: 0 }}>
          Frame: {props.label_slider_range[0]} – {props.label_slider_range[1]} / {props.label_slider_framecount}
        </Typography>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <WidgetStdSlider
            {...{
              std_slider_value: props.std_slider_value,
              std_slider_framecount: props.std_slider_framecount,
              std_slider_reference: props.std_slider_reference,
              std_slider_on_change: props.std_slider_on_change,
              std_slider_on_mouse_leave: props.std_slider_on_mouse_leave,
            }}
          />
          <WidgetLabelSlider
            label_slider_range={props.label_slider_range}
            label_slider_framecount={props.label_slider_framecount}
            label_slider_reference={props.label_slider_reference}
            label_slider_on_change={props.label_slider_on_change}
            label_slider_on_mouse_leave={props.label_slider_on_mouse_leave}
          />
        </div>
        <Box sx={{ ml: 10, mr: 6 }}>{}</Box>
      </Box>
    </>
  );
}
