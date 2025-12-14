import { Box, ButtonBase, Grid, IconButton } from '@mui/material';
import {
  get_label_images_cat1_owas,
  get_label_images_cat2_owas,
  get_label_images_cat3_owas,
  get_label_images_cat4_owas,
} from '@/Assets/label_images';
import SaveIcon from '@mui/icons-material/Save';
import { useMemo, useState } from 'react';
import {
  use_add_slider_label_ctx,
  use_range_slider_value_cxt,
  use_can_save_label_cxt,
  use_owas_selected_cxt,
  use_set_owas_selected_cxt,
  use_clear_owas_selected_cxt,
} from '@/context/context_slider_label_list';
type Item = { src: string; label: string; category: string };

type Props = {
  onClick?: (label: string, category: string) => void;
};

function CategoryGrid({
  title,
  items,
  selectedLabel,
  onSelect,
  isLast,
}: {
  title: string;
  items: readonly Item[];
  selectedLabel: string | null;
  onSelect: (item: Item) => void;
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
        {items.map((item, i) => {
          const isSelected = selectedLabel === item.label;
          const isDimmed = selectedLabel !== null && !isSelected;
          return (
            <ButtonBase
              key={`${item.category}-${item.label}-${i}`}
              onClick={() => {
                onSelect(item);
              }}
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
                alt={item.label}
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
                {item.label}
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

function uid() {
  // Browser: crypto.randomUUID; fallback wenn nicht vorhanden
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = typeof crypto !== 'undefined' ? crypto : null;
  return c?.randomUUID ? c.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function WidgetOwasButtons(props: Props) {
  const can_save_label = use_can_save_label_cxt();
  const range = use_range_slider_value_cxt();
  const add_slider_label = use_add_slider_label_ctx();

  const owas_selected = use_owas_selected_cxt();
  const set_owas_selected = use_set_owas_selected_cxt();
  const clear_owas_selected = use_clear_owas_selected_cxt();
  const allSelected = Boolean(owas_selected.CAT1 && owas_selected.CAT2 && owas_selected.CAT3 && owas_selected.CAT4);

  const cat1 = useMemo(() => get_label_images_cat1_owas(), []);
  const cat2 = useMemo(() => get_label_images_cat2_owas(), []);
  const cat3 = useMemo(() => get_label_images_cat3_owas(), []);
  const cat4 = useMemo(() => get_label_images_cat4_owas(), []);

  const cat1Key = cat1[0]?.category ?? 'CAT1';
  const cat2Key = cat2[0]?.category ?? 'CAT2';
  const cat3Key = cat3[0]?.category ?? 'CAT3';
  const cat4Key = cat4[0]?.category ?? 'CAT4';

  const slotForCategory = (cat: string) => {
    if (cat === cat1Key) return 'CAT1';
    if (cat === cat2Key) return 'CAT2';
    if (cat === cat3Key) return 'CAT3';
    return 'CAT4';
  };
  const handleSelect = (item: Item) => {
    const slot = slotForCategory(item.category);
    set_owas_selected({ ...owas_selected, [slot]: item.label });
  };

  const canSaveOwas = can_save_label('OWAS');

  const handleSave = () => {
    if (!allSelected) return;
    if (!canSaveOwas) return;

    add_slider_label({
      id: uid(),
      from: Math.min(range[0], range[1]),
      to: Math.max(range[0], range[1]),
      label: `${owas_selected.CAT1} | ${owas_selected.CAT2} | ${owas_selected.CAT3} | ${owas_selected.CAT4}`,
      category: 'OWAS',
    });

    clear_owas_selected();
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
            title="Kategorie Rücken"
            items={cat1}
            selectedLabel={owas_selected.CAT1}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            title="Kategorie Arme"
            items={cat2}
            selectedLabel={owas_selected.CAT2}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            title="Kategorie Beine"
            items={cat3}
            selectedLabel={owas_selected.CAT3}
            onSelect={handleSelect}
          />
        </Grid>
        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            title="Kategorie Last"
            items={cat4}
            selectedLabel={owas_selected.CAT4}
            onSelect={handleSelect}
          />
        </Grid>
        {/* Actions */}
        <Grid size={{ md: 1 }}>
          <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <IconButton
              size="small"
              aria-label="Save label"
              onClick={handleSave}
              disabled={!allSelected || !canSaveOwas}
              sx={{ width: 28, height: 28, border: 1, borderRadius: 0, flexShrink: 0 }}
            >
              <SaveIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
