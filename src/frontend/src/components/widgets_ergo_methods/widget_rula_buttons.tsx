import { useMemo } from 'react';
import { uid } from '@/domain/label_logic';
import SaveIcon from '@mui/icons-material/Save';
import {
  get_label_images_cat1_rula,
  get_label_images_cat2_rula,
  get_label_images_cat3_rula,
} from '@/Assets/label_images';
import { Box, ButtonBase, Grid, IconButton } from '@mui/material';
import { use_ergo_methods_context } from '@/context/contex_ergo_methods';
import type { LabelImage, LabelCategory, ErgoLabel } from '@/domain/datatypes';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { use_frame_slider_context } from '@/context/context_slider_frame';

type Props = {
  onClick?: (label: ErgoLabel) => void;
};

function CategoryGrid({
  cat,
  title,
  rula_button_images,
  selected_cat_image,
  onSelect,
  isLast,
}: {
  cat: 'CAT1' | 'CAT2' | 'CAT3';
  title: string;
  rula_button_images: readonly LabelImage[];
  selected_cat_image: string | null;
  onSelect: (slot: 'CAT1' | 'CAT2' | 'CAT3', img: LabelImage) => void;
  isLast?: boolean;
}) {
  return (
    <Box
      sx={(theme) => ({
        borderRight: isLast ? 'none' : `1px solid ${theme.palette.wip_color_theme[200]}`,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Box sx={{ fontSize: 12, pb: 1, pt: 1, textAlign: 'center' }}>{title}</Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          flexGrow: 1,
          alignContent: 'start',
        }}
      >
        {rula_button_images.map((item, i) => {
          const isSelected = selected_cat_image === item.name;
          const isDimmed = selected_cat_image !== null && !isSelected;
          return (
            <ButtonBase
              key={`${item.category}-${item.name}-${i}`}
              onClick={() => onSelect(cat, item)}
              sx={(theme) => ({
                border: `1px solid ${theme.palette.wip_color_theme[300]}`,
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                opacity: isDimmed ? 0.35 : 1,
                outline: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
                outlineOffset: -2,
              })}
            >
              <Box
                component="img"
                src={item.src}
                alt={item.name}
                sx={{
                  height: 40,
                  objectFit: 'contain',
                  width: '100%',
                  backgroundColor: 'white',
                  filter: isDimmed ? 'grayscale(1)' : 'none',
                }}
              />

              <Box
                sx={{
                  fontSize: 12,
                  lineHeight: 1.2,
                  width: '100%',
                  textAlign: 'center',
                  py: 0.5,
                }}
              >
                {item.name}
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

export function WidgetRulaButtons(props: Props) {
  const label_images_cat1 = useMemo(() => get_label_images_cat1_rula(), []);
  const label_images_cat2 = useMemo(() => get_label_images_cat2_rula(), []);
  const label_images_cat3 = useMemo(() => get_label_images_cat3_rula(), []);

  const { range, set_range } = use_frame_slider_context();

  const { rula_selected, set_rula_selected } = use_ergo_methods_context();
  const allSelected = Boolean(rula_selected.CAT1 && rula_selected.CAT2 && rula_selected.CAT3);

  const can_save_label = use_can_save_label_cxt();
  const canSaveRula = can_save_label('RULA');

  const handleSelect = (cat: 'CAT1' | 'CAT2' | 'CAT3', img: LabelImage) => {
    set_rula_selected({ ...rula_selected, [cat]: img });
  };

  const on_handle_save = () => {
    if (!allSelected) return;
    if (!canSaveRula) return;

    const categories: LabelCategory[] = [
      { name: 'CAT1', image: rula_selected.CAT1! },
      { name: 'CAT2', image: rula_selected.CAT2! },
      { name: 'CAT3', image: rula_selected.CAT3! },
    ];

    const from = Math.min(range[0], range[1]);
    const to = Math.max(range[0], range[1]);
    const labelText = categories.map((c) => c.image?.name ?? '').join(' | ');

    const label: ErgoLabel = {
      id: uid(),
      start_frame: from,
      end_frame: to,
      ergo_method: 'RULA',
      button_text: labelText,
      categories,
    };

    props.onClick?.(label);
    set_rula_selected({ CAT1: null, CAT2: null, CAT3: null });
  };

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
      })}
    >
      <Grid container spacing={0} wrap="nowrap" alignItems="stretch">
        <Grid size={{ md: 4 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT1"
            title="Gruppe: Arm | Hand"
            rula_button_images={label_images_cat1}
            selected_cat_image={rula_selected.CAT1?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 4 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT2"
            title="Gruppe: Nacken | Rumpf | Beine"
            rula_button_images={label_images_cat2}
            selected_cat_image={rula_selected.CAT2?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT3"
            title="Gruppe: Muskelarbeit | Kraft"
            rula_button_images={label_images_cat3}
            selected_cat_image={rula_selected.CAT3?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        {/* Save Button */}
        <Grid size={{ md: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IconButton
              size="small"
              aria-label="Save label"
              onClick={on_handle_save}
              disabled={!allSelected || !canSaveRula}
              sx={{ border: 1, borderRadius: 0 }}
            >
              <SaveIcon fontSize="large" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
