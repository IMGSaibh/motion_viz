import { useMemo } from 'react';
import { Box } from '@mui/material';
import { use_label_image_map_ctx } from '@/context/context_label_buttons';
import { use_label_cxt, use_std_slider_value_cxt } from '@/context/context_slider_label_list';

export function WidgetLabelPreview() {
  const labels = use_label_cxt();
  const frame = use_std_slider_value_cxt();
  const label_image_map = use_label_image_map_ctx();

  //load all images at the beginning. check performances
  const current_label_image = useMemo(() => {
    const hit = labels.find((m) => {
      const from = Math.min(m.from, m.to);
      const to = Math.max(m.from, m.to);
      return frame >= from && frame < to;
    });
    if (!hit?.label) return null;
    return label_image_map.get(hit.label) ?? null;
  }, [labels, frame, label_image_map]);

  return (
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: 2,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
      }}
      aria-label="Current label image preview"
    >
      {current_label_image ? (
        <Box
          component="img"
          src={current_label_image.src}
          alt={current_label_image.label}
          sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'white' }}
        />
      ) : (
        <Box sx={{ fontSize: 12, opacity: 0.6 }}>—</Box>
      )}
    </Box>
  );
}
