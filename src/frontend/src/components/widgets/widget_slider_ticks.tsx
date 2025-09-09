import { Box } from '@mui/material';

type Props = {
  std_slider_framecount: number;
};

export function WidgetSliderTicks({ std_slider_framecount }: Props) {
  const MINOR_EVERY = 10; // alle 10 Frames
  const MAJOR_EVERY = 100; // alle 100 Frames
  const MINOR_HEIGHT = '10%'; // von oben bis 10%
  const MAJOR_HEIGHT = '40%'; // von oben bis 80%

  return (
    <Box
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',

        // Optional: oben/unten dünn, links/rechts dicke Außenlinien
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderLeft: '2px solid',
        borderRight: '2px solid',
        borderTopColor: 'divider',
        borderBottomColor: 'divider',
        borderLeftColor: 'currentColor',
        borderRightColor: 'currentColor',

        // Farbe für alle Linien
        color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.65)' : theme.palette.divider,

        // Vertikale Linien (Major/Minor) – jeweils am Kachel-Anfang ein Strich
        backgroundImage: `
          linear-gradient(to right, currentColor 0 2px, transparent 0), /* major */
          linear-gradient(to right, currentColor 0 1px, transparent 0)  /* minor */
        `,
        backgroundRepeat: 'repeat-x, repeat-x',

        // WICHTIG: Von oben starten (nicht zentriert)
        backgroundPosition: 'left top, left top',

        // Breite = Schrittweite; Höhe = gewünschte Tick-Höhe (ab Top)
        backgroundSize: `
          calc(100% / var(--frames) * var(--major)) ${MAJOR_HEIGHT},
          calc(100% / var(--frames) * var(--minor)) ${MINOR_HEIGHT}
        `,
      })}
      style={{
        ['--frames' as any]: Math.max(0, std_slider_framecount) as any,
        ['--minor' as any]: MINOR_EVERY as any,
        ['--major' as any]: MAJOR_EVERY as any,
      }}
    />
  );
}
