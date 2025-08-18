import { useState } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { WidgetStdSlider } from '../widgets/widget_std_slider';
import { WidgetLabelSlider } from '../widgets/widget_label_slider';
import { SliderListEntry, WidgetSliderList } from '../widgets/widget_slider_list';
import { styled } from '@mui/material/styles';
import btn1 from '@/Assets/Label_1.png';
import btn2 from '@/Assets/Label_2.png';
import btn3 from '@/Assets/Label_3.png';
import btn4 from '@/Assets/Label_4.png';

export const SLIDER_ITEMS: SliderListEntry[] = [
  { id: '1', label: 'Label_1', value: [10, 48] },
  { id: '2', label: 'Label_2', value: [312, 455] },
  { id: '3', label: 'Label_3', value: [121, 260] },
  { id: '4', label: 'Label_4', value: [578, 899] },
  { id: '5', label: 'Label_5', value: [10, 48] },
  { id: '6', label: 'Label_6', value: [312, 455] },
  { id: '7', label: 'Label_7', value: [121, 260] },
  { id: '8', label: 'Label_8', value: [578, 899] },
];

type ImageBtn = {
  src: string;
  label?: string;
  onClick?: () => void;
  selected?: boolean;
};

const ButtonImages = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '1 / 1',
  fit: 'cover',
  borderRadius: 8,
  overflow: 'hidden',
  color: theme.palette.primary.main,
  '& .MuiTouchRipple-root': { zIndex: 4 },
  '& .MuiTouchRipple-child': {
    backgroundColor: 'currentColor',
    opacity: 1,
  },
}));

type Props = {
  std_slider_value: number;
  std_slider_framecount: number;
  std_slider_reference: React.RefObject<HTMLSpanElement | null>;
  std_slider_on_change: (e: Event, value: number) => void;
  std_slider_on_mouse_move: (e: React.MouseEvent<HTMLSpanElement>) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;

  label_slider_value: [number, number];
  label_slider_framecount: number;
  label_slider_reference: React.RefObject<HTMLSpanElement | null>;
  label_slider_on_change: (e: Event, value: number | number[], active_slider_hndl_idx: number) => void;
  label_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
};

export function PresenterSlider(props: Props) {
  const buttons: ImageBtn[] = [{ src: btn1 }, { src: btn2 }, { src: btn3 }, { src: btn4 }];
  const [items, setItems] = useState<SliderListEntry[]>(SLIDER_ITEMS);
  return (
    <>
      <Box
        sx={(theme) => ({
          position: 'absolute',
          left: '1vw',
          right: '1vw',
          bottom: '1vw',
          p: '1rem',
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderRadius: '0.5rem',
        })}
      >
        {/* <Typography sx={{ whiteSpace: 'nowrap' }}>
        FRAME: {props.label_slider_value} / {props.label_slider_framecount}
      </Typography> */}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* overlay wrapper: sliders precisely on top of each other */}
          <Box
            sx={{
              position: 'relative',
              height: 56,
              bgcolor: 'background.paper',
              mb: '1vw',
              borderRadius: 2,
            }}
          >
            <WidgetStdSlider
              {...{
                std_slider_value: props.std_slider_value,
                std_slider_framecount: props.std_slider_framecount,
                std_slider_reference: props.std_slider_reference,
                std_slider_on_change: props.std_slider_on_change,
                std_slider_on_mouse_move: props.std_slider_on_mouse_move,
                std_slider_on_mouse_leave: props.std_slider_on_mouse_leave,
              }}
            />
            <WidgetLabelSlider
              {...{
                label_slider_value: props.label_slider_value,
                label_slider_framecount: props.label_slider_framecount,
                label_slider_reference: props.label_slider_reference,
                label_slider_on_change: props.label_slider_on_change,
                label_slider_on_mouse_leave: props.label_slider_on_mouse_leave,
              }}
            />
          </Box>
          {/* Box 4 image-buttons */}
          <Box
            sx={(theme) => ({
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 64px)',
              gap: 2,
              width: '100%',
              bgcolor: theme.palette.background.paper,
              p: '0.75vw',
              borderRadius: 2,
              mb: '1vw',
            })}
          >
            {buttons.slice(0, 4).map((button_lm, i) => (
              <ButtonImages key={i} onClick={button_lm.onClick}>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    backgroundImage: `url(${button_lm.src})`,
                    backgroundColor: 'white',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </ButtonImages>
            ))}
          </Box>
          <WidgetSliderList items={items} />
        </Box>
      </Box>
    </>
  );
}
