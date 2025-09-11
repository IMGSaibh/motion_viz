import { Box, ButtonBase, styled, FormControl, FormLabel, Grid } from '@mui/material';
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
  '& .MuiTouchRipple-child': { backgroundColor: 'currentColor', opacity: 1 },
}));

type Props = {
  onClick?: (label?: string) => void;
};

export function PresenterLabelButtons({ onClick }: Props) {
  const can_save = use_can_save_label_cxt();
  const label_images = use_label_images_ctx();

  const cat1Count = 4;
  const cat2Count = 4;

  const cat1Title = 'Kategorie 1';
  const cat2Title = 'Kategorie 2';

  const cat1 = label_images.slice(0, cat1Count);
  const cat2 = label_images.slice(cat1Count, cat1Count + cat2Count);

  const renderGrid = (items: typeof label_images) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 64px)', // wie bei dir; ggf. dynamisch machen
        gap: 1,
        width: '100%',
        p: '0.2vw',
      }}
    >
      {items.map((imgButton, i) => (
        <LabelButton key={i} onClick={() => onClick?.(imgButton.label)} disabled={!can_save}>
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
  );

  return (
    <>
      <Grid container spacing={0} alignItems="center" wrap="nowrap">
        <Grid size={{ md: 6 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {cat1Title}
            </FormLabel>
            {renderGrid(cat1)}
          </FormControl>
        </Grid>
        <Grid size={{ md: 6 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {cat2Title}
            </FormLabel>
            {renderGrid(cat2)}
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
