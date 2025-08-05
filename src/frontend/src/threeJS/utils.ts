import * as THREE from 'three'
import { Loop } from '@/threeJS/system/loop';

export default class Utils 
{
  static is_in_scene(obj: THREE.Object3D | null | undefined, scene: THREE.Scene | null | undefined): boolean
  {
    if (!obj || !scene) return false;

    let node: THREE.Object3D | null | undefined = obj;
    while (node) 
    {
      if (node === scene) return true;
      node = node.parent;
    }
    return false;
  }
  
  static is_in_scene_by_UUID(obj: THREE.Object3D | null | undefined, scene: THREE.Scene | null | undefined) 
  {
    return !!obj && !!scene && !!scene.getObjectByProperty('uuid', obj.uuid);
  }

  static log_camera_position(camera: THREE.Camera | null | undefined, label = 'Camera') 
  {
    if (!camera || !camera.position) return;

    const { x, y, z } = camera.position;
    console.log(`${label} position → x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}`);
    console.log(`${label} rotation → x: ${camera.rotation.x.toFixed(2)}, y: ${camera.rotation.y.toFixed(2)}, z: ${camera.rotation.z.toFixed(2)}`);
  }

  static print_scene_components(scene: THREE.Scene, loop: Loop, camera: THREE.Camera)
  {
    if (!scene || !loop || !camera) 
    {
      console.log("Scene, loop oder camera nicht bereit.");
      return;
    }

    scene.children.forEach((element:any) => 
    {
      console.log(`Object type: ${element.type} | Name: ${element.name}`);
    });

    console.log("loop.updatables.length ", loop.updatables.length);
    loop.updatables.forEach((element, idx) => 
    {
      if (!element) 
      {
        console.log(`Empty updatable at index ${idx}:`, element);
      }
    });
    console.log("loop.updatables ", loop.updatables);
    Utils.log_camera_position(camera);
    console.log("=================================================");
  }

  // static async generic_button_fastAPI(btn_element: string, status_element: string, fastAPI_url: string) 
  // {
  //     const status = document.getElementById(status_element)  as HTMLDivElement | null;
  //     if (!status)
  //       return;

  //     status.textContent = "";
  //     try 
  //     {
  //       const serverResponse = await fetch(fastAPI_url, 
  //       {
  //         method: "POST"
  //       });

  //       if (!serverResponse.ok) 
  //       {
  //         throw new Error(`${serverResponse.statusText}` || "unknown error");
  //       }
        
  //       const apiResponse = await serverResponse.json();
  //       status.textContent = apiResponse.warning
  //         ? `⚠️ ${apiResponse.warning}`
  //         : `✅ ${apiResponse.message}`;
  //     }
  //     catch (error) 
  //     {
  //       if (error instanceof Error) 
  //       {
  //         status.textContent = `❌ error: ${error.message}`;
  //       } 
  //       else 
  //       {
  //         status.textContent = '❌ Unknown error';
  //       }
  //     }
  // }

  // static generic_inputbutton_fastAPI_inputelement(btn_element: string, status_element: string, input_element: string, fastAPI_url: string)
  // {
  //   document.getElementById(btn_element)!.addEventListener("click", async () => 
  //   {
  //     const input = document.getElementById(input_element) as HTMLInputElement | null;
  //     const status = document.getElementById(status_element) as HTMLDivElement | null;
  //     if (!input || !input.files || !status) 
  //     {
  //       alert("❌ Please choose one or more motion capture files.");
  //       return;
  //     }
  //     const files = input.files;

  //     const formData = new FormData();
  //     for (const file of files) 
  //     {
  //       formData.append("files", file);
  //     }
      
  //     status.textContent = "";
  //     try 
  //     {
  //       const serverResponse = await fetch(fastAPI_url, 
  //       {
  //         method: "POST",
  //         body: formData,
  //       });

      
  //       if (!serverResponse.ok) 
  //       {
  //         throw new Error(`${serverResponse.statusText}` || "unknown error");
  //       }
        
  //       const apiResponse = await serverResponse.json();
  //       status.textContent = `✅ ${apiResponse.message} ${apiResponse.not_supported_files && '❌ ' + apiResponse.not_supported_files}`;
  //     } 
  //     catch (error) 
  //     {
  //       if (error instanceof Error) 
  //       {
  //         status.textContent = `❌ error: ${error.message}`;
  //       } 
  //       else 
  //       {
  //         status.textContent = '❌ Unknown error';
  //       }
  //     }
  //   });
  // }

  // static async button_motion_config(btn_element: string, status_element: string, fastAPI_url: string)
  // {
  //     const status = document.getElementById(status_element) as HTMLDivElement | null;
  //     if (!status)
  //       return;

  //     const config = {
  //     format:      (document.getElementById('input_format') as HTMLInputElement).value,
  //     abbrev:      (document.getElementById('input_abbrev') as HTMLInputElement).value,
  //     scale:       parseFloat((document.getElementById('input_scale') as HTMLInputElement).value),
  //     positions:   (document.getElementById('input_positions') as HTMLInputElement).value,
  //     rotations:   (document.getElementById('input_rotations') as HTMLInputElement).value,
  //     systemname:  (document.getElementById('input_systemname') as HTMLInputElement).value,
  //     fps:         parseInt((document.getElementById('input_fps') as HTMLInputElement).value, 10),
  //     jointcount:  parseInt((document.getElementById('input_jointcount') as HTMLInputElement).value, 10),
  //     coloffset:   parseInt((document.getElementById('input_coloffset') as HTMLInputElement).value, 10),
  //     colgap:      parseInt((document.getElementById('input_colgap') as HTMLInputElement).value, 10),
  //     dimsize:     parseInt((document.getElementById('input_dimsize') as HTMLInputElement).value, 10)
  //     };

  //     status.textContent = "";
  //     try 
  //     {
  //       const serverResponse = await fetch(fastAPI_url, 
  //       {
  //         method: 'POST',
  //         headers: {'Content-Type': 'application/json'},
  //         body: JSON.stringify(config)
  //       });

  //       if (!serverResponse.ok) 
  //       {
  //         throw new Error(`${serverResponse.statusText}` || "unknown error");
  //       }
        
  //       const apiResponse = await serverResponse.json();
  //       status.textContent = apiResponse.warning
  //         ? `⚠️ ${apiResponse.warning}`
  //         : `✅ ${apiResponse.message}`;
  //     }
  //     catch (error) 
  //     {
  //       if (error instanceof Error) 
  //       {
  //         status.textContent = `❌ error: ${error.message}`;
  //       } 
  //       else 
  //       {
  //         status.textContent = '❌ Unknown error';
  //       }
  //     }
  // }

  // static async file_selection_dropdown() : Promise<HTMLSelectElement | undefined>
  // {
  //   const file_selector = document.getElementById("file_selector") as HTMLDivElement | null;
  //   const dropdown = document.getElementById("file_dropdown") as HTMLSelectElement | null;
  //   const status = document.getElementById("file_selector_status") as HTMLDivElement | null;

  //   if (!file_selector || !dropdown || !status) 
  //   {
  //     console.error("File selector or dropdown or status element not found.");
  //     return;
  //   }

  //   try 
  //   {      
  //       const response = await fetch("http://localhost:8000/motion/list_files", 
  //       {
  //         method: "POST"
  //       });

  //       const files = await response.json();
  //       dropdown.innerHTML = '<option disabled selected>-- Datei auswählen --</option>';


  //       for (const [type, list] of Object.entries(files)) 
  //       {
  //         if (!Array.isArray(list)) continue;

  //         list.forEach(filename => {
  //           const option = document.createElement("option");
  //           option.value = filename;
  //           option.dataset.type = type;
  //           option.textContent = `${filename} (${type})`;
  //           dropdown.appendChild(option);
  //         });
  //       }

  //       return dropdown;

  //     // dropdown.addEventListener("change", async () => 
  //     // {
  //     //   const selected = dropdown.selectedOptions[0];
  //     //   const type = selected.dataset.type;
  //     //   const filename = selected.value;
  //     //   return filename;
  //     // });

  //   } 
  //   catch (error) 
  //   {
  //       if (error instanceof Error) 
  //       {
  //         status.textContent = `❌ error: ${error.message}`;
  //       } 
  //       else 
  //       {
  //         status.textContent = '❌ Unknown error';
  //       } 
  //   }
  // }

  // static load_dropdown_element(dropdown: HTMLSelectElement | undefined)
  // {
  //   if (!dropdown) {return;}

  //   return new Promise((resolve) => {
  //     dropdown.addEventListener("change", () => {
  //       const selected = dropdown.selectedOptions[0];
  //       const filename = selected.value;
  //       resolve(filename);
  //     });
  //   });
  // }

}