import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';

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

export function WidgetLabelSlider(props: Props) {
  const max = Math.max(0, props.label_slider_framecount);
  const clamp = (n: number) => Math.max(0, Math.min(n, max));

  const thumb_idx_0 = clamp(props.label_slider_range[0]);
  const thumb_idx_1 = clamp(props.label_slider_range[1]);
  const from = Math.min(thumb_idx_0, thumb_idx_1);
  const to = Math.max(thumb_idx_0, thumb_idx_1);

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
    </>
  );
}
