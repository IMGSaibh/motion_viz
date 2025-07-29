import React, { useRef, useEffect } from "react";
import { ThreeManager } from "./three_js_manager";
import {DoubleHandleSlider} from "./double_handle_slider"

export const App: React.FC = () => 
{
  const threeContainerRef = useRef<HTMLDivElement | null>(null);
  const managerRef = useRef<ThreeManager | null>(null);
  
  useEffect(() => 
  {
    if (!threeContainerRef.current) return;
    managerRef.current = new ThreeManager(threeContainerRef.current);
    managerRef.current?.start();

    const handleKeyDown = (e: KeyboardEvent) => 
    {
      if (e.code === "KeyP"){managerRef.current?.print_scene_components();}
      if (e.code === "KeyR") {managerRef.current?.cleanup_scene()}
    };

    window.addEventListener("keydown", handleKeyDown);


    // clean-up at unmount
    return () => 
    {
      window.removeEventListener("keydown", handleKeyDown);
      managerRef.current?.dispose();
    };
  }, []);

  const handleUpload = () => managerRef.current?.upload_files();
  const handleConvertPVStyle = () => managerRef.current?.convert_pv_style();
  const handleConvertBVHToNpy = () => managerRef.current?.convert_bvh_to_npy();
  const handleConfigDropdown = () => managerRef.current?.toggle_config_panel()
  const handleSubmitConfigPanel = () => managerRef.current?.submit_config_panel()
  const handleFileFSlectionDropwown = () => managerRef.current?.file_selection_dropwown()
  const handleSliderPreviewMouseleave = () => managerRef.current?.slider_preview_mouseleave()

  return (
    // JSX must have an parent element
    <div>
      <div id="ui-overlay">
        <input type="file" id="upload_files" multiple/>
        <button id="upload_files_btn" onClick={handleUpload}>Upload Files</button>
        <div id="client_uploads_status"></div>

        <div id="motion-config-dropdown">
          <button id="motion-config-toggle" onClick={handleConfigDropdown}>
            Motion Config ⚙️
          </button>
          <div id="motion-config-panel">
            <form id="motion-config-form">
              <div className="config-row">
                <label htmlFor="input_format">Format</label>
                <input type="text" id="input_format" defaultValue="csv" />
              </div>
              <div className="config-row">
                <label htmlFor="input_abbrev">Abbreviation</label>
                <input type="text" id="input_abbrev" defaultValue="" />
              </div>
              <div className="config-row">
                <label htmlFor="input_scale">Scale</label>
                <input type="number" id="input_scale" defaultValue="1" step="any" />
              </div>
              <div className="config-row">
                <label htmlFor="input_positions">Positions</label>
                <input type="text" id="input_positions" defaultValue="absolute" />
              </div>
              <div className="config-row">
                <label htmlFor="input_rotations">Rotations</label>
                <input type="text" id="input_rotations" defaultValue="none" />
              </div>
              <div className="config-row">
                <label htmlFor="input_systemname">Systemname</label>
                <input type="text" id="input_systemname" defaultValue="" />
              </div>
              <div className="config-row">
                <label htmlFor="input_fps">FPS</label>
                <input type="number" id="input_fps" defaultValue="30" min="1" max="1000" />
              </div>
              <div className="config-row">
                <label htmlFor="input_jointcount">Joint count</label>
                <input type="number" id="input_jointcount" defaultValue="30" min="1" max="1000" />
              </div>
              <div className="config-row">
                <label htmlFor="input_coloffset">Col offset</label>
                <input type="number" id="input_coloffset" defaultValue="0" min="0" />
              </div>
              <div className="config-row">
                <label htmlFor="input_colgap">Col gap</label>
                <input type="number" id="input_colgap" defaultValue="0" min="0" />
              </div>
              <div className="config-row">
                <label htmlFor="input_dimsize">Dim size for position</label>
                <input type="number" id="input_dimsize" defaultValue="3" min="1" max="10" />
              </div>
              <button type="button" id="submit_motion_config" onClick={handleSubmitConfigPanel}>Create Config Json</button>
              <div id="config_status"></div>
            </form>
          </div>
        </div>

        <button id="convert_bvh_to_npy_btn" onClick={handleConvertBVHToNpy}>Convert BVH to NPY</button>
        <div id="convert_bvh_to_npy_status"></div>

        <button id="convert_pv_style_btn" onClick={handleConvertPVStyle}>Convert File as done in Pose Viewer</button>
        <div id="convert_pv_style_status"></div>

        <div id="file_selector">
          <select id="file_dropdown" onClick={handleFileFSlectionDropwown}>
            <option value="">Choose a motion file</option>
          </select>
          <div id="file_selector_status"></div>
        </div>
      </div>

      <div ref={threeContainerRef} id="scene-container" />

      {/* <div id="timeline-container">
        <div id="frame-label">Frame: 0 / 0</div>
        <input type="range" 
          id="frame-slider" 
          min="0" 
          max="100" 
          defaultValue="0"   
          onMouseMove={e => managerRef.current?.slider_preview_mousemove(e)}
          onMouseLeave={handleSliderPreviewMouseleave}/>
        <div id="preview-popup">
          <img id="preview-img" src={undefined}/>
        </div>
      </div> */}
      <div id="timeline-container">
        <DoubleHandleSlider
          min={0}
          max={200}
          initialMin={10}
          initialMax={80}
          onChange={({ min, max }) => {
            console.log("Frame-Range:", min, max);
          }}
        />

      </div>
    </div>
  );
};

