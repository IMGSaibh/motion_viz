import ThreeJSScene from '@/threeJS/three_js_scene';
import { ContainerBottomUI } from './containers/container_bottom_ui';
import { ContainerTopbarUI } from '@/containers/container_topbar_ui';
import { ThreeJSEngineProvider } from '@/context/context_three_js_engine';
import { SliderLabelListProvider } from '@/context/context_slider_label_list';
import { SnackbarProvider } from '@/context/context_snackbar';

export default function App() {
  return (
    <>
      <SnackbarProvider>
        <ThreeJSEngineProvider>
          <ThreeJSScene />
          <SliderLabelListProvider>
            <ContainerTopbarUI />
            <ContainerBottomUI />
          </SliderLabelListProvider>
        </ThreeJSEngineProvider>
      </SnackbarProvider>
    </>
  );
}
