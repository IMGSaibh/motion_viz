import { theme } from '@/theme';
import { Box } from '@mui/material';
import { overlaps, use_range_marker_cxt } from '@/context/context_slider_label_list';
import { use_editing_label_id_cxt } from '@/context/context_slider_label_list';

type Props = {
  frame_count: number;
  frame_slider_range: [number, number];
};
export function WidgetFrameLabelBar(props: Props) {
  const saved_labels = use_range_marker_cxt();
  const editing_id = use_editing_label_id_cxt();

  const clamp = (n: number) => Math.max(0, Math.min(n, props.frame_count));

  const thumb_idx_0 = clamp(props.frame_slider_range[0]);
  const thumb_idx_1 = clamp(props.frame_slider_range[1]);

  const isRtl = theme.direction === 'rtl';
  const from = Math.min(thumb_idx_0, thumb_idx_1);
  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 10000) / 100 : 0);
  const leftPct = pct(from, props.frame_count);
  const to = Math.max(thumb_idx_0, thumb_idx_1);
  const length = Math.max(0, to - from);

  const scaleX = props.frame_count > 0 ? Math.max(0, Math.round((length / props.frame_count) * 10000) / 10000) : 0;

  const has_overlap = saved_labels
    .filter((label) => label.id !== editing_id)
    .some(({ from: vf, to: vt }) => {
      const vvFrom = clamp(Math.min(vf, vt));
      const vvTo = clamp(Math.max(vf, vt));
      return overlaps(from, to, vvFrom, vvTo);
    });

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          height: 10,
          overflow: 'hidden',
          background: theme.palette.action.hover,
        }}
        aria-hidden
      >
        {/* saved labels */}
        {saved_labels.map(({ id, from: vf, to: vt, color }) => {
          const vvFrom = clamp(Math.min(vf, vt));
          const vvTo = clamp(Math.max(vf, vt));
          const vvLen = Math.max(0, vvTo - vvFrom);

          const vLeft = pct(vvFrom, props.frame_count);
          const vScale =
            props.frame_count > 0 ? Math.max(0, Math.round((vvLen / props.frame_count) * 10000) / 10000) : 0;

          return (
            <Box
              key={id}
              sx={(theme) => ({
                bgcolor: theme.palette.wip_color_theme[600],
                position: 'absolute',
                inset: 0,
                width: '100%',
                transformOrigin: isRtl ? 'right center' : 'left center',
                transform: `scaleX(${vScale})`,
                ...(isRtl ? { right: `${vLeft}%` } : { left: `${vLeft}%` }),
                background: color ?? theme.palette.wip_color_theme[600],
                pointerEvents: 'none',
              })}
            />
          );
        })}

        {/* current labels */}
        <Box
          sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            width: '100%',
            transformOrigin: isRtl ? 'right center' : 'left center',
            transform: `scaleX(${scaleX})`,
            ...(isRtl ? { right: `${leftPct}%` } : { left: `${leftPct}%` }),
            background: has_overlap ? theme.palette.error.main : theme.palette.wip_color_theme[600],
            pointerEvents: 'none',
          })}
        />
      </Box>
    </>
  );
}
