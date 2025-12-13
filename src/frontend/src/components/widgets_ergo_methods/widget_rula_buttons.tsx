import { Box, ButtonBase, styled, FormControl, FormLabel, Grid } from '@mui/material';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import {
  get_label_images_cat1_rula,
  get_label_images_cat2_rula,
  get_label_images_cat3_rula,
} from '@/Assets/label_images';

const LabelButtonRula = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '1 / 1',
  fit: 'cover',
  borderRadius: 2,
  overflow: 'hidden',
  color: theme.palette.primary.main,
  '& .MuiTouchRipple-root': { zIndex: 4 },
  '& .MuiTouchRipple-child': { backgroundColor: 'currentColor', opacity: 1 },
  // Disabled-state: desaturate
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

export function WidgetRulaButtons({ onClick }: Props) {
  const can_save_label = use_can_save_label_cxt();
  const label_images_cat1 = get_label_images_cat1_rula();
  const label_images_cat2 = get_label_images_cat2_rula();
  const label_images_cat3 = get_label_images_cat3_rula();

  const category_1_rula = 'Kategorie Arm/Hand';
  const category_2_rula = 'Kategorie Nacken/Rumpf/Beine';
  const category_3_rula = 'Kategorie Zusatzfaktoren';

  const render_rula_images = (
    items: typeof label_images_cat1 | typeof label_images_cat2 | typeof label_images_cat3,
  ) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 32px)',
        gap: 1,
        width: '100%',
      }}
    >
      {items.map((imgButton, i) => (
        <LabelButtonRula
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
        </LabelButtonRula>
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
              {category_1_rula}
            </FormLabel>
            {render_rula_images(label_images_cat1)}
          </FormControl>
        </Grid>
        <Grid size={{ md: 4 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {category_2_rula}
            </FormLabel>
            {render_rula_images(label_images_cat2)}
          </FormControl>
        </Grid>
        <Grid size={{ md: 4 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {category_3_rula}
            </FormLabel>
            {render_rula_images(label_images_cat3)}
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
