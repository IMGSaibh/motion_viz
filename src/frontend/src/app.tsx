import { WidgetContainerSlider } from '@/containers/widget_container_slider';
import { WidgetContainerTopbar } from '@/containers/widget_container_topbar';
import { ThreeProvider } from '@/context_three_js';
import ThreeJSScene from '@/threeJS/three_js_scene';

export default function App() {
  return (
    <>
      <ThreeProvider>
        <ThreeJSScene />
        <WidgetContainerTopbar />
        <WidgetContainerSlider />
      </ThreeProvider>
    </>
  );
}
