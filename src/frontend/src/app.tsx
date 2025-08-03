
      // <div id="timeline-container">
      //   <div id="frame-label">Frame: 0 / 0</div>
      //   <input type="range" 
      //     id="frame-slider" 
      //     min="0" 
      //     max="100" 
      //     defaultValue="0"   
      //     onMouseMove={e => managerRef.current?.slider_preview_mousemove(e)}
      //     onMouseLeave={handleSliderPreviewMouseleave}/>
      //   <div id="preview-popup">
      //     <img id="preview-img" src={undefined}/>
      //   </div>
      // </div>
//       <div id="timeline-container_2">
//         <DoubleHandleSlider
//           min={0}
//           max={200}
//           initialMin={0}
//           initialMax={managerRef.current?.get_frame_count_of_npy_player()}
//           onChange={({ min, max }) => {managerRef.current?.frame_range_change(min, max);}}
//         />
//         <div id="preview-popup_2">
//           <img id="preview-img_2" src={undefined}/>
//         </div>
//       </div>
//     </div>
//   );
// };


//  ====================================================================================

import { WidgetContainer  } from "./containers/widget_container";
export default function App() 
{
  return (
    <>
      <WidgetContainer />
    </>
  );
}