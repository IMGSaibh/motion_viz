import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { PLAY_BUTTON_IMAGE } from '@/Assets/label_images';
import { PAUSE_BUTTON_IMAGE } from '@/Assets/label_images';

type Props = {
  slider_frame: number;
  frame_count: number;
  hover_frame: number | null;
  slider_track_ref: React.RefObject<HTMLDivElement | null>;

  on_mouse_down_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;
  on_mouse_move_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;
  on_mouse_up_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;
  on_mouse_leave_slider_track?: (e: React.MouseEvent<HTMLDivElement>) => void;

  is_playing: boolean;
  on_click_play_toggle?: () => void;
};

export function WidgetFrameSlider(props: Props) {
  const {
    slider_frame: slider_frame,
    frame_count,
    hover_frame,
    slider_track_ref: track_ref,
    on_mouse_down_slider_track: on_mouse_down,
    on_mouse_move_slider_track: on_mouse_move,
    on_mouse_up_slider_track: on_mouse_up,
    on_mouse_leave_slider_track: on_mouse_leave,
    is_playing,
    on_click_play_toggle,
  } = props;

  const hasFrames = frame_count > 0;
  const clamped_frame = hasFrames ? Math.min(Math.max(slider_frame, 0), frame_count - 1) : 0;

  const markerPct = hasFrames ? ((clamped_frame + 0.5) / frame_count) * 100 : 0;
  const hoverPct = hasFrames && hover_frame !== null ? ((hover_frame + 0.5) / frame_count) * 100 : null;

  const innerTrackRef = React.useRef<HTMLDivElement | null>(null);

  // TODO: remove useEffect
  React.useEffect(() => {
    if (!track_ref) return;
    track_ref.current = innerTrackRef.current;
  }, [track_ref]);

  return (
    <Grid
      container
      spacing={0}
      alignItems="center"
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
      })}
    >
      <Grid size={{ md: 1 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box
          onClick={on_click_play_toggle}
          sx={(theme) => ({
            width: 40,
            height: 40,
            cursor: 'pointer',
            backgroundImage: `url(${is_playing ? PAUSE_BUTTON_IMAGE.src : PLAY_BUTTON_IMAGE.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
          })}
        />
      </Grid>

      {/* Slider-Track */}
      <Grid size={{ md: 10 }} sx={{ position: 'relative' }}>
        {/* Bubble above current frame */}
        <Box
          sx={(theme) => ({
            position: 'absolute',
            top: -25,
            left: `${markerPct}%`,
            transform: 'translateX(-50%)',
            bgcolor: theme.palette.wip_color_theme[700],
            color: 'white',
            px: 1,
            py: 0.3,
            fontSize: 12,
            pointerEvents: 'none',
          })}
        >
          {clamped_frame}
        </Box>

        {/* Track with stripe per frame */}
        <Box
          ref={innerTrackRef}
          onMouseDown={on_mouse_down}
          onMouseMove={on_mouse_move}
          onMouseUp={on_mouse_up}
          onMouseLeave={on_mouse_leave}
          sx={(theme) => ({
            width: '100%',
            height: 40,
            position: 'relative',
            cursor: hasFrames ? 'pointer' : 'default',
            overflow: 'hidden',
            ...(hasFrames && {
              background: `
                repeating-linear-gradient(
                  90deg,
                  ${theme.palette.wip_color_theme[300]} 0 calc(100% / ${frame_count}),
                  ${theme.palette.wip_color_theme[400]} calc(100% / ${frame_count}) calc(200% / ${frame_count})
                )
              `,
            }),
          })}
        >
          {/* mark-line for current frame */}
          {hasFrames && (
            <Box
              sx={(theme) => ({
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 2,
                left: `${markerPct}%`,
                transform: 'translateX(-50%)',
                bgcolor: theme.palette.wip_color_theme[700],
                pointerEvents: 'none',
              })}
            />
          )}

          {/* hover-line */}
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

      {/* Info right */}
      <Grid size={{ md: 1 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body2" noWrap>
          Frame: {clamped_frame} [0 – {frame_count}]
        </Typography>
      </Grid>
    </Grid>
  );
}
