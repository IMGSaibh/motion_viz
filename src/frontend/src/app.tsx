import { WidgetContainerSlider } from '@/containers/widget_container_slider';
import { WidgetContainerTopbar } from '@/containers/widget_container_topbar';
import { ThreeJSEngineProvider } from '@/context/context_three_js_engine';
import ThreeJSScene from '@/threeJS/three_js_scene';

export default function App() {
  return (
    <>
      <ThreeJSEngineProvider>
        <ThreeJSScene />
        <WidgetContainerTopbar />
        <WidgetContainerSlider />
      </ThreeJSEngineProvider>
    </>
  );
}
