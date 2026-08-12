// UNUSED
//  This file is currently not used at all, it is only interesting if we would choose to pursue the mesh retargeting approach


// import * as THREE from 'three';
// import { GLTF_Loader } from './gltf_loader';

// //A joint mapping from the LARa format to XSens format
// const joint_map = new Map<number, number>([
//     [0, 0], 
//     [1, 2],
//     [2, 4],
//     [3, 5],
//     [4, 6],
//     [5, 7],
//     [6, 9],
//     [7, 10],
//     [8, 11],
//     [10, 12],
//     [11, 14],
//     [12, 15],
//     [13, 16],
//     [15, 17],
//     [16, 18],
//     [17, 19],
//     [18, 20],
//     [19, 21],
//     [20, 22],
//     [21, 23],
//     [22, 24],
//     [23, 25],
//     [24, 26]
// ])

// export class MotionRecorder {
//     isRecording: boolean = false;
//     currentFrameData: number[][] = [];
//     fps = 30;
//     keyframeCount: number;
//     gltfObject: GLTF_Loader;
    
//     constructor(gltfObj: GLTF_Loader) {
//         this.gltfObject = gltfObj
//         this.keyframeCount = gltfObj.keyframeCount
//     }

//     async start_recording() {
//         console.log("Starting recording of motion data...");
//         const response = await fetch("/api_write_npy_data/start_recording", {
//             method: "GET"
//         });
//         const data = await response.json();
//         console.log(data.message);
//         this.isRecording = true;    
//     }


//     async record_frame() {
//         if(this.isRecording) {
//             await fetch("/api_write_npy_data/write_frame", {
//                 method: "POST",
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({frame: this.currentFrameData})
//             });
//         }
//     }

//     async close_recording() {
//         const response = await fetch("/api_write_npy_data/save_recording", {
//             method: "POST"
//         });
//         const result = await response.json();
//         console.log(result.message);
//         this.isRecording = false;
//     }

//     async convert_to_xsens_format() {
//     console.log("starting recording to xsens format!");

//       const delta = 1 / this.fps;
//       console.log("delta:", delta);
//       let numFrames = 0;

//       await this.start_recording();
//       this.gltfObject.clipAction?.play();
//       this.gltfObject.mixer?.setTime(0);

//       for(let i = 0; i < this.keyframeCount; i++) {
//         this.gltfObject.mixer?.update(delta);
//         //  this.skinnedMesh?.updateWorldMatrix(true, true);
//         this.gltfObject.update_virtual_markers();
//         this.gltfObject.update_bone_markers();

//         //Write into the current frame data for export
//         this.gltfObject.virtualMarkers.forEach((virtualMarker) => {
//             const vMPosition: number[] = virtualMarker.markerMesh.position.toArray()
//             this.currentFrameData[virtualMarker.jointID] = vMPosition
//         })

//         let targetID = -1;
//         this.gltfObject.skinnedMesh?.skeleton.bones.forEach((bone, idx) => {
//             const worldPos = bone.getWorldPosition(new THREE.Vector3());
//             if(joint_map.has(idx)) {
//                 targetID = joint_map.get(idx)!;
//                 if(targetID !== undefined) {
//                     this.currentFrameData[targetID] = [worldPos.x, worldPos.y, worldPos.z];
//                 }
//             }
//         })

//         console.log('Frame', i, 'currentFrameData:', this.currentFrameData);
//         await this.record_frame();
//         numFrames++;
//         }
//         await this.close_recording();
//       console.log(`Finished converting to Xsens format with ${numFrames} frames recorded.`);
//     }

    
// }