import { styled, useTheme } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import { Box } from '@mui/material';
import { use_range_marker_cxt } from '@/context/context_slider_label_list';
import { use_editing_label_id_cxt } from '@/context/context_slider_label_list';

const LabelSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-track': { color: theme.palette.info.main },
  '& .MuiSlider-rail': { height: 2, backgroundColor: '#fff', opacity: 1 },
  '& .MuiSlider-valueLabel': {
    background: theme.palette.info.main,

    transform: 'translateY(-140%) scale(1)',
  },
  '& .MuiSlider-thumb': {
    width: 10,
    height: 28,
    borderRadius: 0,
    background: 'transparent',
    boxShadow: 'none',
    outline: 'none',
    '&::before, &::after': { content: '""', display: 'none' },
  },
  '& .MuiSlider-thumb[data-index="0"]': {
    borderLeft: '4px solid white',
    borderTop: '4px solid white',
    borderBottom: '4px solid white',
  },
  '& .MuiSlider-thumb[data-index="1"]': {
    borderRight: '4px solid white',
    borderTop: '4px solid white',
    borderBottom: '4px solid white',
  },
  '& .MuiSlider-mark': {
    width: 1, // Liniendicke
    height: 10, // Länge der Linie
    borderRadius: 0,
    backgroundColor: 'white',
    top: 10, // Position unterhalb des Tracks
  },
}));

type Props = {
  label_slider_range: [number, number];
  label_slider_framecount: number;
  label_slider_reference: React.RefObject<HTMLSpanElement | null>;
};

function overlaps(aFrom: number, aTo: number, bFrom: number, bTo: number) {
  return aFrom < bTo && aTo > bFrom;
}

export function WidgetLabelSlider(props: Props) {
  const theme = useTheme();
  const saved_labels = use_range_marker_cxt();
  const editing_id = use_editing_label_id_cxt();

  const max = Math.max(0, props.label_slider_framecount);
  const clamp = (n: number) => Math.max(0, Math.min(n, max));

  const thumb_idx_0 = clamp(props.label_slider_range[0]);
  const thumb_idx_1 = clamp(props.label_slider_range[1]);
  const from = Math.min(thumb_idx_0, thumb_idx_1);
  const to = Math.max(thumb_idx_0, thumb_idx_1);
  const length = Math.max(0, to - from);

  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 10000) / 100 : 0);
  const leftPct = pct(from, max);
  const scaleX = max > 0 ? Math.max(0, Math.round((length / max) * 10000) / 10000) : 0;

  const isRtl = theme.direction === 'rtl';

  const hasOverlap = saved_labels
    .filter((m) => m.id !== editing_id)
    .some(({ from: vf, to: vt }) => {
      const vvFrom = clamp(Math.min(vf, vt));
      const vvTo = clamp(Math.max(vf, vt));
      return overlaps(from, to, vvFrom, vvTo);
    });

  const frames = Number(props.label_slider_framecount) || 0;

  const marks = (() => {
    const step = 10;
    const out: { value: number }[] = [];
    for (let valueText = 0; valueText <= max; valueText += step) out.push({ value: valueText });

    if (max % step !== 0) out.push({ value: max }); // last tick
    return out;
  })();
  return (
    <>
      <LabelSlider
        value={[from, to]}
        min={0}
        max={max}
        step={1}
        marks={marks}
        valueLabelDisplay="on"
        ref={props.label_slider_reference}
      />

      {/* Layer underneath label slider: saved labels + current labels */}
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

          const vLeft = pct(vvFrom, max);
          const vScale = max > 0 ? Math.max(0, Math.round((vvLen / max) * 10000) / 10000) : 0;

          return (
            <Box
              key={id}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                transformOrigin: isRtl ? 'right center' : 'left center',
                transform: `scaleX(${vScale})`,
                ...(isRtl ? { right: `${vLeft}%` } : { left: `${vLeft}%` }),
                background: color ?? theme.palette.secondary.main,
                pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* current labels */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            transformOrigin: isRtl ? 'right center' : 'left center',
            transform: `scaleX(${scaleX})`,
            ...(isRtl ? { right: `${leftPct}%` } : { left: `${leftPct}%` }),
            background: hasOverlap ? theme.palette.error.main : theme.palette.primary.main,
            pointerEvents: 'none',
          }}
        />
      </Box>
    </>
  );
}
