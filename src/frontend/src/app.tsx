import ThreeJSScene from '@/threeJS/three_js_scene';
import { ContainerTopbar } from '@/container/container_topbar';
import { ContainerFrameSlider } from './container/container_frame_slider';
import { ContainerBottomUI } from './container/container_bottom_ui';
import { ThreeJSEngineProvider } from '@/context/context_three_js_engine';
import { FrameSliderLabellistProvider } from '@/context/context_slider_label_list';
import { SnackbarProvider } from '@/context/context_snackbar';
import { Box } from '@mui/material';
import { ContainerLabels } from './container/container_labels';

export default function App() {
  return (
    <>
      <SnackbarProvider>
        <ThreeJSEngineProvider>
          <ThreeJSScene />
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
              <ContainerLabels />
              <ContainerBottomUI />
            </Box>
          </FrameSliderLabellistProvider>
        </ThreeJSEngineProvider>
      </SnackbarProvider>
    </>
  );
}
