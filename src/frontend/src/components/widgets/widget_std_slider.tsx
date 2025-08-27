import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';

const StdSlider = styled(Slider)(({ theme }) => ({
  zIndex: 0,
  color: 'transparent',
  '& .MuiSlider-track': {
    backgroundColor: 'transparent',
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    width: 4,
    height: 28,
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 0,
    boxShadow: 'none',
    outline: 'none',
    transition: 'none',
  },
  '& .MuiSlider-valueLabel': {
    background: theme.palette.secondary.main,
    transform: 'translateY(-140%) scale(1)',
  },
}));
type Props = {
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change: (e: Event, new_value: number) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
};

export function WidgetStdSlider(props: Props) {
  return (
    <>
      <StdSlider
        style={{ position: 'absolute', inset: 0 }}
        value={props.std_slider_value}
        min={0}
        max={props.std_slider_framecount}
        ref={props.std_slider_reference}
        step={1}
        valueLabelDisplay="on"
        disableSwap={true}
        onMouseLeave={props.std_slider_on_mouse_leave}
      />
    </>
  );
}
