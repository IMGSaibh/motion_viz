import { useState } from "react";
import { WidgetPresenter } from "./widget_presenter";
import { api_file_upoload } from "../api/api_file_upload";
import { useThreeManager } from "../threeJS/custom_hook_three_js";

// complete logic can implemented here

export function WidgetContainer() 
{
  const { mountRef } = useThreeManager();
  const { fireBackend } = api_file_upoload();

   // Handler, der beim Buttonklick den Backend-Call macht UND Farbe setzt
  async function handleFireBackend() 
  {
    try
    {
        const result = await fireBackend("firebackend");
        console.log(result.data)
        console.log(result.error)
    } 
    catch (error)
    {
        console.log(error)
    }
  }
  
  return (
    <div>
        <WidgetPresenter
            mountRef={mountRef}
            onFireBackend={handleFireBackend}
        />
    </div>
  );
}
