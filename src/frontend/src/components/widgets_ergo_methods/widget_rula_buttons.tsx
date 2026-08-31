import { useMemo } from 'react';
import { create_label_category, uid } from '@/domain/label_logic';
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
import type { LabelImage, LabelCategory, ErgoLabel, RulaCategory } from '@/domain/datatypes';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { use_frame_slider_context } from '@/context/context_frame_slider';

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
  cat: RulaCategory;
  title: string;
  rula_button_images: readonly LabelImage[];
  selected_cat_image: string | null;
  onSelect: (slot: RulaCategory, img: LabelImage) => void;
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
  const label_images_cat_ua = useMemo(() => get_label_images_rula_cat_ua(), []);
  const label_images_cat_la = useMemo(() => get_label_images_rula_cat_la(), []);
  const label_images_cat_w = useMemo(() => get_label_images_rula_cat_w(), []);
  const label_images_cat_n = useMemo(() => get_label_images_rula_cat_n(), []);
  const label_images_cat_t = useMemo(() => get_label_images_rula_cat_t(), []);
  const label_images_cat_l = useMemo(() => get_label_images_rula_cat_l(), []);

  const { range, set_range } = use_frame_slider_context();

  const { rula_selected, set_rula_selected } = use_ergo_methods_cxt();
  const allSelected = Object.values(rula_selected).every(Boolean);

  const can_save_label = use_can_save_label_cxt();
  const canSaveRula = can_save_label('RULA');

  const handleSelect = (cat: RulaCategory, img: LabelImage) => {
    set_rula_selected({ ...rula_selected, [cat]: img });
  };

  const on_handle_save = () => {
    if (!allSelected) return;
    if (!canSaveRula) return;

    const categories: LabelCategory[] = [
      create_label_category(1, 'CAT_UPPERARM', rula_selected.CAT_UPPERARM!),
      create_label_category(2, 'CAT_LOWERARM', rula_selected.CAT_LOWERARM!),
      create_label_category(3, 'CAT_WRIST', rula_selected.CAT_WRIST!),
      create_label_category(4, 'CAT_NECK', rula_selected.CAT_NECK!),
      create_label_category(5, 'CAT_TRUNK', rula_selected.CAT_TRUNK!),
      create_label_category(6, 'CAT_LEGS', rula_selected.CAT_LEGS!),
    ];

    const from = Math.min(range[0], range[1]);
    const to = Math.max(range[0], range[1]);
    const label: ErgoLabel = {
      id: uid(),
      start_frame: from,
      end_frame: to,
      ergo_method: 'RULA',
      categories,
    };

    props.onClick?.(label);
    set_rula_selected({
      CAT_UPPERARM: null,
      CAT_LOWERARM: null,
      CAT_WRIST: null,
      CAT_NECK: null,
      CAT_TRUNK: null,
      CAT_LEGS: null,
    });
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
            selected_cat_image={rula_selected.CAT_UPPERARM?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_LOWERARM"
            title="Lower Arm"
            rula_button_images={label_images_cat_la}
            selected_cat_image={rula_selected.CAT_LOWERARM?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_WRIST"
            title="Wrist"
            rula_button_images={label_images_cat_w}
            selected_cat_image={rula_selected.CAT_WRIST?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_NECK"
            title="Neck"
            rula_button_images={label_images_cat_n}
            selected_cat_image={rula_selected.CAT_NECK?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>
        <Grid size={{ md: 2 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_TRUNK"
            title="Trunk"
            rula_button_images={label_images_cat_t}
            selected_cat_image={rula_selected.CAT_TRUNK?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 1 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_LEGS"
            title="Legs"
            rula_button_images={label_images_cat_l}
            selected_cat_image={rula_selected.CAT_LEGS?.name ?? null}
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
