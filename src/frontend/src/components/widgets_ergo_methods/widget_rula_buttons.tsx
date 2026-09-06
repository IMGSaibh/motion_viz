import { useMemo } from 'react';
import {
  create_empty_rula_selection,
  create_label_category,
  create_label_category_with_features,
  uid,
} from '@/domain/label_logic';
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
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import type {
  LabelImage,
  LabelCategory,
  ErgoLabel,
  RulaCategory,
  Range,
  RulaFeatureSelection,
} from '@/domain/datatypes';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { use_frame_slider_context } from '@/context/context_frame_slider';

type Props = {
  onClick?: (label: ErgoLabel) => void;
};

function getSelectedImageNames(selection: RulaFeatureSelection, images: readonly LabelImage[]): string[] {
  return [selection.feature_id, ...selection.optional_feature_ids].flatMap((id) => {
    if (id === null) return [];
    const name = images[id - 1]?.name;
    return name ? [name] : [];
  });
}

function getSelectedFeatureIds(selection: RulaFeatureSelection): number[] {
  return [...(selection.feature_id ? [selection.feature_id] : []), ...selection.optional_feature_ids];
}

function CategoryGrid({
  cat,
  title,
  rula_button_images,
  selected_cat_images,
  onSelect,
  optionalStartIndex,
  isLast,
}: {
  cat: RulaCategory;
  title: string;
  rula_button_images: readonly LabelImage[];
  selected_cat_images: readonly string[];
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
          const isSelected = selected_cat_images.includes(item.name);
          const hasSelectedRequiredFeature = rula_button_images
            .slice(0, optionalStartIndex)
            .some((image) => selected_cat_images.includes(image.name));
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
 * Renders the RULA category controls and assembles a completed RULA label selection.
 *
 * Method-specific selection UI and conversion of selected images into RULA label categories
 * belong here. Shared in-progress selections remain in the ergonomic-method context, generic
 * overlap rules in the label context/domain layer, and storing the emitted label in the
 * label-buttons container.
 */
export function WidgetRulaButtons(props: Props) {
  const label_images_cat_ua = useMemo(() => get_label_images_rula_cat_ua(), []);
  const label_images_cat_la = useMemo(() => get_label_images_rula_cat_la(), []);
  const label_images_cat_w = useMemo(() => get_label_images_rula_cat_w(), []);
  const label_images_cat_n = useMemo(() => get_label_images_rula_cat_n(), []);
  const label_images_cat_t = useMemo(() => get_label_images_rula_cat_t(), []);
  const label_images_cat_l = useMemo(() => get_label_images_rula_cat_l(), []);

  const { range, frame_slider_value } = use_frame_slider_context();

  const { rula_selected, set_rula_selected } = use_ergo_methods_cxt();
  const allSelected =
    rula_selected.CAT_UPPERARM.feature_id !== null &&
    rula_selected.CAT_LOWERARM !== null &&
    rula_selected.CAT_WRIST.feature_id !== null &&
    rula_selected.CAT_NECK.feature_id !== null &&
    rula_selected.CAT_TRUNK.feature_id !== null &&
    rula_selected.CAT_LEGS !== null;

  const can_save_label = use_can_save_label_cxt();
  const effectiveRange: Range = range ?? [frame_slider_value, frame_slider_value];
  const canSaveRula = can_save_label('RULA', effectiveRange);

  const handleSelect = (cat: RulaCategory, featureId: number, isOptional: boolean) => {
    if (cat === 'CAT_UPPERARM' && isOptional) {
      const isSelected = rula_selected.CAT_UPPERARM.optional_feature_ids.includes(featureId);
      set_rula_selected({
        ...rula_selected,
        CAT_UPPERARM: {
          ...rula_selected.CAT_UPPERARM,
          optional_feature_ids: isSelected
            ? rula_selected.CAT_UPPERARM.optional_feature_ids.filter((id) => id !== featureId)
            : [...rula_selected.CAT_UPPERARM.optional_feature_ids, featureId],
        },
      });
      return;
    }
    if (cat === 'CAT_UPPERARM') {
      set_rula_selected({
        ...rula_selected,
        CAT_UPPERARM: { ...rula_selected.CAT_UPPERARM, feature_id: featureId },
      });
      return;
    }
    if (cat === 'CAT_WRIST') {
      const optionals = rula_selected.CAT_WRIST.optional_feature_ids;
      set_rula_selected({
        ...rula_selected,
        CAT_WRIST: isOptional
          ? {
              ...rula_selected.CAT_WRIST,
              optional_feature_ids: optionals.includes(featureId)
                ? optionals.filter((id) => id !== featureId)
                : [...optionals, featureId],
            }
          : { ...rula_selected.CAT_WRIST, feature_id: featureId },
      });
      return;
    }
    if (cat === 'CAT_NECK' || cat === 'CAT_TRUNK') {
      const selection = rula_selected[cat];
      set_rula_selected({
        ...rula_selected,
        [cat]: isOptional
          ? {
              ...selection,
              optional_feature_ids: selection.optional_feature_ids.includes(featureId)
                ? selection.optional_feature_ids.filter((id) => id !== featureId)
                : [...selection.optional_feature_ids, featureId],
            }
          : { ...selection, feature_id: featureId },
      });
      return;
    }
    set_rula_selected({ ...rula_selected, [cat]: featureId });
  };

  const on_handle_save = () => {
    if (!allSelected) return;
    if (!canSaveRula) return;

    const categories: LabelCategory[] = [
      create_label_category_with_features(1, 'CAT_UPPERARM', getSelectedFeatureIds(rula_selected.CAT_UPPERARM)),
      create_label_category(2, 'CAT_LOWERARM', rula_selected.CAT_LOWERARM!),
      create_label_category_with_features(3, 'CAT_WRIST', getSelectedFeatureIds(rula_selected.CAT_WRIST)),
      create_label_category_with_features(4, 'CAT_NECK', getSelectedFeatureIds(rula_selected.CAT_NECK)),
      create_label_category_with_features(5, 'CAT_TRUNK', getSelectedFeatureIds(rula_selected.CAT_TRUNK)),
      create_label_category(6, 'CAT_LEGS', rula_selected.CAT_LEGS!),
    ];

    const from = Math.min(effectiveRange[0], effectiveRange[1]);
    const to = Math.max(effectiveRange[0], effectiveRange[1]);
    const label: ErgoLabel = {
      id: uid(),
      start_frame: from,
      end_frame: to,
      ergo_method: 'RULA',
      categories,
    };

    props.onClick?.(label);
    set_rula_selected(create_empty_rula_selection());
  };

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
      })}
    >
      <Grid container spacing={0} wrap="nowrap" alignItems="stretch">
        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_UPPERARM"
            title="Upper Arm"
            rula_button_images={label_images_cat_ua}
            selected_cat_images={getSelectedImageNames(rula_selected.CAT_UPPERARM, label_images_cat_ua)}
            onSelect={handleSelect}
            optionalStartIndex={5}
          />
        </Grid>

        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_LOWERARM"
            title="Lower Arm"
            rula_button_images={label_images_cat_la}
            selected_cat_images={
              rula_selected.CAT_LOWERARM
                ? [label_images_cat_la[rula_selected.CAT_LOWERARM - 1]?.name].filter(
                    (name): name is string => name !== undefined,
                  )
                : []
            }
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_WRIST"
            title="Wrist"
            rula_button_images={label_images_cat_w}
            selected_cat_images={getSelectedImageNames(rula_selected.CAT_WRIST, label_images_cat_w)}
            onSelect={handleSelect}
            optionalStartIndex={3}
          />
        </Grid>

        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_NECK"
            title="Neck"
            rula_button_images={label_images_cat_n}
            selected_cat_images={getSelectedImageNames(rula_selected.CAT_NECK, label_images_cat_n)}
            onSelect={handleSelect}
            optionalStartIndex={4}
          />
        </Grid>
        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_TRUNK"
            title="Trunk"
            rula_button_images={label_images_cat_t}
            selected_cat_images={getSelectedImageNames(rula_selected.CAT_TRUNK, label_images_cat_t)}
            onSelect={handleSelect}
            optionalStartIndex={4}
          />
        </Grid>

        <Grid size={{ md: 1 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_LEGS"
            title="Legs"
            rula_button_images={label_images_cat_l}
            selected_cat_images={
              rula_selected.CAT_LEGS
                ? [label_images_cat_l[rula_selected.CAT_LEGS - 1]?.name].filter(
                    (name): name is string => name !== undefined,
                  )
                : []
            }
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
