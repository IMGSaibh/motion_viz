import { ThreeJSEngine } from '@/context_three_js';

export default function ThreeJSScene() {
  const { three_js_scene_reference } = ThreeJSEngine();
  return <div id="scene-container" ref={three_js_scene_reference} />;
}
