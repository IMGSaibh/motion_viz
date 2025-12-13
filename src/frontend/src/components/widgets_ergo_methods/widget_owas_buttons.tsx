import { Box, ButtonBase, styled, FormControl, FormLabel, Grid } from '@mui/material';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import {
  get_label_images_cat1_owas,
  get_label_images_cat2_owas,
  get_label_images_cat3_owas,
  get_label_images_cat4_owas,
} from '@/Assets/label_images';

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
            onClick={() => onClick?.(item.label, item.category)}
            disabled={!canSave(item.category)}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
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
        <Grid size={{ md: 3 }}>
          <CategoryGrid
            title="Kategorie Rücken"
            getItems={get_label_images_cat1_owas}
            canSave={can_save_label}
            onClick={onClick}
          />
        </Grid>

        <Grid size={{ md: 3 }}>
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
            isLast
          />
        </Grid>
      </Grid>
    </Box>
  );
}
