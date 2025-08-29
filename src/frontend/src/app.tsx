import { Box } from '@mui/material';
import ThreeJSScene from '@/threeJS/three_js_scene';
import { ContainerSlider } from './containers/container_slider';
import { ContainerTopbar } from '@/containers/container_topbar';
import { ContainerSliderList } from './containers/container_label_list';
import { ThreeJSEngineProvider } from '@/context/context_three_js_engine';
import { SliderSliderlistProvider } from '@/context/context_slider_label_list';
import { SnackbarProvider } from '@/context/context_snackbar';

export default function App() {
  return (
    <>
      <SnackbarProvider>
        <ThreeJSEngineProvider>
          <ThreeJSScene />
          <SliderSliderlistProvider>
            <ContainerTopbar />

            {/* bottom ui  */}
            <Box
              sx={(theme) => ({
                position: 'absolute',
                width: '100%',
                bottom: '0vw',
                p: '1rem',
                bgcolor: theme.palette.background.paper,
              })}
            >
              <ContainerSlider></ContainerSlider>
              <ContainerSliderList></ContainerSliderList>
            </Box>
          </SliderSliderlistProvider>
        </ThreeJSEngineProvider>
      </SnackbarProvider>
    </>
  );
}
