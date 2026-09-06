import { useMemo } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import {
  get_label_images_rula_cat_l,
  get_label_images_rula_cat_la,
  get_label_images_rula_cat_n,
  get_label_images_rula_cat_t,
  get_label_images_rula_cat_ua,
  get_label_images_rula_cat_w,
} from '@/Assets/label_images';
import { Box, ButtonBase, Grid, IconButton } from '@mui/material';
import type { LabelImage, RulaCategory, RulaFeatureSelection, RulaSelection } from '@/domain/datatypes';

type Props = {
  rula_selected: RulaSelection;
  on_rula_select: (cat: RulaCategory, featureId: number, isOptional: boolean) => void;
  on_rula_save_label: () => void;
  can_save_rula: boolean;
};

function getSelectedFeatureIds(selection: RulaFeatureSelection): number[] {
  return selection.feature_id === null
    ? selection.optional_feature_ids
    : [selection.feature_id, ...selection.optional_feature_ids];
}

function RulaCategoryButtonsGrid({
  cat,
  title,
  rula_button_images,
  selected_feature_ids,
  onSelect,
  optionalStartIndex,
  isLast,
}: {
  cat: RulaCategory;
  title: string;
  rula_button_images: readonly LabelImage[];
  selected_feature_ids: readonly number[];
  onSelect: (slot: RulaCategory, featureId: number, isOptional: boolean) => void;
  optionalStartIndex?: number;
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
      <Box
        sx={{
          fontSize: 12,
          pb: 1,
          pt: 1,
          textAlign: 'center',
        }}
      >
        {title}
      </Box>

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
          const isOptional = optionalStartIndex !== undefined && i >= optionalStartIndex;
          const isSelected = selected_feature_ids.includes(i + 1);
          const hasSelectedRequiredFeature = rula_button_images
            .slice(0, optionalStartIndex)
            .some((_, imageIndex) => selected_feature_ids.includes(imageIndex + 1));
          const isDimmed = !isOptional && hasSelectedRequiredFeature && !isSelected;
          return (
            <ButtonBase
              key={`${item.category}-${item.name}-${i}`}
              onClick={() => onSelect(cat, i + 1, isOptional)}
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
              <Box sx={{ alignSelf: 'flex-start', fontSize: 10, px: 0.5 }}>{i + 1}</Box>
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
 * Renders the RULA category controls and forwards user actions to its container.
 * Selection rules, range validation, and label construction belong in the container.
 */
export function WidgetRulaButtons(props: Props) {
  const label_images_cat_ua = useMemo(() => get_label_images_rula_cat_ua(), []);
  const label_images_cat_la = useMemo(() => get_label_images_rula_cat_la(), []);
  const label_images_cat_w = useMemo(() => get_label_images_rula_cat_w(), []);
  const label_images_cat_n = useMemo(() => get_label_images_rula_cat_n(), []);
  const label_images_cat_t = useMemo(() => get_label_images_rula_cat_t(), []);
  const label_images_cat_l = useMemo(() => get_label_images_rula_cat_l(), []);

  const { rula_selected } = props;
  const allSelected =
    rula_selected.CAT_UPPERARM.feature_id !== null &&
    rula_selected.CAT_LOWERARM !== null &&
    rula_selected.CAT_WRIST.feature_id !== null &&
    rula_selected.CAT_NECK.feature_id !== null &&
    rula_selected.CAT_TRUNK.feature_id !== null &&
    rula_selected.CAT_LEGS !== null;

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
      })}
    >
      <Grid container spacing={0} wrap="nowrap" alignItems="stretch">
        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <RulaCategoryButtonsGrid
            cat="CAT_UPPERARM"
            title="Upper Arm"
            rula_button_images={label_images_cat_ua}
            selected_feature_ids={getSelectedFeatureIds(rula_selected.CAT_UPPERARM)}
            onSelect={props.on_rula_select}
            optionalStartIndex={5}
          />
        </Grid>

        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <RulaCategoryButtonsGrid
            cat="CAT_LOWERARM"
            title="Lower Arm"
            rula_button_images={label_images_cat_la}
            selected_feature_ids={rula_selected.CAT_LOWERARM ? [rula_selected.CAT_LOWERARM] : []}
            onSelect={props.on_rula_select}
          />
        </Grid>

        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <RulaCategoryButtonsGrid
            cat="CAT_WRIST"
            title="Wrist"
            rula_button_images={label_images_cat_w}
            selected_feature_ids={getSelectedFeatureIds(rula_selected.CAT_WRIST)}
            onSelect={props.on_rula_select}
            optionalStartIndex={3}
          />
        </Grid>

        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <RulaCategoryButtonsGrid
            cat="CAT_NECK"
            title="Neck"
            rula_button_images={label_images_cat_n}
            selected_feature_ids={getSelectedFeatureIds(rula_selected.CAT_NECK)}
            onSelect={props.on_rula_select}
            optionalStartIndex={4}
          />
        </Grid>
        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <RulaCategoryButtonsGrid
            cat="CAT_TRUNK"
            title="Trunk"
            rula_button_images={label_images_cat_t}
            selected_feature_ids={getSelectedFeatureIds(rula_selected.CAT_TRUNK)}
            onSelect={props.on_rula_select}
            optionalStartIndex={4}
          />
        </Grid>

        <Grid size={{ md: 1 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <RulaCategoryButtonsGrid
            cat="CAT_LEGS"
            title="Legs"
            rula_button_images={label_images_cat_l}
            selected_feature_ids={rula_selected.CAT_LEGS ? [rula_selected.CAT_LEGS] : []}
            onSelect={props.on_rula_select}
          />
        </Grid>

        {/* Save Button */}
        <Grid size={{ md: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IconButton
              size="small"
              aria-label="Save label"
              onClick={props.on_rula_save_label}
              disabled={!allSelected || !props.can_save_rula}
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
