import {
  get_label_images_cat1_owas,
  get_label_images_cat2_owas,
  get_label_images_cat3_owas,
  get_label_images_cat4_owas,
} from '@/Assets/label_images';
import { useMemo } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import type { LabelImage, OwasCategory } from '@/domain/datatypes';
import { Box, ButtonBase, Grid, IconButton } from '@mui/material';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';

type Props = {
  on_owas_select: (cat: OwasCategory, featureId: number) => void;
  on_owas_save_label?: () => void;
  all_owas_selected: boolean;
  can_save_owas_label: boolean;
};

function CategoryGrid({
  cat,
  title,
  owas_button_images,
  selected_feature_id,
  onSelect,
  isLast,
}: {
  cat: OwasCategory;
  title: string;
  owas_button_images: readonly LabelImage[];
  selected_feature_id?: number | null;
  onSelect: (slot: OwasCategory, featureId: number) => void;
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
          const isSelected = selected_feature_id === i + 1;
          const isDimmed = selected_feature_id != null && !isSelected;
          return (
            <ButtonBase
              key={`${item.category}-${item.name}-${i}`}
              onClick={() => onSelect(cat, i + 1)}
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
  const { owas_selected } = use_ergo_methods_cxt();

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
            selected_feature_id={owas_selected.CAT_BACK}
            onSelect={props.on_owas_select}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_ARMS"
            title="Arms Category"
            owas_button_images={label_images_cat2}
            selected_feature_id={owas_selected.CAT_ARMS}
            onSelect={props.on_owas_select}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_LEGS"
            title="Legs Category"
            owas_button_images={label_images_cat3}
            selected_feature_id={owas_selected.CAT_LEGS}
            onSelect={props.on_owas_select}
          />
        </Grid>
        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_LOAD"
            title="Load Category"
            owas_button_images={label_images_cat4}
            selected_feature_id={owas_selected.CAT_LOAD}
            onSelect={props.on_owas_select}
          />
        </Grid>
        {/* Save Button */}
        <Grid size={{ md: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IconButton
              size="small"
              aria-label="Save label"
              onClick={props.on_owas_save_label}
              disabled={!props.all_owas_selected || !props.can_save_owas_label}
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
