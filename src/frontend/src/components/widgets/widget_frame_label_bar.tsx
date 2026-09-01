import { theme } from '@/theme';
import { Box, Grid } from '@mui/material';
import { overlaps } from '@/domain/label_logic';
import {
  use_current_label_range_geometry_cxt,
  use_get_labels_cxt,
  use_editing_label_id_cxt,
} from '@/context/context_slider_label_list';

type Props = {
  frame_count: number;
};
export function WidgetFrameLabelBar(props: Props) {
  // Saved labels and the transient editing range share the same frame-to-percentage coordinate system.
  const saved_labels = use_get_labels_cxt();
  const editing_id = use_editing_label_id_cxt();
  const isRtl = theme.direction === 'rtl';
  const currentGeom = use_current_label_range_geometry_cxt(props.frame_count);

  const clamp = (n: number) => Math.max(0, Math.min(n, props.frame_count));
  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 10000) / 100 : 0);
  const scaleX = props.frame_count > 0 ? Math.max(0, Math.round((length / props.frame_count) * 10000) / 10000) : 0;
  const has_overlap = saved_labels
    .filter((label) => label.id !== editing_id)
    .some(({ start_frame: vf, end_frame: vt }) => {
      const vvFrom = clamp(Math.min(vf, vt));
      const vvTo = clamp(Math.max(vf, vt));
      return overlaps(currentGeom.from, currentGeom.to, vvFrom, vvTo);
    });

  return (
    <>
      <Grid container spacing={0} alignItems="center">
        <Grid size={{ md: 1 }} />
        <Grid size={{ md: 10 }}>
          <Box
            sx={{
              position: 'relative',
              height: 10,
              overflow: 'hidden',
              background: theme.palette.action.hover,
            }}
            aria-hidden
          >
            {/* Persisted labels remain visible independently of the transient range selection. */}
            {saved_labels.map(({ id, start_frame: start_frame, end_frame: end_frame }) => {
              const vvFrom = clamp(Math.min(start_frame, end_frame));
              const vvTo = clamp(Math.max(start_frame, end_frame));
              const vvLen = Math.max(0, vvTo - vvFrom + 1);

              const vLeft = pct(vvFrom, props.frame_count);
              const vScale =
                props.frame_count > 0 ? Math.max(0, Math.round((vvLen / props.frame_count) * 10000) / 10000) : 0;

              return (
                <Box
                  key={id}
                  className={id}
                  sx={(theme) => ({
                    bgcolor: theme.palette.wip_color_theme[600],
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    transformOrigin: isRtl ? 'right center' : 'left center',
                    transform: `scaleX(${vScale})`,
                    ...(isRtl ? { right: `${vLeft}%` } : { left: `${vLeft}%` }),
                    pointerEvents: 'none',
                  })}
                />
              );
            })}

            {/* The transient range previews a new label or the label currently being edited. */}
            <Box
              sx={(theme) => ({
                position: 'absolute',
                inset: 0,
                width: '100%',
                transformOrigin: isRtl ? 'right center' : 'left center',
                transform: `scaleX(${scaleX})`,
                ...(isRtl ? { right: `${currentGeom.leftPct}%` } : { left: `${currentGeom.leftPct}%` }),
                background: has_overlap ? theme.palette.error.main : theme.palette.wip_color_theme[600],
                pointerEvents: 'none',
              })}
            />
          </Box>
        </Grid>
        <Grid size={{ md: 1 }} />
      </Grid>
    </>
  );
}
