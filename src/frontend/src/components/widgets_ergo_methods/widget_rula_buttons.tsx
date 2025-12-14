import { Box, ButtonBase, Grid, IconButton } from '@mui/material';
import {
  get_label_images_cat1_rula,
  get_label_images_cat2_rula,
  get_label_images_cat3_rula,
} from '@/Assets/label_images';
import { useMemo, useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';

import {
  use_add_slider_label_ctx,
  use_range_slider_value_cxt,
  use_can_save_label_cxt,
} from '@/context/context_slider_label_list';

type Props = {
  onClick?: (label: string, category: string) => void;
};

type Item = { src: string; label: string; category: string };

function CategoryGrid({
  title,
  items,
  selectedLabel,
  isEditing,
  onSelect,
  isLast,
}: {
  title: string;
  items: readonly Item[];
  selectedLabel: string | null;
  isEditing: boolean;
  onSelect: (item: Item) => void;
  isLast?: boolean;
}) {
  return (
    <Box
      sx={(theme) => ({
        borderRight: isLast ? 'none' : `1px solid ${theme.palette.wip_color_theme[200]}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Box sx={{ fontSize: 12, pb: 1, pt: 1 }}>{title}</Box>

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
                if (!isEditing) return;
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

  const [isEditing, setIsEditing] = useState(true);

  const [selected, setSelected] = useState<Record<string, Item | null>>({
    [cat1Key]: null,
    [cat2Key]: null,
    [cat3Key]: null,
  });

  const allSelected = Boolean(selected[cat1Key] && selected[cat2Key] && selected[cat3Key]);
  const can_save_label = use_can_save_label_cxt();
  const canSaveRula = can_save_label('RULA');

  const handleSelect = (item: Item) => {
    setSelected((prev) => ({ ...prev, [item.category]: item }));
  };

  const handleSave = () => {
    if (!allSelected) return;
    if (!canSaveRula) return;
    const s1 = selected[cat1Key]!;
    const s2 = selected[cat2Key]!;
    const s3 = selected[cat3Key]!;

    add_slider_label({
      id: uid(),
      from: Math.min(range[0], range[1]),
      to: Math.max(range[0], range[1]),
      label: `${s1.label} | ${s2.label} | ${s3.label}`,
      category: 'RULA',
    });

    // ✅ Reset: alles de-selectieren und von vorne beginnen
    setSelected({ [cat1Key]: null, [cat2Key]: null, [cat3Key]: null });
    setIsEditing(true);
  };

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
      })}
    >
      <Grid container spacing={0} wrap="nowrap" alignItems="stretch">
        <Grid size={{ md: 3 }} sx={{ height: '100%' }}>
          <CategoryGrid
            title="Kategorie Arm/Hand"
            items={cat1}
            selectedLabel={selected[cat1Key]?.label ?? null}
            isEditing={isEditing}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ height: '100%' }}>
          <CategoryGrid
            title="Kategorie Nacken/Rumpf/Beine"
            items={cat2}
            selectedLabel={selected[cat2Key]?.label ?? null}
            isEditing={isEditing}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ height: '100%' }}>
          <CategoryGrid
            title="Kategorie Zusatzfaktoren"
            items={cat3}
            selectedLabel={selected[cat3Key]?.label ?? null}
            isEditing={isEditing}
            onSelect={handleSelect}
          />
        </Grid>

        {/* Actions */}
        <Grid size={{ md: 3 }}>
          <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <IconButton
              size="small"
              aria-label="Save label"
              onClick={handleSave}
              disabled={!allSelected || !canSaveRula}
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
