import { Box, ButtonBase, styled, FormControl, FormLabel, Grid, Select, MenuItem, InputLabel } from '@mui/material';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { get_label_images_cat1_llm } from '@/Assets/label_images';
import type { Label, LabelCategory } from '@/domain/datatypes';

const LabelButtonLMM = styled(ButtonBase)(({ theme }) => ({
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
  onClick?: (label: Label) => void;
};

export function WidgetLmmButtons({ onClick }: Props) {
  const can_save_label = use_can_save_label_cxt();
  const label_images_cat1 = get_label_images_cat1_llm();

  const category_1_llm = 'Kategorie LLM A (Arm/Hand)';
  const category_2_llm = 'Bestimmung der Wichtungen der weiteren Merkmale';
  const category_3_llm = 'Kategorie LLM C (sonstige)';

  const render_lmm_images = (items: typeof label_images_cat1) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 32px)',
        gap: 1,
        width: '100%',
        p: '0.2vw',
      }}
    >
      {items.map((imgButton, i) => (
        <LabelButtonLMM
          key={i}
          // onClick={() => onClick?.(imgButton.label, imgButton.category)}
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
        </LabelButtonLMM>
      ))}
    </Box>
  );
  return (
    <>
      {/* <Grid container spacing={0} alignItems="center" wrap="nowrap">
        <Grid size={{ md: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="scroll-select-label">Bestimmung der Zeitwichtung</InputLabel>
            <Select
              labelId="scroll-select-label"
              value={'value'}
              label="Bestimmung der Zeitwichtung"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200, // <== Scrollbar ab hier
                  },
                },
              }}
            >
              <MenuItem value="1">5</MenuItem>
              <MenuItem value="1.5">20</MenuItem>
              <MenuItem value="2">50</MenuItem>
              <MenuItem value="2.5">100</MenuItem>
              <MenuItem value="3">150</MenuItem>
              <MenuItem value="3.5">220</MenuItem>
              <MenuItem value="4">300</MenuItem>
              <MenuItem value="5">500</MenuItem>
              <MenuItem value="6">750</MenuItem>
              <MenuItem value="7">1000</MenuItem>
              <MenuItem value="8">1500</MenuItem>
              <MenuItem value="9">2000</MenuItem>
              <MenuItem value="10">2500</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ md: 5 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {category_2_llm}
            </FormLabel>
          </FormControl>
        </Grid>
        <Grid size={{ md: 5 }}>
          <FormControl
            component="fieldset"
            sx={{ width: '100%', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <FormLabel component="legend" sx={{ px: 0.75, ml: 1, lineHeight: 1.1, fontSize: 12 }}>
              {category_3_llm}
            </FormLabel>
            {render_lmm_images(label_images_cat1)}
          </FormControl>
        </Grid>
      </Grid> */}
      <Grid container spacing={0} alignItems="center" wrap="nowrap">
        <Grid size={{ md: 12 }}>
          <Box sx={{ height: '63px', fontSize: 14 }}>Not implemented yet</Box>
        </Grid>
      </Grid>
    </>
  );
}
