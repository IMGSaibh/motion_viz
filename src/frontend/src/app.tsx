import { Box } from '@mui/material';
import ThreeJSScene from '@/threeJS/three_js_scene';
import { ContainerSlider } from './containers/container_slider';
import { ContainerTopbar } from '@/containers/container_topbar';
import { ContainerSliderList } from './containers/container_label_list';
import { ThreeJSEngineProvider } from '@/context/context_three_js_engine';
import { SliderSliderlistProvider } from './context/context_slider_label_list';

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
          <SliderSliderlistProvider>
            <ContainerSlider></ContainerSlider>
            <ContainerSliderList></ContainerSliderList>
          </SliderSliderlistProvider>
        </Box>
      </ThreeJSEngineProvider>
    </>
  );
}
