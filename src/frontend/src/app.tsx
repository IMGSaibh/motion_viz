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

export default function App() {
  return (
    <>
      {/* Providers are ordered by dependency: feature contexts may consume engine and slider state. */}
      <SnackbarProvider>
        <ThreeJSEngineProvider>
          <ThreeJSScene />
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
                      width: '100%',
                      bottom: '0vw',
                    })}
                  >
                    <ContainerFrameSlider />
                    <ContainerLabelButtons />
                    <ContainerLabelsList />
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
