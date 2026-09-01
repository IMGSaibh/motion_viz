import { Box, Grid } from '@mui/material';

function computeTickInterval(frameCount: number): number {
  if (frameCount <= 50) return 10;
  if (frameCount <= 150) return 20;
  if (frameCount <= 400) return 50;
  if (frameCount <= 1000) return 100;
  if (frameCount <= 3000) return 200;
  if (frameCount <= 5000) return 500;
  if (frameCount <= 10000) return 800;
  return 2000;
}

type Props = {
  frame_count: number;
};

/**
 * Renders a readable set of frame-number ticks for the current motion length.
 *
 * Tick-density and tick-layout behavior belong here because they are isolated visual
 * concerns. Playback state, seeking, and range selection must remain in the slider
 * container and contexts.
 */
export function WidgetFrameTicks(props: Props) {
  const frameCount = props.frame_count;
  const ticks: number[] = [];
  const interval = computeTickInterval(frameCount);
  const last_frame = frameCount - 1;

  for (let i = 0; i < frameCount; i += interval) {
    ticks.push(i);
  }
  if (ticks.length === 0 || ticks[ticks.length - 1] !== last_frame) {
    ticks.push(last_frame);
  }

  return (
    <Grid container spacing={0} justifyContent="center" alignItems="center">
      <Grid size={{ md: 10, xs: 12 }} sx={{ position: 'relative' }}>
        <Box
          sx={(theme) => ({
            width: '100%',
            height: 40,
            position: 'relative',
          })}
        >
          {ticks.map((frame) => {
            const percent = ((frame + 0.5) / frameCount) * 100;
            return (
              <Box
                key={frame}
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: `${percent}%`,
                  transform: 'translateX(-50%)',
                  fontSize: 10,
                  color: 'white',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {/* frame number */}
                <Box
                  sx={{
                    fontSize: 10,
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  {frame}
                </Box>

                {/* tick line under number frame number */}
                <Box
                  sx={{
                    width: '2px',
                    height: '10px',
                    bgcolor: 'white',
                    margin: '2px auto 0 auto',
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Grid>
    </Grid>
  );
}
