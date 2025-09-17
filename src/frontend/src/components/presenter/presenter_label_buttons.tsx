import { Box, ButtonBase, styled, FormControl, FormLabel, Grid } from '@mui/material';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { get_label_images_cat1, get_label_images_cat2, get_label_images_cat3 } from '@/Assets/label_images';

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
  onClick?: (label: string, category: string) => void;
};

export function PresenterLabelButtons({ onClick }: Props) {
  const can_save = use_can_save_label_cxt();
  const label_images_cat1 = get_label_images_cat1();
  const label_images_cat2 = get_label_images_cat2();
  const label_images_cat3 = get_label_images_cat3();

  const category_1 = 'Kategorie 1';
  const category_2 = 'Kategorie 2';
  const category_3 = 'Kategorie 3';

  const render_label_images = (
    items: typeof label_images_cat1 | typeof label_images_cat2 | typeof label_images_cat3,
  ) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 64px)',
        gap: 1,
        width: '100%',
        p: '0.2vw',
      }}
    >
      {items.map((imgButton, i) => (
        <LabelButton key={i} onClick={() => onClick?.(imgButton.label, imgButton.category)} disabled={!can_save}>
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
        <Grid size={{ md: 4 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {category_1}
            </FormLabel>
            {render_label_images(label_images_cat1)}
          </FormControl>
        </Grid>
        <Grid size={{ md: 4 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {category_2}
            </FormLabel>
            {render_label_images(label_images_cat2)}
          </FormControl>
        </Grid>
        <Grid size={{ md: 4 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {category_3}
            </FormLabel>
            {render_label_images(label_images_cat3)}
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
