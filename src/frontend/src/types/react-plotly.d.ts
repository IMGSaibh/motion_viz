declare module 'react-plotly.js' {
  import type { ComponentType, CSSProperties } from 'react';

  type PlotProps = {
    plotly?: unknown;
    data?: unknown[];
    layout?: Record<string, unknown>;
    config?: Record<string, unknown>;
    style?: CSSProperties;
    className?: string;
  };

  const Plot: ComponentType<PlotProps>;

  export default Plot;
}

declare module 'plotly.js-dist' {
  const Plotly: unknown;

  export default Plotly;
}
