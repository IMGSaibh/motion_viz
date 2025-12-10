import { Box, Grid, Typography } from '@mui/material';
import { PLAY_BUTTON_IMAGE } from '@/Assets/label_images';

type Props = {
  std_slider_value: number;
  frame_count: number;
  on_click_frame?: (frame: number) => void;
};

export function WidgetFrameSlider(props: Props) {
  return (
    <Grid container spacing={0} alignItems="center">
      <Grid
        size={{ md: 1 }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          className="btn-img"
          sx={{
            width: 40,
            height: 40,
            backgroundImage: `url(${PLAY_BUTTON_IMAGE.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
          }}
        />
      </Grid>
      <Grid size={{ md: 10 }} sx={{ position: 'relative' }}>
        {props.std_slider_value !== null && (
          <Box
            className="current-frame-rect"
            sx={{
              position: 'absolute',
              top: -22,
              left: `${((props.std_slider_value + 0.5) / props.frame_count) * 100}%`,
              transform: 'translateX(-50%)',
              bgcolor: 'grey.900',
              color: 'white',
              px: 1,
              py: 0.3,
              fontSize: 12,
              borderRadius: 1,
              pointerEvents: 'none',
            }}
          >
            {props.std_slider_value}
          </Box>
        )}
        <Box
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${props.frame_count}, 1fr)`,
            alignItems: 'center',
          }}
        >
          {Array.from({ length: props.frame_count }).map((_, index) => {
            const greyTone = index % 2 === 0 ? 'grey.600' : 'grey.700';
            const isActive = index === props.std_slider_value;
            return (
              <Box
                className={`frame-rect-${index}`}
                key={index}
                onClick={() => props.on_click_frame?.(index)}
                sx={{
                  height: 40,
                  bgcolor: isActive ? 'primary.main' : greyTone,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'primary.main',
                  },
                }}
              />
            );
          })}
        </Box>
      </Grid>

      <Grid
        size={{ md: 1 }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" noWrap>
          &nbsp; Frame:&nbsp;{props.std_slider_value} &nbsp; [0 – {props.frame_count}]
        </Typography>
      </Grid>
    </Grid>
  );
}
