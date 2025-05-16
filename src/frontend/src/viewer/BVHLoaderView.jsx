import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader";

export default function BVHLoaderView(scene) {
  const loader = new BVHLoader();
  loader.load("http://localhost:8000/static/bvh/test.bvh", (result) => {
    const skeletonHelper = result.skeletonHelper;
    skeletonHelper.skeleton.bones.forEach((bone) => {
      bone.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    });

    scene.add(skeletonHelper);
    scene.add(result.visualize.skeleton);
  });
}
