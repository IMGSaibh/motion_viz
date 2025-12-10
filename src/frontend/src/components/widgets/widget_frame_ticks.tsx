import { Box, Grid } from '@mui/material';

function computeTickInterval(frameCount: number): number {
  if (frameCount <= 50) return 1;
  if (frameCount <= 150) return 5;
  if (frameCount <= 400) return 10;
  if (frameCount <= 1000) return 20;
  if (frameCount <= 3000) return 50;
  return 100;
}

type Props = {
  frame_count: number;
};

export function WidgetFrameTicks(props: Props) {
  const tickEvery = computeTickInterval(props.frame_count);
  return (
    <Grid container spacing={0} alignItems="center">
      <Grid size={{ md: 1 }}></Grid>
      <Grid size={{ md: 10 }} sx={{ position: 'relative' }}>
        <Box
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${props.frame_count}, 1fr)`,
            alignItems: 'center',
          }}
        >
          {Array.from({ length: props.frame_count }).map((_, index) => {
            const showTick = index % tickEvery === 0;

            return (
              <Box
                className={`frame-tick-${index}`}
                key={index}
                sx={(theme) => ({
                  height: 40,
                  bgcolor: theme.palette.wip_color_theme[400],
                  position: 'relative',
                })}
              >
                {showTick && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -18,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 10,
                      color: 'black',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {index}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Grid>
      <Grid size={{ md: 1 }}></Grid>
    </Grid>
  );
}
