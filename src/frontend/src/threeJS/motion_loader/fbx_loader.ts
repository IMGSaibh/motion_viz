import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Text } from 'troika-three-text';

export class FBX_Loader {
  fbx_loader: FBXLoader;
  fbx_motion: THREE.Group | null;
  joints: THREE.Mesh[];
  mixer: THREE.AnimationMixer | null;
  clipAction: THREE.AnimationAction | null;
  skeletonHelper: THREE.SkeletonHelper | null;
  keyframeCount: number;
  duration: number;
  scene: THREE.Scene;

  // virtualMarkers: virtualMarker[] = [];

  //Text for visualizing vertex indices
  joint_size: number = 0.05;
  joint_indices_names: Text[] = [];
  joint_indices_names_text: THREE.Group = new THREE.Group();
  skinnedMesh: THREE.SkinnedMesh | null = null;

  constructor(scene: THREE.Scene) {
    this.fbx_loader = new FBXLoader();
    this.fbx_motion = new THREE.Group();
    this.joints = [];
    // this.virtualMarkers = [];
    this.fbx_motion.name = 'fbx_motion';
    this.mixer = null;
    this.clipAction = null;
    this.skeletonHelper = null;
    this.keyframeCount = 0;
    this.duration = 0;
    this.scene = scene;
  }


  async load_fbx_animation(fileUrl: string) {

    const result = await this.fbx_loader.loadAsync(fileUrl);
    if (this.fbx_motion) {
      this.fbx_motion.add(result);
      this.fbx_motion.name = fileUrl;
      console.log(`Loaded FBX animation from ${fileUrl}`);
    }
    console.log('FBX scaling details:');
    console.log(result.scale, result.rotation, result.position);
    

    console.log(result.animations);

    this.mixer = new THREE.AnimationMixer(result);
    this.clipAction = this.mixer.clipAction(result.animations[0]);
    this.duration = this.clipAction.getClip().duration;
    console.log(`Animation duration: ${this.duration} seconds`);

    this.keyframeCount = Math.round(this.clipAction.getClip().duration * 30); // Assuming 30 FPS, this is an estimate of total keyframes
    console.log(`Estimated keyframe count: ${this.keyframeCount}`);

    this.fbx_motion?.traverse((child) => {
      if(child.type === "SkinnedMesh"){
        this.skinnedMesh = child as THREE.SkinnedMesh;
        console.log(`Found SkinnedMesh: ${this.skinnedMesh.name}, Vertex Count: ${this.skinnedMesh.geometry.attributes.position.count}`);
      }
    });

    // const geoGroup = this.fbx_motion?.getObjectByName("rp_nathan_animated_003_walking_geoGRP");
    // const skinnedMesh = geoGroup?.getObjectByName("rp_nathan_animated_003_walking_geo") as THREE.SkinnedMesh;

    this.fbx_motion?.traverse((child) => {
      console.log(`Object: ${child.name}, Type: ${child.type}`);
    });

    if(this.skinnedMesh){
      const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      wireframe: true,
      vertexColors: false
      });

      this.skinnedMesh.material = material;
    }



    this.skeletonHelper = new THREE.SkeletonHelper(result);
    if (this.fbx_motion) {
      this.scene.add(this.fbx_motion);
    }

    const kinnectOneMarkers = [1, 3, 5, 15, 41, 16, 17, 20, 26, 29, 41, 42, 43, 45, 52, 55, 6, 7, 66, 67, 68, 69, 73, 74, 75, 76];
    const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const nonMarkerMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0x330000,
      roughness: 0.3,
      metalness: 0.1,
    });
    const markerMat = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x003300,
      roughness: 0.3,
      metalness: 0.1,
    });
    console.log('Number of Bones:')
    console.log(`SkeletonHelper has ${this.skeletonHelper?.bones.length} bones`);
    console.log(`SkinnedMesh has ${this.skinnedMesh?.skeleton.bones.length} bones`);

    // Visualize joints with spheres
    if(this.skinnedMesh) {
      this.skinnedMesh.skeleton.bones.forEach((bone, idx) => {
        const worldPos = bone.getWorldPosition(new THREE.Vector3());

        let sphere: THREE.Mesh | null = null;
        
        if(kinnectOneMarkers.includes(idx)){
          sphere = new THREE.Mesh(sphereGeometry, nonMarkerMat);
        }
        else sphere = new THREE.Mesh(sphereGeometry, nonMarkerMat);

        // Position the sphere at the bone's world position
        sphere.position.copy(worldPos);
        this.joints.push(sphere);
        this.scene.add(sphere);
      });
      // this.joints.forEach(joint => { this.scene.add(joint); });
      
      // Create text labels for each bone showing its index
      this.joint_indices_names = Array.from({ length: this.skinnedMesh.skeleton.bones.length }, () => new Text());
      console.log(this.skinnedMesh.skeleton.bones);
        this.skinnedMesh.skeleton.bones.forEach((bone, idx) => {
          const worldPos = bone.getWorldPosition(new THREE.Vector3());
          
          this.joint_indices_names[idx].text = String(idx);
          this.joint_indices_names[idx].fontSize = 2.0;
          this.joint_indices_names[idx].anchorX = 'center';
          this.joint_indices_names[idx].anchorY = 'middle';
          this.joint_indices_names[idx].color = 0xff0000;
          this.joint_indices_names[idx].position.set(worldPos.x, worldPos.y + 2, worldPos.z);
          this.joint_indices_names[idx].sync();
          
          this.joint_indices_names_text.add(this.joint_indices_names[idx] as unknown as THREE.Object3D);
        });
        
        this.scene.add(this.joint_indices_names_text);

        // this.createVertexLabels(this.skinnedMesh.geometry.attributes.position.count, this.skinnedMesh.geometry.attributes.position.array, 10);
      }
  }


  dispose() {
    if (!this.fbx_motion) return;
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }

    // free gpu‑ressources
    this.fbx_motion.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    this.joints.forEach(joint => joint.geometry.dispose());
    this.joints = [];
    this.skinnedMesh?.geometry.dispose();
    this.skinnedMesh = null;

    this.fbx_motion.clear();
    this.scene.remove(this.fbx_motion);
    this.clipAction = null;
    this.fbx_motion = null;
    this.skeletonHelper = null;
  }
}
