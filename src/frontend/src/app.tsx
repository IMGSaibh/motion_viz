import { ContainerTopbar } from '@/containers/container_topbar';
import { ThreeJSEngineProvider } from '@/context/context_three_js_engine';
import ThreeJSScene from '@/threeJS/three_js_scene';
import { Box } from '@mui/material';
import { ContainerSliderList } from './containers/container_slider_list';
import { ContainerSlider } from './containers/container_slider';

export default function App() {
  return (
    <>
      <ThreeJSEngineProvider>
        <ThreeJSScene />
        <ContainerTopbar />

        {/* bottom ui  */}
        <Box
          sx={(theme) => ({
            position: 'absolute',
            left: '1vw',
            right: '1vw',
            bottom: '1vw',
            p: '1rem',
            bgcolor: theme.palette.background.paper,
          })}
        >
          <ContainerSlider></ContainerSlider>
          <ContainerSliderList></ContainerSliderList>
        </Box>
      </ThreeJSEngineProvider>
    </>
  );
}
