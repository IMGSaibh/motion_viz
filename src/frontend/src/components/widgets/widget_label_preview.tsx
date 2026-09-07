import { Box } from '@mui/material';
import type { LabelCategory, LabelImage } from '@/domain/datatypes';
import { get_label_image_by_feature_id } from '@/Assets/label_images';

type Props = {
  categories?: LabelCategory[];
  label_image?: LabelImage | null; // optional fallback
  ergo_method?: string;
};

/**
 * Displays a compact image preview for the features associated with one ergonomic label.
 *
 * This is a presentation-only widget: it selects a small display set from already prepared
 * image metadata. Feature selection and label construction belong in method-specific logic,
 * while preview sizing and arrangement belong here.
 */
export function WidgetLabelPreview(props: Props) {
  const categoryImages = (props.categories ?? []).flatMap((category) =>
    category.features.flatMap((feature) => {
      const image = get_label_image_by_feature_id(props.ergo_method, category.name, feature.id);
      return image ? [image] : [];
    }),
  );

  const imagesToShow =
    categoryImages.length > 0 ? categoryImages.slice(0, 4) : props.label_image ? [props.label_image] : [];

  return (
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: 1,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        display: 'grid',
        placeItems: imagesToShow.length <= 1 ? 'center' : undefined,
        gridTemplateColumns: imagesToShow.length > 1 ? 'repeat(2, 1fr)' : undefined,
        gridAutoRows: imagesToShow.length > 1 ? '1fr' : undefined,
        gap: imagesToShow.length > 1 ? 0.25 : 0,
        p: imagesToShow.length > 1 ? 0.25 : 0,
      }}
      aria-label="Current label image preview"
    >
      {imagesToShow.length > 0 ? (
        imagesToShow.map((img, idx) => (
          <Box
            key={`${img.name}-${idx}`}
            component="img"
            src={img.src}
            alt={img.name}
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: imagesToShow.length > 1 ? 'contain' : 'cover',
              backgroundColor: 'white',
              borderRadius: imagesToShow.length > 1 ? 0.5 : 0,
            }}
          />
        ))
      ) : (
        <Box sx={{ fontSize: 12, opacity: 0.6 }}>—</Box>
      )}
    </Box>
  );
}
