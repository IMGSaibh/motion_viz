import * as React from 'react';
import { Box, ButtonBase, Grid, Typography } from '@mui/material';
import { PLAY_BUTTON_IMAGE } from '@/Assets/label_images';
import { PAUSE_BUTTON_IMAGE } from '@/Assets/label_images';
import { use_current_label_range_geometry_cxt } from '@/context/context_slider_label_list';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';

type Props = {
  frame_slider_value: number;
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
  const hasFrames = props.frame_count > 0;
  const clamped_frame = hasFrames ? Math.min(Math.max(props.frame_slider_value, 0), props.frame_count - 1) : 0;

  const markerPct = hasFrames ? ((clamped_frame + 0.5) / props.frame_count) * 100 : 0;
  const hoverPct =
    hasFrames && props.hover_frame !== null ? ((props.hover_frame + 0.5) / props.frame_count) * 100 : null;
  const currentLabelGeom = use_current_label_range_geometry_cxt(props.frame_count);
  const can_save_label = use_can_save_label_cxt();
  const canSaveRula = can_save_label('RULA');
  const canSaveOwas = can_save_label('OWAS');
  const hasOverlap = !canSaveRula || !canSaveOwas;

  const innerTrackRef = React.useRef<HTMLDivElement | null>(null);

  // TODO: remove useEffect
  React.useEffect(() => {
    if (!props.slider_track_ref) return;
    props.slider_track_ref.current = innerTrackRef.current;
  }, [props.slider_track_ref]);

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
        <ButtonBase
          onClick={props.on_click_play_toggle}
          sx={{
            width: '100%',
            height: '100%',
            minHeight: 40, // same hight as slider
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={(theme) => ({
              pointerEvents: 'none',
              width: 40,
              height: 40,
              cursor: 'pointer',
              backgroundImage: `url(${props.is_playing ? PAUSE_BUTTON_IMAGE.src : PLAY_BUTTON_IMAGE.src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
            })}
          ></Box>
        </ButtonBase>
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
          onMouseDown={props.on_mouse_down_slider_track}
          onMouseMove={props.on_mouse_move_slider_track}
          onMouseUp={props.on_mouse_up_slider_track}
          onMouseLeave={props.on_mouse_leave_slider_track}
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
                  ${theme.palette.wip_color_theme[300]} 0 calc(100% / ${props.frame_count}),
                  ${theme.palette.wip_color_theme[400]} calc(100% / ${props.frame_count}) calc(200% / ${props.frame_count})
                )
              `,
            }),
          })}
        >
          {/* transparent overlay for the current (unsaved) label-range */}
          {hasFrames && currentLabelGeom.scaleX > 0 && (
            <Box
              sx={(theme) => ({
                position: 'absolute',
                inset: 0,
                width: '100%',
                transformOrigin: theme.direction === 'rtl' ? 'right center' : 'left center',
                transform: `scaleX(${currentLabelGeom.scaleX})`,
                ...(theme.direction === 'rtl'
                  ? { right: `${currentLabelGeom.leftPct}%` }
                  : { left: `${currentLabelGeom.leftPct}%` }),
                backgroundColor: hasOverlap ? theme.palette.error.main : theme.palette.wip_color_theme[800],
                opacity: 0.4,
                pointerEvents: 'none',
              })}
            />
          )}
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
      <Grid
        size={{ md: 1 }}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'left' }}
      >
        <Typography variant="body2">
          Frame: {clamped_frame} <br /> Total: [0 – {props.frame_count}]
        </Typography>
      </Grid>
    </Grid>
  );
}
