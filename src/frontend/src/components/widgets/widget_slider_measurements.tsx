import { Box } from '@mui/material';

type Props = {
  std_slider_framecount: number;
  gridMinorEvery: number;
  gridMajorEvery: number;
};

export function WidgetSliderMeasurments(props: Props) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.28) 0 1px, transparent 0),
      linear-gradient(to right, rgba(255,255,255,0.45) 0 2px, transparent 0)
    `,
        backgroundRepeat: 'repeat-x, repeat-x',
        backgroundSize: `
      calc(100% / var(--frames) * var(--minor)) 100%,
      calc(100% / var(--frames) * var(--major)) 100%
    `,
      }}
      style={{
        ['--frames' as any]: Math.max(1, props.std_slider_framecount) as any,
        ['--minor' as any]: props.gridMinorEvery ?? 10,
        ['--major' as any]: props.gridMajorEvery ?? 50,
      }}
    />
  );
}
