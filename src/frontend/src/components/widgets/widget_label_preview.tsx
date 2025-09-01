import { Box } from '@mui/material';
import { useMemo } from 'react';
import { use_label_cxt, use_std_slider_value_cxt } from '@/context/context_slider_label_list';
import { use_label_asset_map_ctx } from '@/context/context_label_assets';

export function WidgetLabelPreview() {
  const labels = use_label_cxt();
  const frame = use_std_slider_value_cxt();
  const assetMap = use_label_asset_map_ctx();

  //load all images at the beginning. check performances
  const current = useMemo(() => {
    const hit = labels.find((m) => {
      const from = Math.min(m.from, m.to);
      const to = Math.max(m.from, m.to);
      return frame >= from && frame < to;
    });
    if (!hit?.label) return null;
    return assetMap.get(hit.label) ?? null;
  }, [labels, frame, assetMap]);

  return (
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: 1,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
      }}
      aria-label="Current label image preview"
    >
      {current ? (
        <Box
          component="img"
          src={current.src}
          alt={current.label}
          sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'white' }}
        />
      ) : (
        <Box sx={{ fontSize: 12, opacity: 0.6 }}>—</Box>
      )}
    </Box>
  );
}
