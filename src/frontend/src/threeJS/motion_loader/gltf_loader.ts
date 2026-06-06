import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Text } from 'troika-three-text';

export class GLTF_Loader {
  gltf_loader: GLTFLoader;
  gltf_motion: THREE.Group | null;
  joints: THREE.Mesh[];
  mixer: THREE.AnimationMixer | null;
  clipAction: THREE.AnimationAction | null;
  skeletonHelper: THREE.SkeletonHelper | null;
  keyframeCount: number;
  duration: number;
  scene: THREE.Scene;
  skinnedMesh: THREE.SkinnedMesh | null = null;
  
  // For bone visualization
  joint_indices_names: Text[] = [];
  joint_indices_names_text: THREE.Group = new THREE.Group();

  constructor(scene: THREE.Scene) {
    this.gltf_loader = new GLTFLoader();
    this.gltf_motion = new THREE.Group();
    this.joints = [];
    this.gltf_motion.name = 'gltf_motion';
    this.mixer = null;
    this.clipAction = null;
    this.skeletonHelper = null;
    this.keyframeCount = 0;
    this.duration = 0;
    this.scene = scene;
  }

  async load_gltf_animation(fileUrl: string) {
    const result = await this.gltf_loader.loadAsync(fileUrl);
    
    if (this.gltf_motion) {
      this.gltf_motion.add(result.scene);
      this.gltf_motion.name = fileUrl;
      console.log(`Loaded GLTF animation from ${fileUrl}`);
    }
    
    console.log('GLTF scaling details:');
    console.log(result.scene.scale, result.scene.rotation, result.scene.position);
    
    // Handle animations if present
    if (result.animations && result.animations.length > 0) {
      console.log(`Found ${result.animations.length} animations:`, result.animations.map(a => a.name));
      
      this.mixer = new THREE.AnimationMixer(result.scene);
      this.clipAction = this.mixer.clipAction(result.animations[0]);
      this.duration = this.clipAction.getClip().duration;
      console.log(`Animation duration: ${this.duration} seconds`);
      
      this.keyframeCount = Math.round(this.duration * 30);
      console.log(`Estimated keyframe count: ${this.keyframeCount}`);
    } else {
      console.log('No animations found in GLTF file');
      this.duration = 0;
      this.keyframeCount = 0;
    }
    
    // Find skinned mesh
    result.scene.traverse((child) => {
      if (child.type === "SkinnedMesh") {
        this.skinnedMesh = child as THREE.SkinnedMesh;
        console.log(`Found SkinnedMesh: ${this.skinnedMesh.name}, Vertex Count: ${this.skinnedMesh.geometry.attributes.position.count}`);
      }
    });

    
    // Optional: Apply wireframe material to visualize mesh
    if (this.skinnedMesh) {
      const material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        wireframe: true,
        vertexColors: false
      });
      this.skinnedMesh.material = material;
    }
    
    // Create skeleton helper for visualization
    this.skeletonHelper = new THREE.SkeletonHelper(result.scene);
    
    // Add to scene
    if (this.gltf_motion) {
      this.scene.add(this.gltf_motion);
    }
    
    // Visualize bones with spheres
    if (this.skinnedMesh && this.skinnedMesh.skeleton) {
      console.log('Number of Bones:');
      console.log(`SkeletonHelper has ${this.skeletonHelper?.bones.length} bones`);
      console.log(`SkinnedMesh has ${this.skinnedMesh.skeleton.bones.length} bones`);
      
      const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const boneMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0x331100,
        roughness: 0.3,
        metalness: 0.1,
      });
      
      // Create spheres for each bone
      this.skinnedMesh.skeleton.bones.forEach((bone, idx) => {
        const worldPos = bone.getWorldPosition(new THREE.Vector3());
        
        const sphere = new THREE.Mesh(sphereGeometry, boneMaterial);
        sphere.position.copy(worldPos);
        sphere.userData = { boneName: bone.name, boneIndex: idx };
        this.joints.push(sphere);
        // this.scene.add(sphere);
      });

      console.log("BoundingBox:", this.skinnedMesh.boundingBox);
      
      // Create text labels for each bone
      this.joint_indices_names = Array.from({ length: this.skinnedMesh.skeleton.bones.length }, () => new Text());
      console.log('Bones in skeleton:', this.skinnedMesh.skeleton.bones.map(b => b.name));
      
      this.skinnedMesh.skeleton.bones.forEach((bone, idx) => {
        const worldPos = bone.getWorldPosition(new THREE.Vector3());
        
        this.joint_indices_names[idx].text = `${idx}: ${bone.name}`;
        this.joint_indices_names[idx].fontSize = 0.5;
        this.joint_indices_names[idx].anchorX = 'center';
        this.joint_indices_names[idx].anchorY = 'middle';
        this.joint_indices_names[idx].color = 0xffaa00;
        this.joint_indices_names[idx].position.set(worldPos.x, worldPos.y + 0.5, worldPos.z);
        this.joint_indices_names[idx].sync();
        
        this.joint_indices_names_text.add(this.joint_indices_names[idx] as unknown as THREE.Object3D);
      });
      
    //   this.scene.add(this.joint_indices_names_text);
    } else {
      console.warn('No skinned mesh or skeleton found in GLTF file');
    }
  }
  
  // Update method for animation (call with delta time)
  update(delta: number) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
  
  // Play animation
  play() {
    if (this.clipAction) {
      this.clipAction.play();
    }
  }
  
  // Pause animation
  pause() {
    if (this.mixer) {
      // No direct pause, but we can stop updating or store state
      if (this.clipAction) {
        this.clipAction.stop();
      }
    }
  }
  
  // Clean up resources
  dispose() {
    this.joints.forEach(joint => {
      this.scene.remove(joint);
      joint.geometry?.dispose();
      if (joint.material) {
        if (Array.isArray(joint.material)) {
          joint.material.forEach(m => m.dispose());
        } else {
          joint.material.dispose();
        }
      }
    });
    this.joints = [];
    
    if (this.gltf_motion) {
      this.scene.remove(this.gltf_motion);
    }
    
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
  }
}