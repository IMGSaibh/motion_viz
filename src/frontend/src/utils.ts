import * as THREE from 'three'

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

  static generic_button_fastAPI(btn_element: string, status_element: string, fastAPI_url: string) 
  {
    document.getElementById(btn_element)!.addEventListener("click", async () => 
    {
      const status = document.getElementById(status_element)  as HTMLDivElement | null;
      if (!status)
        return;

      status.textContent = "";
      try 
      {
        const serverResponse = await fetch(fastAPI_url, 
        {
          method: "POST"
        });

        if (!serverResponse.ok) 
        {
          throw new Error(`${serverResponse.statusText}` || "unknown error");
        }
        
        const apiResponse = await serverResponse.json();
        status.textContent = apiResponse.warning
          ? `⚠️ ${apiResponse.warning}`
          : `✅ ${apiResponse.message}`;
      }
      catch (error) 
      {
        if (error instanceof Error) 
        {
          status.textContent = `❌ error: ${error.message}`;
        } 
        else 
        {
          status.textContent = '❌ Unknown error';
        }
      }

    });
  }

  static generic_inputbutton_fastAPI_with(btn_element: string, status_element: string, input_element: string, fastAPI_url: string)
  {
    document.getElementById(btn_element)!.addEventListener("click", async () => 
    {
      const input = document.getElementById(input_element) as HTMLInputElement | null;
      const status = document.getElementById(status_element) as HTMLDivElement | null;
      if (!input || !input.files || !status) 
      {
        alert("❌ Please choose one or more motion capture files.");
        return;
      }
      const files = input.files;

      const formData = new FormData();
      for (const file of files) 
      {
        formData.append("files", file);
      }
      
      try 
      {
        const serverResponse = await fetch(fastAPI_url, 
        {
          method: "POST",
          body: formData,
        });

      
        if (!serverResponse.ok) 
        {
          throw new Error(`${serverResponse.statusText}` || "unknown error");
        }
        
        const apiResponse = await serverResponse.json();
        status.textContent = `✅ ${apiResponse.message} ${apiResponse.not_supported_files && '❌ ' + apiResponse.not_supported_files}`;
      } 
      catch (error) 
      {
        if (error instanceof Error) 
        {
          status.textContent = `❌ error: ${error.message}`;
        } 
        else 
        {
          status.textContent = '❌ Unknown error';
        }
      }
    });
  }


  // Pro tipp
  // function getById<T extends HTMLElement>(id: string): T {
  //   const el = document.getElementById(id);
  //   if (!el) throw new Error(`Element #${id} not found`);
  //   return el as T;
  // }

  // // Nutzung
  // const input = getById<HTMLInputElement>('upload_files');
  // const status = getById<HTMLElement>('client_uploads_status');


}