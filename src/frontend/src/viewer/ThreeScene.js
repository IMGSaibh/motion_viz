import * as THREE from "three";
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let mixer;

export function initThreeScene(canvas, sequence) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 1, 1000);
  camera.position.set(0, 150, 300);

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0xeeeeee);

  const controls = new OrbitControls(camera, canvas);

  const light = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(light);

  const gridHelper = new THREE.GridHelper(400, 40);
  scene.add(gridHelper);

  const loader = new BVHLoader();
  loader.load("http://localhost:8000/static/bvh/test.bvh", (result) => {
    const skeletonHelper = new THREE.SkeletonHelper(result.skeleton.bones[0]);
    skeletonHelper.skeleton = result.skeleton;

    scene.add(result.skeleton.bones[0]);
    scene.add(skeletonHelper);

    mixer = new THREE.AnimationMixer(result.skeleton.bones[0]);
    const clip = result.clip;
    const action = mixer.clipAction(clip);
    action.play();

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Optional: clip to sequence
      if (mixer && sequence) {
        const time = mixer.time;
        const fps = 30;
        const startTime = sequence.start / fps;
        const endTime = sequence.end / fps;

        if (time < startTime || time > endTime) {
          mixer.setTime(startTime);
        }

        mixer.update(delta);
      }

      renderer.render(scene, camera);
    }

    animate();
  });
}
