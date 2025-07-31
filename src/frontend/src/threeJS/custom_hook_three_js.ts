import { ThreeManager } from "./three_js_manager";
import { useRef, useEffect, useCallback, RefObject } from "react";

export function useThreeManager() 
{
  const mountRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<ThreeManager>(null);

    useEffect(() => 
    {
        const container = mountRef.current;
        if (container && !managerRef.current)
        {
            managerRef.current = new ThreeManager(container);
        }
        return () => 
        {
            if (container && managerRef.current)
            {
                managerRef.current.dispose();
                managerRef.current = null;
            }
        };
    }, []);

  // if functions with args e. g. setBoxColor 
//   useEffect(() => {
//     if (managerRef.current) {
//       managerRef.current.setBoxColor(boxColor);
//     }
//   }, [boxColor]);

    const start = useCallback(() => 
    {
        managerRef.current?.start();
    }, []);

    const print_scene_components = useCallback(() => 
    {
        managerRef.current?.print_scene_components();
    }, []);

    return { 
        mountRef: mountRef as RefObject<HTMLDivElement>,
        start,
        print_scene_components
    };
}
