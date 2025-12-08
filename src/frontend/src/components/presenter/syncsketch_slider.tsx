import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';

type Props = {
  label_slider_framecount: number;
};

export function SyncSketchSlider(props: Props) {
  const frameCount = Math.max(0, props.label_slider_framecount);
  const [currentFrame, setCurrentFrame] = React.useState(0);

  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const [hoverX, setHoverX] = React.useState(0);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  // Falls sich die Framezahl ändert, selektierten Index im Bereich halten
  React.useEffect(() => {
    if (frameCount === 0) {
      setCurrentFrame(0);
      return;
    }
    if (currentFrame > frameCount) {
      setCurrentFrame(frameCount);
    }
  }, [frameCount, currentFrame]);

  //   const effectiveFrameCount = frameCount === 0 ? 1 : frameCount;

  return (
    <>
      <Grid container>
        <Grid
          size={{ md: 1 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          Grid 1
        </Grid>

        {/* <Grid size={{ md: 10 }}> */}
        <Grid size={{ md: 10 }} sx={{ position: 'relative' }}>
          {hoverIndex !== null && (
            <Box
              sx={{
                position: 'absolute',
                top: -22,
                left: hoverX - 11,
                bgcolor: 'grey.900',
                color: 'white',
                px: 1,
                py: 0.3,
                fontSize: 12,
                borderRadius: 1,
                pointerEvents: 'none',
                boxShadow: 2,
              }}
            >
              {hoverIndex}
            </Box>
          )}
          {/* Slider-Track */}
          <Box
            ref={sliderRef}
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: `repeat(${frameCount}, 1fr)`,
              alignItems: 'center',
            }}
          >
            {frameCount === 0 ? (
              <Box
                sx={{
                  height: 40,
                  bgcolor: 'grey.700',
                }}
              />
            ) : (
              Array.from({ length: frameCount }).map((_, index) => {
                const greyTone = index % 2 === 0 ? 'grey.600' : 'grey.700';
                return (
                  <Box
                    key={index}
                    onClick={() => setCurrentFrame(index)}
                    onMouseEnter={(e) => {
                      setHoverIndex(index);

                      if (sliderRef.current) {
                        const rect = sliderRef.current.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left;
                        setHoverX(mouseX);
                      }

                      setCurrentFrame(index);
                    }}
                    onMouseMove={(e) => {
                      if (sliderRef.current) {
                        const rect = sliderRef.current.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left;
                        setHoverX(mouseX);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoverIndex(null);
                    }}
                    sx={{
                      height: 40,
                      bgcolor: greyTone,
                      cursor: 'pointer',
                      transition: 'height 120ms ease, opacity 120ms ease, background-color 120ms ease',
                      '&:hover': {
                        opacity: 1,
                        bgcolor: 'primary.main',
                      },
                    }}
                  />
                );
              })
            )}
          </Box>
        </Grid>

        <Grid
          size={{ md: 1 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" noWrap>
            &nbsp; Frame:&nbsp;{currentFrame} &nbsp; [0 – {props.label_slider_framecount}]
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}
