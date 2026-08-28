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
import type { LabelImage, LabelCategory, ErgoLabel, OwasCategoryName } from '@/domain/datatypes';
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
  cat: OwasCategoryName;
  title: string;
  owas_button_images: readonly LabelImage[];
  selected_cat_images: string | null;
  onSelect: (slot: OwasCategoryName, img: LabelImage) => void;
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

export function WidgetOwasButtons(props: Props) {
  const label_images_cat1 = useMemo(() => get_label_images_cat1_owas(), []);
  const label_images_cat2 = useMemo(() => get_label_images_cat2_owas(), []);
  const label_images_cat3 = useMemo(() => get_label_images_cat3_owas(), []);
  const label_images_cat4 = useMemo(() => get_label_images_cat4_owas(), []);

  const { range, set_range } = use_frame_slider_context();

  const can_save_label = use_can_save_label_cxt();
  const { owas_selected, set_owas_selected } = use_ergo_methods_cxt();

  const allSelected = Object.values(owas_selected).every(Boolean);
  const canSaveOwas = can_save_label('OWAS');

  const handleSelect = (cat: OwasCategoryName, img: LabelImage) => {
    set_owas_selected({ ...owas_selected, [cat]: img });
  };

  const handleSave = () => {
    if (!allSelected) return;
    if (!canSaveOwas) return;

    const categories: LabelCategory[] = [
      create_label_category(1, 'CATEGORY_1', owas_selected.CATEGORY_1!),
      create_label_category(2, 'CATEGORY_2', owas_selected.CATEGORY_2!),
      create_label_category(3, 'CATEGORY_3', owas_selected.CATEGORY_3!),
      create_label_category(4, 'CATEGORY_4', owas_selected.CATEGORY_4!),
    ];

    const from = Math.min(range[0], range[1]);
    const to = Math.max(range[0], range[1]);
    const label: ErgoLabel = {
      id: uid(),
      start_frame: from,
      end_frame: to,
      ergo_method: 'OWAS',
      categories,
    };

    props.on_click_save_label?.(label);
    set_owas_selected({ CATEGORY_1: null, CATEGORY_2: null, CATEGORY_3: null, CATEGORY_4: null });
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
            cat="CATEGORY_1"
            title="Kategorie Rücken"
            owas_button_images={label_images_cat1}
            selected_cat_images={owas_selected.CATEGORY_1?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CATEGORY_2"
            title="Kategorie Arme"
            owas_button_images={label_images_cat2}
            selected_cat_images={owas_selected.CATEGORY_2?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CATEGORY_3"
            title="Kategorie Beine"
            owas_button_images={label_images_cat3}
            selected_cat_images={owas_selected.CATEGORY_3?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>
        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CATEGORY_4"
            title="Kategorie Last"
            owas_button_images={label_images_cat4}
            selected_cat_images={owas_selected.CATEGORY_4?.name ?? null}
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
