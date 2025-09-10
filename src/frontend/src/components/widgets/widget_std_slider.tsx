import { styled } from '@mui/material/styles';
import Slider, { SliderProps } from '@mui/material/Slider';

const StdSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-track': {
    backgroundColor: 'transparent',
    border: 'none',
  },
  '& .MuiSlider-rail': { opacity: 0 },
  '& .MuiSlider-valueLabel': {
    background: theme.palette.primary.main,
    transform: 'translateY(-140%) scale(1)',
    pointerEvents: 'none',
  },
  '& .MuiSlider-thumb': {
    width: 3,
    height: 28,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 0,
    boxShadow: 'none',
    outline: 'none',
    transition: 'none',
    '&::before, &::after': { content: '""', display: 'none' },
    '&:hover, &.Mui-active, &.Mui-focusVisible': { boxShadow: 'none' },
  },
  '& .MuiSlider-mark': {
    width: 1, // Liniendicke
    height: 5, // Länge der Linie
    borderRadius: 0,
    backgroundColor: 'white',
    top: -12, // Position unterhalb des Tracks
  },
}));
type Props = {
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change?: SliderProps['onChange'];
  std_slider_on_mouse_leave: SliderProps['onMouseLeave'];
  std_slider_on_pointer_move: SliderProps['onPointerMove'];
};

export function WidgetStdSlider(props: Props) {
  const frames = Number(props.std_slider_framecount) || 0;
  const hasFrames = frames > 0;

  // Wertebereich
  const min = 0;
  const max = hasFrames ? frames : 100;

  // nur jeden 5. Tick + Label
  const marks = hasFrames
    ? Array.from({ length: frames }, (_, i) => (i % 20 === 0 ? { value: i, label: String(i) } : { value: i }))
    : [
        { value: 0, label: '0' },
        { value: 25, label: '25' },
        { value: 50, label: '50' },
        { value: 75, label: '75' },
        { value: 100, label: '100' },
      ];

  // Wert sicher im Bereich halten (falls von außen größer/kleiner kommt)
  const value = Math.min(Math.max(props.std_slider_value ?? 0, min), max);

  return (
    <>
      <StdSlider
        value={props.std_slider_value}
        min={min}
        max={max}
        ref={props.std_slider_reference}
        step={1}
        marks={marks}
        valueLabelDisplay="on"
        disableSwap={true}
        onChange={props.std_slider_on_change}
        onMouseLeave={props.std_slider_on_mouse_leave}
        onPointerMove={props.std_slider_on_pointer_move}
      />
    </>
  );
}
