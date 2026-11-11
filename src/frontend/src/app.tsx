import { Box } from '@mui/material';
import ThreeJSScene from '@/threeJS/three_js_scene';
import { ContainerTopbar } from '@/container/container_topbar';
import { ContainerFrameSlider } from './container/container_frame_slider';
import { ContainerLabelsList } from './container/container_labels_list';
import { ThreeJSEngineProvider } from '@/context/context_three_js_engine';
import { FrameSliderLabellistProvider } from '@/context/context_slider_label_list';
import { SnackbarProvider } from '@/context/context_snackbar';
import { ContainerLabelButtons } from './container/container_label_buttons';
import { FrameSliderContexProvider } from './context/context_frame_slider';
import { ErgoMethodsContexProvider } from './context/contex_ergo_methods';
import { ContainerKeyboardShortcuts } from '@/container/container_keyboard_shortcuts';
import { RulaHotkeyProvider } from '@/context/context_rula_hotkeys';
import { useState, type KeyboardEvent, type PointerEvent } from 'react';

export default function App() {
  const [sidebarWidth, setSidebarWidth] = useState(() =>
    typeof window === 'undefined' ? 520 : Math.min(760, Math.max(420, window.innerWidth * 0.48)),
  );
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const resizeSidebarFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!isResizingSidebar) return;
    setSidebarWidth(Math.max(320, Math.min(window.innerWidth * 0.8, window.innerWidth - event.clientX)));
  };

  const resizeSidebarFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const maxWidth = Math.max(320, window.innerWidth * 0.8);
    const step = event.shiftKey ? 64 : 24;
    const nextWidth =
      event.key === 'ArrowLeft'
        ? sidebarWidth + step
        : event.key === 'ArrowRight'
          ? sidebarWidth - step
          : event.key === 'Home'
            ? 320
            : event.key === 'End'
              ? maxWidth
              : null;

    if (nextWidth === null) return;
    event.preventDefault();
    setSidebarWidth(Math.max(320, Math.min(maxWidth, nextWidth)));
  };

  return (
    <>
      {/* Providers are ordered by dependency: feature contexts may consume engine and slider state. */}
      <SnackbarProvider>
        <ThreeJSEngineProvider>
          <FrameSliderContexProvider>
            <ErgoMethodsContexProvider>
              <FrameSliderLabellistProvider>
                <RulaHotkeyProvider>
                  <ContainerKeyboardShortcuts />
                  {/* Containers own orchestration; presenters and widgets remain focused on rendering. */}
                  <ContainerTopbar />
                  <Box
                    sx={(theme) => ({
                      position: 'absolute',
                      top: { xs: 56, sm: 64 },
                      left: 0,
                      right: 0,
                      bottom: 104,
                      display: 'flex',
                      overflow: 'hidden',
                      zIndex: theme.zIndex.appBar - 1,
                    })}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        flex: '1 1 0',
                        minWidth: 0,
                        minHeight: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <ThreeJSScene />
                    </Box>
                    <Box
                      sx={(theme) => ({
                        position: 'relative',
                        flexShrink: 0,
                        width: { xs: '80vw', md: sidebarWidth },
                        maxWidth: '80vw',
                        boxSizing: 'border-box',
                        pl: { xs: 0, md: '8px' },
                        overflowY: 'auto',
                        bgcolor: theme.palette.background.paper,
                      })}
                    >
                      <Box
                        role="separator"
                        aria-label="Resize label sidebar"
                        aria-orientation="vertical"
                        aria-valuemin={320}
                        aria-valuemax={typeof window === 'undefined' ? 1200 : Math.floor(Math.max(320, window.innerWidth * 0.8))}
                        aria-valuenow={Math.round(sidebarWidth)}
                        tabIndex={0}
                        onKeyDown={resizeSidebarFromKeyboard}
                        onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
                          event.preventDefault();
                          event.currentTarget.setPointerCapture(event.pointerId);
                          setIsResizingSidebar(true);
                        }}
                        onPointerMove={resizeSidebarFromPointer}
                        onPointerUp={() => setIsResizingSidebar(false)}
                        onPointerCancel={() => setIsResizingSidebar(false)}
                        sx={(theme) => ({
                          position: 'absolute',
                          display: { xs: 'none', md: 'block' },
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: 8,
                          cursor: 'col-resize',
                          touchAction: 'none',
                          userSelect: 'none',
                          borderLeft: `2px solid ${theme.palette.divider}`,
                          '&:hover, &:focus-visible': { borderColor: theme.palette.primary.main },
                        })}
                      />
                      <ContainerLabelButtons />
                      <ContainerLabelsList />
                    </Box>
                  </Box>
                  <Box
                    sx={(theme) => ({
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: theme.zIndex.appBar - 1,
                    })}
                  >
                    <ContainerFrameSlider />
                  </Box>
                </RulaHotkeyProvider>
              </FrameSliderLabellistProvider>
            </ErgoMethodsContexProvider>
          </FrameSliderContexProvider>
        </ThreeJSEngineProvider>
      </SnackbarProvider>
    </>
  );
}
