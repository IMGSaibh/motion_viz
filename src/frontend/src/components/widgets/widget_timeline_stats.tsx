import { Box, Typography } from '@mui/material';

// import AccessTimeIcon from '@mui/icons-material/AccessTime';

type Props = {
  std_slider_value: number;
  std_slider_framecount: number;
};

export function WidgetTimelineStats(props: Props) {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 0, // avoid Layout-Push for long text lines
        }}
      >
        {/* <AccessTimeIcon fontSize="small" /> */}
        <Typography variant="body2" noWrap>
          &nbsp; Frame:&nbsp;{props.std_slider_value} &nbsp; [0 – {props.std_slider_framecount}]
        </Typography>
      </Box>
    </>
  );
}
