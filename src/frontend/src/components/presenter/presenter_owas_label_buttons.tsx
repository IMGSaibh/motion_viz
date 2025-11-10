import { Box, ButtonBase, styled, FormControl, FormLabel, Grid } from '@mui/material';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { get_label_images_cat1_owas } from '@/Assets/label_images';

const LabelButtonOwas = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '1 / 1',
  fit: 'cover',
  borderRadius: 2,
  overflow: 'hidden',
  color: theme.palette.primary.main,
  '& .MuiTouchRipple-root': { zIndex: 4 },
  '& .MuiTouchRipple-child': { backgroundColor: 'currentColor', opacity: 1 },
  // ▼ Disabled-state: desaturate
  '&.Mui-disabled': {
    // desaturate image
    '& .btn-img': {
      filter: 'grayscale(1) contrast(0.15)',
    },
  },
}));

type Props = {
  onClick?: (label: string, category: string) => void;
};

export function PresenterOwasLabelButtons({ onClick }: Props) {
  const can_save_label = use_can_save_label_cxt();
  const label_images_cat1 = get_label_images_cat1_owas();

  const category_1_owas = 'Kategorie OWAS A (Arm/Hand)';
  const category_2_owas = 'Kategorie OWAS B (Nacken/Rumpf/Beine)';
  const category_3_owas = 'Kategorie OWAS C (sonstige)';

  const render_rula_label_images = (items: typeof label_images_cat1) => (
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
        <LabelButtonOwas
          key={i}
          onClick={() => onClick?.(imgButton.label, imgButton.category)}
          disabled={!can_save_label(imgButton.category)}
        >
          <Box
            className="btn-img"
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
        </LabelButtonOwas>
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
              {category_1_owas}
            </FormLabel>
            {render_rula_label_images(label_images_cat1)}
          </FormControl>
        </Grid>
        <Grid size={{ md: 4 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {category_2_owas}
            </FormLabel>
            {/* {render_rula_label_images(label_images_cat2)} */}
          </FormControl>
        </Grid>
        <Grid size={{ md: 4 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {category_3_owas}
            </FormLabel>
            {/* {render_rula_label_images(label_images_cat3)} */}
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
