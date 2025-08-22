import { styled, useTheme } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import { Box } from '@mui/material';
import { use_visited_context } from '@/context/context_slider_slider_list';

const LabelSlider = styled(Slider)(({ theme }) => ({
  zIndex: 1,
  '& .MuiSlider-track': { color: theme.palette.info.main },
  '& .MuiSlider-rail': { height: 4, backgroundColor: '#fff', opacity: 1 },
  '& .MuiSlider-valueLabel': { background: theme.palette.info.main, transform: 'translateY(-140%) scale(1)' },
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
}));

type Props = {
  label_slider_value: [number, number];
  label_slider_framecount: number;
  label_slider_on_change: (e: Event, value: number | number[], active_slider_hndl_idx: number) => void;
  label_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  label_slider_reference: React.RefObject<HTMLSpanElement | null>;
};

export function WidgetLabelSlider(props: Props) {
  const theme = useTheme();
  const visited = use_visited_context(); // << gespeicherte Bereiche

  const max = Math.max(0, props.label_slider_framecount);
  const clamp = (n: number) => Math.max(0, Math.min(n, max));

  const a = clamp(props.label_slider_value[0]);
  const b = clamp(props.label_slider_value[1]);
  const from = Math.min(a, b);
  const to = Math.max(a, b);
  const len = Math.max(0, to - from);

  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 10000) / 100 : 0); // runde für stabile Pixel
  const leftPct = pct(from, max);
  const scaleX = max > 0 ? Math.max(0, Math.round((len / max) * 10000) / 10000) : 0;

  const isRtl = theme.direction === 'rtl';

  return (
    <>
      <LabelSlider
        style={{ inset: 0, zIndex: 2 }}
        value={[from, to]}
        min={0}
        max={max}
        step={1}
        valueLabelDisplay="on"
        ref={props.label_slider_reference}
        onChange={props.label_slider_on_change}
        onMouseLeave={props.label_slider_on_mouse_leave}
      />

      {/* Unterer Layer: gespeicherte Bereiche + aktueller Bereich */}
      <Box
        sx={{
          position: 'relative',
          height: 10,
          mt: 0.75,
          overflow: 'hidden',
          background: theme.palette.action.hover,
        }}
        aria-hidden
      >
        {/* gespeicherte Bereiche */}
        {visited.map(({ id, from: vf, to: vt, color }) => {
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
                background: color ?? theme.palette.primary.main,
                pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* aktueller Bereich */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            transformOrigin: isRtl ? 'right center' : 'left center',
            transform: `scaleX(${scaleX})`,
            ...(isRtl ? { right: `${leftPct}%` } : { left: `${leftPct}%` }),
            background: theme.palette.primary.main,
            pointerEvents: 'none',
          }}
        />
      </Box>
    </>
  );
}
