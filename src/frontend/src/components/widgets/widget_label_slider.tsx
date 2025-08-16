import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';

const LabelSlider = styled(Slider)(({ theme }) => ({
  zIndex: 1,

  '& .MuiSlider-track': {
    color: theme.palette.primary.main,
  },
  '& .MuiSlider-rail': {
    height: 4,
    backgroundColor: '#fff',
    opacity: 1,
  },
  '& .MuiSlider-valueLabel': {
    background: theme.palette.primary.main,
    transform: 'translateY(-140%) scale(1)',
  },
  '& .MuiSlider-thumb': {
    width: 10,
    height: 28,
    borderRadius: 0,
    background: 'transparent',
    boxShadow: 'none',
    outline: 'none',

    '&::before, &::after': {
      content: '""',
      display: 'none',
    },

    // sicherheitshalber auch States neutralisieren
    // '&:hover, &.Mui-focusVisible, &.Mui-active': {
    //   boxShadow: 'none',
    //   outline: 'none',
    // },
  },

  // Linke/rechte Klammer
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
  return (
    <>
      <LabelSlider
        style={{ position: 'absolute', inset: 0, zIndex: 2 }}
        value={props.label_slider_value}
        min={0}
        max={props.label_slider_framecount}
        step={1}
        valueLabelDisplay="on"
        ref={props.label_slider_reference}
        onChange={props.label_slider_on_change}
        onMouseLeave={props.label_slider_on_mouse_leave}
      />
    </>
  );
}
