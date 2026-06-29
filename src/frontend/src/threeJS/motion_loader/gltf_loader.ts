import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Text } from 'troika-three-text';
import { generateAnimationClip } from '@/hooks/hook_generate_animation_clip';

type virtualMarker = {
  name: string;
  jointID: number,
  vertexIDs: number[];
  vertexMarkerMeshes: THREE.Mesh[];
  markerMesh: THREE.Mesh;
}

type formatMapping = {
    name: string;
    existingJointIDs: number[];
    virtualMarkers: virtualMarker[];
}

interface KeyFrameTrackData {
    values: number[];
    times: number[];
}

interface GenerateClipResponse {
    message: string;
    jointCount: number;
    frameCount: number;
    shape: number[];
    filePath: string;
    keyframeTracks: KeyFrameTrackData[];
}

export class GLTF_Loader {
  gltf_loader: GLTFLoader; //This is the gltf loader provided by three.js
  gltf_motion: THREE.Group | null;
  joints: THREE.Mesh[];
  mixer: THREE.AnimationMixer | null;
  clipAction: THREE.AnimationAction | null;
  skeletonHelper: THREE.SkeletonHelper | null;
  keyframeCount: number;
  duration: number;
  scene: THREE.Scene;
  skinnedMesh: THREE.SkinnedMesh | null = null;
  scale: number = 100;
  fps = 30;
  keyFrameTracks: THREE.KeyframeTrack[] = []

  xSensFormatMapping: formatMapping = {
    name: 'Xsens',
    existingJointIDs: [10, 15, 18, 19, 12, 17, 13, 0, 1, 16, 2, 5, 6, 7, 3, 8, 10, 11, 4, 20, 21,  22, 23, 24],
    virtualMarkers: []
  }

  virtualMarkers: virtualMarker[] = [];   
  
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

    this.gltf_motion?.scale.set(this.scale, this.scale, this.scale);
    
    // Handle animations if present
    if (result.animations && result.animations.length > 0) {
      console.log(`Found ${result.animations.length} animations:`, result.animations.map(a => a.name));
      

      this.mixer = new THREE.AnimationMixer(result.scene);
      let longestDuration = 0;
      for (const anim of result.animations) {
        const action = this.mixer.clipAction(anim);
        const clipDuration = anim.duration;
        if (clipDuration > longestDuration) {
          longestDuration = clipDuration;
          this.clipAction = action;
        }
      }
    //   this.clipAction = this.mixer.clipAction(result.animations[0]);
      this.duration = this.clipAction!.getClip().duration;
      console.log(`Animation clip: `, this.clipAction!.getClip());
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

    //   this.createVertexLabels(this.skinnedMesh.geometry.attributes.position.count, this.skinnedMesh.geometry.attributes.position.array, 5);
      this.xSensFormatMapping.virtualMarkers.push(this.create_virtual_marker('chest_top_marker', 3, [3930, 1690, 60, 410, 2640]));
      this.xSensFormatMapping.virtualMarkers.push(this.create_virtual_marker('shoulder_right_marker', 8, [390, 1700]));
      this.xSensFormatMapping.virtualMarkers.push(this.create_virtual_marker('shoulder_left_marker', 13, [3945, 3975, 3965]));
      this.xSensFormatMapping.virtualMarkers.push(this.create_virtual_marker('back_bottom_marker', 1 , [1750, 1720, 3955, 55]));
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
      
      const sphereGeometry = new THREE.SphereGeometry(0.8, 16, 16);
      const boneMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0x331100,
        roughness: 0.3,
        metalness: 0.1,
      });

      const markerMaterial = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 0.5
      });
      
      // Create spheres for each bone
      this.skinnedMesh.skeleton.bones.forEach((bone, idx) => {
        let sphere: THREE.Mesh;
        const worldPos = bone.getWorldPosition(new THREE.Vector3());
        
        
        if(this.xSensFormatMapping.existingJointIDs.includes(idx)) {
            sphere = new THREE.Mesh(sphereGeometry, markerMaterial);
        } else {
            sphere = new THREE.Mesh(sphereGeometry, boneMaterial);
        }
        // const sphere = new THREE.Mesh(sphereGeometry, boneMaterial);
        sphere.position.copy(worldPos);
        sphere.userData = { boneName: bone.name, boneIndex: idx };
        this.joints.push(sphere);
        this.scene.add(sphere);
      });

      // Create text labels for each bone
      this.joint_indices_names = Array.from({ length: this.skinnedMesh.skeleton.bones.length }, () => new Text());
      for(const bone of this.skinnedMesh.skeleton.bones) {
        console.log(`Bone: ${bone.name}`);
        console.log(`Bone children: ${bone.children.map(c => c.name).join(', ')}`);
      }
      
      this.skinnedMesh.skeleton.bones.forEach((bone, idx) => {
        const worldPos = bone.getWorldPosition(new THREE.Vector3());
        
        this.joint_indices_names[idx].text = `${idx}`;
        this.joint_indices_names[idx].fontSize = 0.8;
        this.joint_indices_names[idx].anchorX = 'center';
        this.joint_indices_names[idx].anchorY = 'middle';
        this.joint_indices_names[idx].color = 0xffaa00;
        this.joint_indices_names[idx].position.set(worldPos.x, worldPos.y + 1.1, worldPos.z);
        this.joint_indices_names[idx].sync();
        
        this.joint_indices_names_text.add(this.joint_indices_names[idx] as unknown as THREE.Object3D);
      });
      
       this.scene.add(this.joint_indices_names_text);
    } else {
      console.warn('No skinned mesh or skeleton found in GLTF file');
    }

    // await this.convert_to_xsens_format();
    //await this.getAnimationClip();

  }

  create_virtual_marker(name: string, jointidx: number, vertexIds: number[]) {
      // Create individual marker meshes for each vertex
      const vertexMarkerMeshes: THREE.Mesh[] = [];
      
      vertexIds.forEach(vertexId => {
          const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
          const sphereMaterial = new THREE.MeshStandardMaterial({ 
              color: 0xff6600,
              emissive: 0xff3300,
              emissiveIntensity: 0.3
          });
          const marker = new THREE.Mesh(sphereGeometry, sphereMaterial);
          marker.userData = { 
              vertexId, 
              type: 'tracked_vertex',
              virtualMarkerName: name 
          };
          vertexMarkerMeshes.push(marker);
          this.scene.add(marker);
      });
      
      // Create the main/parent marker mesh for this virtual marker (average position)
      const avgSphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
      const avgSphereMat = new THREE.MeshStandardMaterial({ 
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 0.5
      });
      const markerMesh = new THREE.Mesh(avgSphereGeo, avgSphereMat);
      markerMesh.userData = { 
          type: 'virtual_marker',
          name: name,
          vertexCount: vertexIds.length
      };
      this.scene.add(markerMesh);
      
      // Create and store the virtual marker object
      const virtualMarker: virtualMarker = {
          name: name,
          vertexIDs: vertexIds,
          jointID: jointidx,
          vertexMarkerMeshes: vertexMarkerMeshes,
          markerMesh: markerMesh
      };
      
      this.virtualMarkers.push(virtualMarker);
      
      console.log(`Created virtual marker "${name}" tracking ${vertexIds.length} vertices`);
      
      return virtualMarker; // Return for chaining if needed
  }

  //This method is only for visualization purposes, it creates a text label for each vertex, showing its index
    //This can be used to identify the vertices that get tracked
    private createVertexLabels(vertexCount: number, positions: THREE.TypedArray, step: number) {
      const vertexIdsToShow: number[] = [];
  
  
      for (let i = 0; i < vertexCount; i += step) {
        vertexIdsToShow.push(i);
      }
  
      // Remove duplicates and sort
      const uniqueVertexIds = [...new Set(vertexIdsToShow)].sort((a, b) => a - b);
  
      console.log(`Creating text labels for ${uniqueVertexIds.length} vertices`);
  
      // Initialize text array
      this.joint_indices_names = Array.from({ length: uniqueVertexIds.length }, () => new Text());
  
      for (let idx = 0; idx < uniqueVertexIds.length; idx++) {
        const vertexId = uniqueVertexIds[idx];
        //This might have to be multiplied by 100
        const x = positions[vertexId * 3] * this.scale;
        const y = positions[vertexId * 3 + 1] * this.scale;
        const z = positions[vertexId * 3 + 2] * this.scale;
  
        // Create text using Troika (matching NPY_loader exactly)
        this.joint_indices_names[idx].text = String(vertexId);
        this.joint_indices_names[idx].fontSize = 0.5;
        this.joint_indices_names[idx].anchorX = 'center';
        this.joint_indices_names[idx].anchorY = 'middle';
        this.joint_indices_names[idx].color = 0xff0000; // Red for vertices
        this.joint_indices_names[idx].position.set(x, y, z);
        this.joint_indices_names[idx].sync(); // Important!
  
        this.joint_indices_names_text.add(this.joint_indices_names[idx] as unknown as THREE.Object3D);
      }
  
      this.scene.add(this.joint_indices_names_text);
    }

    update_virtual_markers() {
        this.virtualMarkers.forEach((virtualMarker) => {
          if (!this.skinnedMesh || virtualMarker.vertexIDs.length === 0) return;
          // Get vertex positions from geometry
          const geometry = this.skinnedMesh.geometry;
          const vertexPositions = geometry.attributes.position.array;
          
          // Get bone matrices
          const skeleton = this.skinnedMesh.skeleton;
          this.skinnedMesh.skeleton.update(); // Ensure bone matrices are updated
          
          let sumX = 0, sumY = 0, sumZ = 0;
          let validCount = 0;
          
          virtualMarker.vertexIDs.forEach((vertexId, idx) => {
              if (vertexId * 3 < vertexPositions.length) {
                  //This is the initial position of the vertices (rest pose), we use this in combination with the bone matrices
                  //to calculate the current position of the vertex each frame
                  const bindX = vertexPositions[vertexId * 3];
                  const bindY = vertexPositions[vertexId * 3 + 1];
                  const bindZ = vertexPositions[vertexId * 3 + 2];
                  const bindPos = new THREE.Vector3(bindX, bindY, bindZ);
                  
                  // Get skinning weights and bone indices for this vertex
                  const skinWeights = geometry.attributes.skinWeight.array;
                  const boneIndices = geometry.attributes.skinIndex.array;
                  
                  if (skinWeights && boneIndices) {
                      // Get weights and indices for this vertex
                      const i4 = vertexId * 4;
                      //skinWeights are how much each bone influences the vertex, skinIndices are which bones influence the vertex
                      const currentWeights = [
                          skinWeights[i4], skinWeights[i4 + 1], 
                          skinWeights[i4 + 2], skinWeights[i4 + 3]
                      ];
                      const currentBoneIndices = [
                          boneIndices[i4], boneIndices[i4 + 1], 
                          boneIndices[i4 + 2], boneIndices[i4 + 3]
                      ];

                      const finalPos = new THREE.Vector3(0, 0, 0);
                      for (let i = 0; i < 4; i++) {
                          if (currentWeights[i] > 0) {
                              const boneIndex = currentBoneIndices[i];
                              // Each bone matrix is 16 floats (4x4 matrix)
                              const offset = boneIndex * 16;
                              
                              // Extract the 16 values for this bone from the Float32Array
                              const boneMatrixArray = skeleton.boneMatrices.slice(offset, offset + 16);
                              const boneMatrix4 = new THREE.Matrix4().fromArray(boneMatrixArray);
                              
                              const transformed = bindPos.clone().applyMatrix4(boneMatrix4);
                              finalPos.add(transformed.multiplyScalar(currentWeights[i]));
                          }
                      }                      
                      // Update marker
                      if (virtualMarker.vertexMarkerMeshes[idx]) {
                          virtualMarker.vertexMarkerMeshes[idx].position.copy(finalPos); 
                      }
                      
                      // Accumulate for average
                      sumX += finalPos.x;
                      sumY += finalPos.y;
                      sumZ += finalPos.z;
                      validCount++;
                  }
                  else {
                      console.warn(`Vertex ${vertexId} is missing skinWeight or skinIndex attributes`);
                  }
              }
              else {
                console.warn(`Vertex ID ${vertexId} is out of bounds for position attribute (length: ${vertexPositions.length})`);
              }
          });
          
          // Calculate and update average position marker
          if (validCount > 0 && virtualMarker.markerMesh) {
            const avgX = sumX / validCount;
            const avgY = sumY / validCount;
            const avgZ = sumZ / validCount;
            virtualMarker.markerMesh.position.set(avgX, avgY, avgZ);
          }
        });
    }
    
    update_bone_markers() {
    if(!this.skinnedMesh) return;
    this.skinnedMesh?.updateWorldMatrix(true, true);
    
    this.skinnedMesh.skeleton.bones.forEach((bone, idx) => {
        const worldPos = bone.getWorldPosition(new THREE.Vector3());
        if (this.joints[idx]) {
            this.joints[idx].position.copy(worldPos);
        }
        if (this.joint_indices_names[idx]) {
            this.joint_indices_names[idx].position.set(worldPos.x, worldPos.y + 1.1, worldPos.z);
            this.joint_indices_names[idx].sync();
        }        
        
    });
    
    }

    async getAnimationClip() {
      console.log("generating animation clip")
      const response = await generateAnimationClip("data/npy/free_pack_male_base_mesh.npy") as GenerateClipResponse;
      console.log(response)

      this.createAnimationClip(response.keyframeTracks, response.frameCount);
    }

    createAnimationClip(keyFrameTracks: KeyFrameTrackData[], numFrames: number) {
    for (const [index, track] of keyFrameTracks.entries()) {
        // Create a name for each track (e.g., "joint_0", "joint_1", etc.)
        const trackName = `joint_${index}`;
        
        const newTrack = new THREE.KeyframeTrack(
            trackName,
            track.times,  
            track.values 
        );
        this.keyFrameTracks.push(newTrack);
      }

      const animClip = new THREE.AnimationClip("Animation", numFrames / 30, this.keyFrameTracks)
      if(!this.mixer) this.mixer = new THREE.AnimationMixer(this.scene)
      if(this.mixer) {
        this.clipAction = new THREE.AnimationAction(this.mixer, animClip)
        this.keyframeCount = numFrames;
        this.duration = numFrames / 30;
      }
      else console.error("Animation Mixer does not exist, new Animation Action could not be created!")
    }
  
  // Clean up resources
  dispose() {
    this.keyFrameTracks = []

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
    this.virtualMarkers.forEach(marker => {
        this.scene.remove(marker.markerMesh);
        marker.markerMesh.geometry.dispose();
        if (marker.markerMesh.material) {
            if (Array.isArray(marker.markerMesh.material)) {
                marker.markerMesh.material.forEach(m => m.dispose());
            } else {
                marker.markerMesh.material.dispose();
            }
        }
        marker.vertexMarkerMeshes.forEach(vertexMarker => {
            this.scene.remove(vertexMarker);
            vertexMarker.geometry.dispose();
            if (vertexMarker.material) {
                if (Array.isArray(vertexMarker.material)) {
                    vertexMarker.material.forEach(m => m.dispose());
                } else {
                    vertexMarker.material.dispose();
                }
            }
        });
    });
    this.virtualMarkers = [];

    this.joint_indices_names.forEach(text => {
        this.scene.remove(text as unknown as THREE.Object3D);
        text.dispose();
    });
    this.joint_indices_names = [];
    this.scene.remove(this.joint_indices_names_text);
    this.joint_indices_names_text.clear();
    

    if (this.gltf_motion) {
      this.scene.remove(this.gltf_motion);
    }
    
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
  }
}