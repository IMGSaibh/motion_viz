import { Box, ButtonBase, styled } from '@mui/material';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';

import btn1 from '@/Assets/Label_1.png';
import btn2 from '@/Assets/Label_2.png';
import btn3 from '@/Assets/Label_3.png';
import btn4 from '@/Assets/Label_4.png';

type LabelButtons = {
  src: string;
  label?: string;
};

const LabelButtons = styled(ButtonBase)(({ theme }) => ({
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
  onClick?: (label?: string) => void;
};

export function PresenterLabelButtons(props: Props) {
  const buttons: LabelButtons[] = [
    { src: btn1, label: 'Button_1' },
    { src: btn2, label: 'Button_2' },
    { src: btn3, label: 'Button_3' },
    { src: btn4, label: 'Button_4' },
  ];

  const canSave = use_can_save_label_cxt();

  return (
    <>
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
        {buttons.map((imgButton, i) => (
          <LabelButtons key={i} onClick={() => props.onClick?.(imgButton.label)} disabled={!canSave}>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                backgroundImage: `url(${imgButton.src})`,
                backgroundColor: 'white',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </LabelButtons>
        ))}
      </Box>
    </>
  );
}
