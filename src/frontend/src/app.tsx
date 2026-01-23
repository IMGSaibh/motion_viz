import { Box } from '@mui/material';
import ThreeJSScene from '@/threeJS/three_js_scene';
import { ContainerTopbar } from '@/container/container_topbar';
import { ContainerFrameSlider } from './container/container_frame_slider';
import { ContainerLabelsList } from './container/container_labels_list';
import { ThreeJSEngineProvider } from '@/context/context_three_js_engine';
import { FrameSliderLabellistProvider } from '@/context/context_slider_label_list';
import { SnackbarProvider } from '@/context/context_snackbar';
import { ContainerLabelButtons } from './container/container_label_buttons';
import { FrameSliderContexProvider } from './context/context_slider_frame';

export default function App() {
  return (
    <>
      <SnackbarProvider>
        <ThreeJSEngineProvider>
          <ThreeJSScene />
          <FrameSliderContexProvider>
            <FrameSliderLabellistProvider>
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
            </FrameSliderLabellistProvider>
          </FrameSliderContexProvider>
        </ThreeJSEngineProvider>
      </SnackbarProvider>
    </>
  );
}
