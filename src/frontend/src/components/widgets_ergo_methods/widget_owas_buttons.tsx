import {
  get_label_images_cat1_owas,
  get_label_images_cat2_owas,
  get_label_images_cat3_owas,
  get_label_images_cat4_owas,
} from '@/Assets/label_images';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { useMemo } from 'react';
import { create_label_category, uid } from '@/domain/label_logic';
import SaveIcon from '@mui/icons-material/Save';
import type { LabelImage, LabelCategory, ErgoLabel, OwasCategory, Range } from '@/domain/datatypes';
import { Box, ButtonBase, Grid, IconButton } from '@mui/material';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import { use_frame_slider_context } from '@/context/context_frame_slider';

type Props = {
  on_click_save_label?: (label: ErgoLabel) => void;
};

function CategoryGrid({
  cat,
  title,
  owas_button_images,
  selected_cat_images,
  onSelect,
  isLast,
}: {
  cat: OwasCategory;
  title: string;
  owas_button_images: readonly LabelImage[];
  selected_cat_images: string | null;
  onSelect: (slot: OwasCategory, img: LabelImage) => void;
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
        {owas_button_images.map((item, i) => {
          const isSelected = selected_cat_images === item.name;
          const isDimmed = selected_cat_images !== null && !isSelected;
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

/**
 * Renders the OWAS category controls and assembles a completed OWAS label selection.
 *
 * Keep OWAS-specific control layout and label-category mapping here. Shared method state is
 * provided by the ergonomic-method context, generic range validation by the label context,
 * and persistence of the emitted label by `ContainerLabelButtons`.
 */
export function WidgetOwasButtons(props: Props) {
  const label_images_cat1 = useMemo(() => get_label_images_cat1_owas(), []);
  const label_images_cat2 = useMemo(() => get_label_images_cat2_owas(), []);
  const label_images_cat3 = useMemo(() => get_label_images_cat3_owas(), []);
  const label_images_cat4 = useMemo(() => get_label_images_cat4_owas(), []);

  const { range, frame_slider_value } = use_frame_slider_context();

  const can_save_label = use_can_save_label_cxt();
  const { owas_selected, set_owas_selected } = use_ergo_methods_cxt();

  const allSelected = Object.values(owas_selected).every(Boolean);
  const effectiveRange: Range = range ?? [frame_slider_value, frame_slider_value];
  const canSaveOwas = can_save_label('OWAS', effectiveRange);

  const handleSelect = (cat: OwasCategory, img: LabelImage) => {
    set_owas_selected({ ...owas_selected, [cat]: img });
  };

  const handleSave = () => {
    if (!allSelected) return;
    if (!canSaveOwas) return;

    const categories: LabelCategory[] = [
      create_label_category(1, 'CAT_BACK', owas_selected.CAT_BACK!),
      create_label_category(2, 'CAT_ARMS', owas_selected.CAT_ARMS!),
      create_label_category(3, 'CAT_LEGS', owas_selected.CAT_LEGS!),
      create_label_category(4, 'CAT_LOAD', owas_selected.CAT_LOAD!),
    ];

    const from = Math.min(effectiveRange[0], effectiveRange[1]);
    const to = Math.max(effectiveRange[0], effectiveRange[1]);
    const label: ErgoLabel = {
      id: uid(),
      start_frame: from,
      end_frame: to,
      ergo_method: 'OWAS',
      categories,
    };

    props.on_click_save_label?.(label);
    set_owas_selected({ CAT_BACK: null, CAT_ARMS: null, CAT_LEGS: null, CAT_LOAD: null });
  };

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
      })}
    >
      <Grid container spacing={0} wrap="nowrap" alignItems="stretch">
        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_BACK"
            title="Back Category"
            owas_button_images={label_images_cat1}
            selected_cat_images={owas_selected.CAT_BACK?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_ARMS"
            title="Arms Category"
            owas_button_images={label_images_cat2}
            selected_cat_images={owas_selected.CAT_ARMS?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_LEGS"
            title="Legs Category"
            owas_button_images={label_images_cat3}
            selected_cat_images={owas_selected.CAT_LEGS?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>
        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_LOAD"
            title="Load Category"
            owas_button_images={label_images_cat4}
            selected_cat_images={owas_selected.CAT_LOAD?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>
        {/* Actions */}
        <Grid size={{ md: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IconButton
              size="small"
              aria-label="Save label"
              onClick={handleSave}
              disabled={!allSelected || !canSaveOwas}
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
