import { Box, ButtonBase, Grid, IconButton } from '@mui/material';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import {
  get_label_images_cat1_owas,
  get_label_images_cat2_owas,
  get_label_images_cat3_owas,
  get_label_images_cat4_owas,
} from '@/Assets/label_images';
import ModeEditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import { useState } from 'react';

type Props = {
  onClick?: (label: string, category: string) => void;
};

function CategoryGrid({
  title,
  getItems,
  canSave,
  onClick,
  isLast,
}: {
  title: string;
  getItems: () => readonly {
    src: string;
    label: string;
    category: string;
  }[];
  canSave: (category: string) => boolean;
  onClick?: (label: string, category: string) => void;
  isLast?: boolean;
}) {
  const items = getItems();
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  return (
    <Box
      sx={(theme) => ({
        borderRight: isLast ? 'none' : `1px solid ${theme.palette.wip_color_theme[200]}`,
      })}
    >
      {/* Kategorie-Text */}
      <Box sx={{ fontSize: 12, pb: 1, pt: 1 }}>{title}</Box>

      {/* 3er Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
        }}
      >
        {items.map((item, i) => (
          <ButtonBase
            key={`${item.category}-${item.label}-${i}`}
            onClick={() => {
              if (selectedLabel) return;
              setSelectedLabel(item.label);
              onClick?.(item.label, item.category);
            }}
            disabled={!canSave(item.category)}
            sx={(theme) => {
              const isSelected = selectedLabel === item.label;
              const isdisbaled = selectedLabel !== null && !isSelected;

              return {
                border: 1,
                borderColor: theme.palette.wip_color_theme[300],
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                opacity: isdisbaled ? 0.4 : 1,
                pointerEvents: isdisbaled ? 'none' : 'auto',
              };
            }}
          >
            {/* Image */}
            <Box
              component="img"
              src={item.src}
              alt={item.label}
              sx={{
                height: 40,
                objectFit: 'contain',
                width: '100%',
                backgroundColor: 'white',
              }}
            />

            {/* Button Text */}
            <Box
              sx={{
                fontSize: 12,
                lineHeight: 1.2,
                borderColor: 'divider',
                width: '100%',
                textAlign: 'center',
                py: 0.5,
              }}
            >
              {item.label}
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}

export function WidgetOwasButtons({ onClick }: Props) {
  const can_save_label = use_can_save_label_cxt();

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
      })}
    >
      <Grid container spacing={0} wrap="nowrap">
        <Grid size={{ md: 2 }}>
          <CategoryGrid
            title="Kategorie Rücken"
            getItems={get_label_images_cat1_owas}
            canSave={can_save_label}
            onClick={onClick}
          />
        </Grid>

        <Grid size={{ md: 2 }}>
          <CategoryGrid
            title="Kategorie Arme"
            getItems={get_label_images_cat2_owas}
            canSave={can_save_label}
            onClick={onClick}
          />
        </Grid>

        <Grid size={{ md: 3 }}>
          <CategoryGrid
            title="Kategorie Beine"
            getItems={get_label_images_cat3_owas}
            canSave={can_save_label}
            onClick={onClick}
          />
        </Grid>
        <Grid size={{ md: 3 }}>
          <CategoryGrid
            title="Kategorie Last"
            getItems={get_label_images_cat4_owas}
            canSave={can_save_label}
            onClick={onClick}
          />
        </Grid>
        <Grid size={{ md: 2 }}>
          <Box
            sx={{
              mt: 0.5,
              display: 'flex',
              gap: 0.5,
              flexWrap: 'wrap',
              maxWidth: '100%',
              alignItems: 'center',
            }}
          >
            {2 === 2 ? (
              <>
                <IconButton
                  size="small"
                  aria-label="Save label"
                  sx={{ width: 28, height: 28, border: 1, borderRadius: 2, flexShrink: 0 }}
                >
                  <SaveIcon fontSize="inherit" />
                </IconButton>

                <IconButton
                  size="small"
                  aria-label="Delete label"
                  sx={{ width: 28, height: 28, border: 1, borderRadius: 2, flexShrink: 0 }}
                >
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Cancel label"
                  sx={{ width: 28, height: 28, border: 1, borderRadius: 2, flexShrink: 0 }}
                >
                  <ClearIcon fontSize="inherit" />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  size="small"
                  aria-label="Edit label"
                  sx={{ width: 28, height: 28, border: 1, borderRadius: 2, flexShrink: 0 }}
                >
                  <ModeEditIcon fontSize="inherit" />
                </IconButton>

                <IconButton
                  size="small"
                  aria-label="Delete label"
                  sx={{ width: 28, height: 28, border: 1, borderRadius: 2, flexShrink: 0 }}
                >
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
