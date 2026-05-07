import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Text } from 'troika-three-text';

type virtualMarker = {
  name: string;
  vertexIDs: number[];
  vertexMarkerMeshes: THREE.Mesh[];
  markerMesh: THREE.Mesh;
}


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

  virtualMarkers: virtualMarker[] = [];

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
    this.joint_indices_names_text.name = 'vertex_indices_text';
  }


  async load_fbx_animation(fileUrl: string) {
    const trackedVertexIds: number[] = [6400, 6720, 6750, 35150, 35350, 35140];
    this.create_virtual_marker("l_arm_marker", trackedVertexIds);

    const result = await this.fbx_loader.loadAsync(fileUrl);
    if (this.fbx_motion) {
      this.fbx_motion.add(result);
      this.fbx_motion.name = fileUrl;
    }

    this.mixer = new THREE.AnimationMixer(result);
    this.clipAction = this.mixer.clipAction(result.animations[0]);
    this.duration = this.clipAction.getClip().duration;
    const track = this.clipAction.getClip().tracks[0];
    this.keyframeCount = track.times.length;

    const geoGroup = this.fbx_motion?.getObjectByName("rp_nathan_animated_003_walking_geoGRP");
    const skinnedMesh = geoGroup?.getObjectByName("rp_nathan_animated_003_walking_geo") as THREE.SkinnedMesh;

    if(skinnedMesh){
      this.skinnedMesh = skinnedMesh
      const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      wireframe: true,
      vertexColors: false
      });

      skinnedMesh.material = material;
      // this.createVertexLabels(vertexCount, positions, 10);
    }


  this.skeletonHelper = new THREE.SkeletonHelper(result);
  if (this.fbx_motion) {
    this.fbx_motion.add(this.skeletonHelper);
  }
  if (this.fbx_motion) {
    this.scene.add(this.fbx_motion);
  }

  // Traverse through the result to find all bones
  result.traverse((obj) => {
    if (obj.type === "Bone") {
      const bone = obj as THREE.Bone;

      const worldPos = bone.getWorldPosition(new THREE.Vector3());

      const sphereGeometry = new THREE.SphereGeometry(0.35, 8, 8);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0x330000,
        roughness: 0.3,
        metalness: 0.1,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

      // Position the sphere at the bone's world position
      sphere.position.copy(worldPos);
      this.joints.push(sphere);
    }
    this.joints.forEach(joint => { this.scene.add(joint); });
  });
  }


  create_virtual_marker(name: string, vertexIds: number[]) {
    // Create individual marker meshes for each vertex
    const vertexMarkerMeshes: THREE.Mesh[] = [];
    
    vertexIds.forEach(vertexId => {
        const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00,
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
    const avgSphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const avgSphereMat = new THREE.MeshStandardMaterial({ 
        color: 0xff6600,
        emissive: 0xff3300,
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
        vertexMarkerMeshes: vertexMarkerMeshes,
        markerMesh: markerMesh
    };
    
    this.virtualMarkers.push(virtualMarker);
    
    console.log(`Created virtual marker "${name}" tracking ${vertexIds.length} vertices`);
    
    return virtualMarker; // Return for chaining if needed
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
                  // for(let i=0; i<4; i++){
                  //     console.log(`Vertex ${vertexId} influenced by bone index ${boneIndices[i]} with weight ${weights[i]}`);
                  // }
                  
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
                  // console.log(`Vertex ${vertexId} final position: (${finalPos.x.toFixed(2)}, ${finalPos.y.toFixed(2)}, ${finalPos.z.toFixed(2)})`);
                  // Transform from local mesh space to world space
                  // let worldPos = new THREE.Vector3(0,0,0);
                  // if(this.skinnedMesh) worldPos = finalPos.applyMatrix4(this.skinnedMesh.matrixWorld);
                  
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
      const x = positions[vertexId * 3];
      const y = positions[vertexId * 3 + 1];
      const z = positions[vertexId * 3 + 2];

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

    this.joint_indices_names_text.name = 'vertex_indices_text';
    this.scene.add(this.joint_indices_names_text);
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
    this.virtualMarkers.forEach(marker => {
      marker.vertexMarkerMeshes.forEach(mesh => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
        this.scene.remove(mesh);
      });
      marker.markerMesh.geometry.dispose();
      if (Array.isArray(marker.markerMesh.material)) {
        marker.markerMesh.material.forEach((m) => m.dispose());
      } else {
        marker.markerMesh.material.dispose();
      }
      this.scene.remove(marker.markerMesh);
    });
    this.virtualMarkers = [];
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
