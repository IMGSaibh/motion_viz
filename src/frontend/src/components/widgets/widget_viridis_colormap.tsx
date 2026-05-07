import { Box, Grid } from '@mui/material';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist';

const COLOR_VALUES = Array.from({ length: 64 }, (_, index) => index);

export function WidgetColormap() {
  return (
    <Grid container spacing={0} justifyContent="center" alignItems="center">
      <Grid size={{ md: 10, xs: 12 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            pt: 1,
            pb: 0.5,
          }}
        >
          <Box
            sx={{
              width: 260,
              maxWidth: '42%',
              height: 14,
            }}
          >
            <Plot
              plotly={Plotly}
              data={[
                {
                  z: [COLOR_VALUES],
                  type: 'heatmap',
                  colorscale: [
                    [0, '#0080ff'],
                    [0.5, '#fffb00'],
                    [1, '#ff001e'],
                  ],
                  showscale: false,
                  hoverinfo: 'skip',
                },
              ]}
              layout={{
                width: 260,
                height: 14,
                margin: { l: 0, r: 0, t: 0, b: 0 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                xaxis: { visible: false, fixedrange: true },
                yaxis: { visible: false, fixedrange: true },
              }}
              config={{
                displayModeBar: false,
                staticPlot: true,
                responsive: true,
              }}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
