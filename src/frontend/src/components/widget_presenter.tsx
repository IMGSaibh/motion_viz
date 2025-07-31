import { RefObject } from "react";

// Bekommt nur Props von außen und rendert UI

type WidgetPresenterProps = 
{
  mountRef: RefObject<HTMLDivElement>;
  onFireBackend: () => void;
//   onStart: () => void;
//   onPlayBVH: (bvhData: any) => void;
//   isLoading: boolean;
//   color: string;
//   // ...weitere Props
};



export function WidgetPresenter({
    mountRef, 
    onFireBackend 
} : WidgetPresenterProps){
  return (
    <div>
      <div ref={mountRef} />
      <button onClick={onFireBackend}>
        {"Backend auslösen und Loop starten"}
      </button>
    </div>
  );
}
