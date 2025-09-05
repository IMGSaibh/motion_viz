import { styled } from '@mui/material/styles';
import Slider, { SliderProps } from '@mui/material/Slider';

const StdSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-track': {
    backgroundColor: 'transparent',
    border: 'none',
  },
  '& .MuiSlider-rail': { opacity: 0 },
  '& .MuiSlider-valueLabel': {
    background: theme.palette.secondary.main,
    transform: 'translateY(-140%) scale(1)',
    pointerEvents: 'none',
  },
  '& .MuiSlider-thumb': {
    width: 4,
    height: 28,
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 0,
    boxShadow: 'none',
    outline: 'none',
    transition: 'none',
    '&::before, &::after': { content: '""', display: 'none' },
    '&:hover, &.Mui-active, &.Mui-focusVisible': { boxShadow: 'none' },
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
  return (
    <>
      <StdSlider
        value={props.std_slider_value}
        min={0}
        max={props.std_slider_framecount}
        ref={props.std_slider_reference}
        step={1}
        valueLabelDisplay="on"
        disableSwap={true}
        onChange={props.std_slider_on_change}
        onMouseLeave={props.std_slider_on_mouse_leave}
        onPointerMove={props.std_slider_on_pointer_move}
      />
    </>
  );
}
