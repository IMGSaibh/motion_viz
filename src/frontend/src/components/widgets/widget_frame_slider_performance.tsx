import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { PLAY_BUTTON_IMAGE } from '@/Assets/label_images';

type Props = {
  std_slider_value: number;
  frame_count: number;
  on_click_frame?: (frame: number) => void;
};

export function WidgetFrameSliderPerformance(props: Props) {
  const { std_slider_value, frame_count, on_click_frame } = props;

  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const hasFrames = frame_count > 0;

  const clampedValue = hasFrames ? Math.min(Math.max(std_slider_value, 0), frame_count - 1) : 0;

  // Markerposition:
  const markerPct = hasFrames ? ((clampedValue + 0.5) / frame_count) * 100 : 0;

  // NEW: Hover-Frame speichern
  const [hoverFrame, setHoverFrame] = React.useState<number | null>(null);
  const hoverPct = hoverFrame !== null ? ((hoverFrame + 0.5) / frame_count) * 100 : null;

  // Scrubbing
  const isDragging = React.useRef(false);

  const computeFrameFromClientX = React.useCallback(
    (clientX: number) => {
      if (!trackRef.current || !hasFrames) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width || 1;
      const ratio = Math.min(1, Math.max(0, x / width));
      return Math.round(ratio * (frame_count - 1));
    },
    [frame_count, hasFrames],
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!on_click_frame) return;
    isDragging.current = true;
    const frame = computeFrameFromClientX(e.clientX);
    on_click_frame(frame);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const frame = computeFrameFromClientX(e.clientX);

    // Hover aktiv aktualisieren
    setHoverFrame(frame);

    // Scrubbing
    if (isDragging.current && on_click_frame) {
      on_click_frame(frame);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setHoverFrame(null); // Hover verschwindet
  };

  return (
    <Grid
      container
      spacing={0}
      alignItems="center"
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderRadius: 0,
      })}
    >
      {/* Play Button */}
      <Grid size={{ md: 1 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            backgroundImage: `url(${PLAY_BUTTON_IMAGE.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
          }}
        />
      </Grid>

      {/* Slider */}
      <Grid size={{ md: 10 }} sx={{ position: 'relative' }}>
        {/* Bubble über aktuellem Frame */}
        {hasFrames && (
          <Box
            sx={{
              position: 'absolute',
              top: -22,
              left: `${markerPct}%`,
              transform: 'translateX(-50%)',
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
            {clampedValue}
          </Box>
        )}

        {/* TRACK */}
        <Box
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          sx={(theme) => ({
            width: '100%',
            height: 40,
            position: 'relative',
            cursor: hasFrames ? 'pointer' : 'default',
            overflow: 'hidden',

            // alternierende Streifen pro Frame
            ...(hasFrames && {
              background: `
                repeating-linear-gradient(
                  90deg,
                  ${theme.palette.grey[600]} 0 calc(100% / ${frame_count}),
                  ${theme.palette.grey[700]} calc(100% / ${frame_count}) calc(200% / ${frame_count})
                )
              `,
            }),
          })}
        >
          {/* Marker-Linie */}
          {hasFrames && (
            <Box
              sx={(theme) => ({
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 2,
                left: `${markerPct}%`,
                transform: 'translateX(-50%)',
                bgcolor: theme.palette.primary.main,
                pointerEvents: 'none',
              })}
            />
          )}

          {/* Hover-Linie über dem Frame */}
          {hasFrames && hoverPct !== null && (
            <Box
              sx={(theme) => ({
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 2,
                left: `${hoverPct}%`,
                transform: 'translateX(-50%)',
                bgcolor: theme.palette.primary.main,
                pointerEvents: 'none',
              })}
            />
          )}
        </Box>
      </Grid>

      {/* Info rechts */}
      <Grid size={{ md: 1 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body2" noWrap>
          Frame: {clampedValue} [0 – {frame_count}]
        </Typography>
      </Grid>
    </Grid>
  );
}
