import { Box } from '@mui/material';
import { LabelImage } from '@/Assets/label_images';

type Props = {
  label_image: LabelImage | null;
};

export function WidgetLabelPreview(props: Props) {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
      }}
      aria-label="Current label image preview"
    >
      {props.label_image ? (
        <Box
          component="img"
          src={props.label_image.src}
          alt={props.label_image.name}
          sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'white' }}
        />
      ) : (
        <Box sx={{ fontSize: 12, opacity: 0.6 }}>—</Box>
      )}
    </Box>
  );
}
