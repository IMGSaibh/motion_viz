import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';

export default function ThreeJSScene() {
  const { threejs_scene_ref: three_js_scene_reference } = use_three_js_engine_ctx();
  return <div id="scene-container" ref={three_js_scene_reference} />;
}
