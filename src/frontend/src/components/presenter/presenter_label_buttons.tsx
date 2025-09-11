import { Box, ButtonBase, styled } from '@mui/material';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { use_label_images_ctx } from '@/context/context_label_buttons';

const LabelButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '1 / 1',
  fit: 'cover',
  borderRadius: 2,
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
  const can_save = use_can_save_label_cxt();
  const label_images = use_label_images_ctx();
  return (
    <>
      <Box
        sx={(theme) => ({
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 64px)',
          gap: 1,
          width: '100%',
          borderRadius: 1,
          p: '0.2vw',
          mb: '1vw',
        })}
      >
        {label_images.map((imgButton, i) => (
          <LabelButton key={i} onClick={() => props.onClick?.(imgButton.label)} disabled={!can_save}>
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
          </LabelButton>
        ))}
      </Box>
    </>
  );
}
