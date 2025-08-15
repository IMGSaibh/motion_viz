import { useThreeJSEngine } from '@/context_three_js_engine';

export default function ThreeJSScene() {
  const { threejs_scene_ref: three_js_scene_reference } = useThreeJSEngine();
  return <div id="scene-container" ref={three_js_scene_reference} />;
}
