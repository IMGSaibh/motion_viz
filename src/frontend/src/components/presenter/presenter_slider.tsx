import * as React from 'react';
import { Box, Grid, SliderProps } from '@mui/material';
import { WidgetStdSlider } from '../widgets/widget_std_slider';
import { WidgetLabelSlider } from '../widgets/widget_label_slider';
import { WidgetLabelPreview } from '../widgets/widget_label_preview';
import { WidgetSliderTicks } from '../widgets/widget_slider_ticks';
import { WidgetTimelineStats } from '../widgets/widget_timeline_stats';

type Props = {
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change?: SliderProps['onChange'];
  std_slider_on_mouse_leave: SliderProps['onMouseLeave'];
  std_slider_on_pointer_move: SliderProps['onPointerMove'];

  label_slider_range: [number, number];
  label_slider_framecount: number;
  label_slider_reference: React.RefObject<HTMLSpanElement | null>;

  // gridMinorEvery: number;
  // gridMajorEvery: number;
  // onGridMinorChange: SliderProps['onChange'];
  // onGridMajorChange: SliderProps['onChange'];
};

export function PresenterSlider(props: Props) {
  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 0, p: 0, mb: '1vw' }}>
        <Grid container alignItems="center" wrap="nowrap">
          <Grid size={1}>
            <WidgetTimelineStats
              {...{ std_slider_value: props.std_slider_value, std_slider_framecount: props.label_slider_framecount }}
            ></WidgetTimelineStats>
          </Grid>
          <Grid size={1} sx={{ display: 'grid', placeItems: 'center' }}>
            <WidgetLabelPreview />
          </Grid>
          <Grid size={10}>
            <Box sx={{ position: 'relative', height: 64, width: '100%' }}>
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <WidgetStdSlider
                  {...{
                    std_slider_value: props.std_slider_value,
                    std_slider_framecount: props.std_slider_framecount,
                    std_slider_reference: props.std_slider_reference,
                    std_slider_on_change: props.std_slider_on_change,
                    std_slider_on_mouse_leave: props.std_slider_on_mouse_leave,
                    std_slider_on_pointer_move: props.std_slider_on_pointer_move,
                  }}
                />
              </Box>
              <WidgetSliderTicks
                {...{
                  std_slider_framecount: props.std_slider_framecount,
                  // gridMinorEvery: props.gridMinorEvery,
                  // gridMajorEvery: props.gridMajorEvery,
                }}
              />
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <WidgetLabelSlider
                  label_slider_range={props.label_slider_range}
                  label_slider_framecount={props.label_slider_framecount}
                  label_slider_reference={props.label_slider_reference}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
