import { Box, ButtonBase, Grid, IconButton } from '@mui/material';
import {
  get_label_images_cat1_rula,
  get_label_images_cat2_rula,
  get_label_images_cat3_rula,
} from '@/Assets/label_images';
import { useMemo } from 'react';
import SaveIcon from '@mui/icons-material/Save';

import {
  use_add_slider_label_ctx,
  use_range_slider_value_cxt,
  use_can_save_label_cxt,
  use_rula_selected_cxt,
  use_set_rula_selected_cxt,
  use_clear_rula_selected_cxt,
} from '@/context/context_slider_label_list';

type Props = {
  onClick?: (label: string, category: string) => void;
};

type Item = { src: string; label: string; category: string };

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

export function WidgetRulaButtons(props: Props) {
  const add_slider_label = use_add_slider_label_ctx();
  const range = use_range_slider_value_cxt();

  const cat1 = useMemo(() => get_label_images_cat1_rula(), []);
  const cat2 = useMemo(() => get_label_images_cat2_rula(), []);
  const cat3 = useMemo(() => get_label_images_cat3_rula(), []);

  // category keys aus Items (stabil)
  const cat1Key = cat1[0]?.category ?? 'CAT1';
  const cat2Key = cat2[0]?.category ?? 'CAT2';
  const cat3Key = cat3[0]?.category ?? 'CAT3';

  const rula_selected = use_rula_selected_cxt();
  const set_rula_selected = use_set_rula_selected_cxt();
  const clear_rula_selected = use_clear_rula_selected_cxt();

  const allSelected = Boolean(rula_selected.CAT1 && rula_selected.CAT2 && rula_selected.CAT3);

  const can_save_label = use_can_save_label_cxt();
  const canSaveRula = can_save_label('RULA');

  const slotForCategory = (cat: string) => {
    if (cat === cat1Key) return 'CAT1' as const;
    if (cat === cat2Key) return 'CAT2' as const;
    return 'CAT3' as const;
  };
  const handleSelect = (item: Item) => {
    const slot = slotForCategory(item.category);
    set_rula_selected({ ...rula_selected, [slot]: item.label });
  };

  const handleSave = () => {
    if (!allSelected) return;
    if (!canSaveRula) return;

    add_slider_label({
      id: uid(),
      from: Math.min(range[0], range[1]),
      to: Math.max(range[0], range[1]),
      label: `${rula_selected.CAT1} | ${rula_selected.CAT2} | ${rula_selected.CAT3}`,
      category: 'RULA',
    });

    // ✅ danach wieder von vorne beginnen
    clear_rula_selected();
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
            title="Gruppe: Arm | Hand"
            items={cat1}
            selectedLabel={rula_selected.CAT1}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 4 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            title="Gruppe: Nacken | Rumpf | Beine"
            items={cat2}
            selectedLabel={rula_selected.CAT2}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            title="Gruppe: Muskelarbeit | Kraft"
            items={cat3}
            selectedLabel={rula_selected.CAT3}
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
