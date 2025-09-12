import ThreeJSScene from '@/threeJS/three_js_scene';
import { ContainerBottomUI } from './containers/container_bottom_ui';
import { ContainerTopbarUI } from '@/containers/container_topbar_ui';
import { ThreeJSEngineProvider } from '@/context/context_three_js_engine';
import { SliderSliderlistProvider } from '@/context/context_slider_label_list';
import { SnackbarProvider } from '@/context/context_snackbar';
// import { LabelImageProvider } from '@/context/context_label_buttons';

export default function App() {
  return (
    <>
      <SnackbarProvider>
        <ThreeJSEngineProvider>
          <ThreeJSScene />
          <SliderSliderlistProvider>
            <ContainerTopbarUI />
            <ContainerBottomUI></ContainerBottomUI>
          </SliderSliderlistProvider>
        </ThreeJSEngineProvider>
      </SnackbarProvider>
    </>
  );
}
