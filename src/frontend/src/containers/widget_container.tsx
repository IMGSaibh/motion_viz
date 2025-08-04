import { useRef, useEffect, useState } from "react";
import { ThreeManager } from "../threeJS/three_js_manager";
import { WidgetPresenter } from "../components/widget_presenter";
import { WidgetPresenterSlider } from "../components/widget_presenter_slider";
import { api_motion_file_conversion } from "../api/api_motion_file_conversion";
import { api_file_processing, MotionDescriptorData } from "../api/api_file_processing";

export function WidgetContainer() 
{
  const mountRef = useRef<HTMLDivElement>(null);
  const three_js_manager_ref = useRef<ThreeManager>(null);
  
  useEffect(() => 
  {
    const container = mountRef.current;

    if (!container) 
    {
      console.warn("Three.js not found");
      return;
    }

    // init if manager doesnt exists
    if (!three_js_manager_ref.current) 
    {
      three_js_manager_ref.current = new ThreeManager(container);
      three_js_manager_ref.current.start();
    }

    // keyboard-events
    const handleKeyDown = (e: KeyboardEvent) => 
    {
      if (e.code === "KeyP"){three_js_manager_ref.current?.print_scene_components();}
      if (e.code === "KeyR") {three_js_manager_ref.current?.cleanup_scene()}
    };

    window.addEventListener("keydown", handleKeyDown);

    // cleanup
    return () => 
    {
      window.removeEventListener("keydown", handleKeyDown);

      if (three_js_manager_ref.current) 
      {
        three_js_manager_ref.current.stop();
        three_js_manager_ref.current.dispose();
        three_js_manager_ref.current = null;
      }
    };
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const { upload_files } = api_file_processing();
  const { create_motion_descriptor } = api_file_processing();
  const { convert_with_pose_viewer, convert_bvh } = api_motion_file_conversion();
  
  const [toggle_dropdown, set_toggle_dropdown] = useState(false);
  const { list_motion_files } = api_file_processing();
  const [motionFiles, setMotionFiles] = useState<{type: string, name: string}[]>([]);
  const [selectedMotionFile, setSelectedMotionFile] = useState<string | null>(null);

  
  const [frameCount, setFramecount] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  
  const [status_massage, set_status_massage] = useState<string | null>(null);

  const refs = 
  {
    format: useRef<HTMLInputElement>(null),
    abbrev: useRef<HTMLInputElement>(null),
    scale: useRef<HTMLInputElement>(null),
    positions: useRef<HTMLInputElement>(null),
    rotations: useRef<HTMLInputElement>(null),
    systemname: useRef<HTMLInputElement>(null),
    fps: useRef<HTMLInputElement>(null),
    jointcount: useRef<HTMLInputElement>(null),
    coloffset: useRef<HTMLInputElement>(null),
    colgap: useRef<HTMLInputElement>(null),
    dimsize: useRef<HTMLInputElement>(null),
  };

  function open_file_dialog() 
  {
    inputRef.current?.click();
    set_status_massage("")
  }

  async function handle_file_input_change(e: React.ChangeEvent<HTMLInputElement>) 
  {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const response = await upload_files(files);
    const message = "✅ " + response.data.message;
    const warning = response.data.not_supported_files ? `⚠️ ${response.data.not_supported_files}` : "";
    set_status_massage(`${message} ${warning}`);
  }

  function handleToggleDropdown() 
  {
    set_toggle_dropdown(prev => !prev);
  }

  function handle_motion_description_attributes() 
  {
    const data: MotionDescriptorData = {
      format: refs.format.current?.value || "csv",
      abbrev: refs.abbrev.current?.value || "",
      scale: parseFloat(refs.scale.current?.value || "1"),
      positions: refs.positions.current?.value || "absolute",
      rotations: refs.rotations.current?.value || "none",
      systemname: refs.systemname.current?.value || "",
      fps: parseInt(refs.fps.current?.value || "30"),
      jointcount: parseInt(refs.jointcount.current?.value || "30"),
      coloffset: parseInt(refs.coloffset.current?.value || "0"),
      colgap: parseInt(refs.colgap.current?.value || "0"),
      dimsize: parseInt(refs.dimsize.current?.value || "3"),
    };
   
    create_motion_descriptor(data).then(() => 
    {
      set_status_massage("✅ Created descriptor file!");
    });
  }

  async function handle_convert_with_pose_viewer() 
  {
    const response = await convert_with_pose_viewer();
    const message = "✅ " + response.data.message;
    const warning = response.data.warning ? `⚠️ ${response.data.warning}` : "";
    set_status_massage(`${message} ${warning}`);
  }

  async function handle_convert_motion_file() 
  {
    const response = await convert_bvh();
    const message = "✅ " + response.data.message;
    const warning = response.data.warning ? `⚠️ ${response.data.warning}` : "";
    set_status_massage(`${message} ${warning}`);
  }

  async function handleFetchFileList() 
  {
    const response = await list_motion_files();
    const allFiles = [
      ...response.data.bvh.map((f: string) => ({ type: "bvh", name: f })),
      ...response.data.fbx.map((f: string) => ({ type: "fbx", name: f })),
      ...response.data.npy.map((f: string) => ({ type: "npy", name: f })),
    ];
    setMotionFiles(allFiles);
  }

  async function handleSelectMotionFile(e: React.ChangeEvent<HTMLSelectElement>) 
  {
    setSelectedMotionFile(e.target.value);
    await three_js_manager_ref.current!.load_motionfile_and_player(e.target.value);

    const actualFrameCount = three_js_manager_ref.current!.get_frame_count();
    setFramecount(actualFrameCount);

    setMinValue(0);
    setMaxValue(actualFrameCount > 0 ? actualFrameCount : 0);
  }

  
  
  
  // ======================= play slider ======================= 

  const slider_standard_reference = useRef<HTMLInputElement | null>(null);
  const [slider_standard_preview_CSS, set_standard_preview_CSS] = useState<React.CSSProperties>({});
  const [slider_standard_preview_src, set_standard_preview_src] = useState<string | null>(null);

  function handleSliderPreviewMouseMove(e: React.MouseEvent<HTMLInputElement, MouseEvent>) 
  {
    if (!slider_standard_reference.current) return;

    const slider = slider_standard_reference.current;
    const rect = slider.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const frameIndex = Math.round(percent * (parseInt(slider.max) - parseInt(slider.min)));

    // positioning via CSS
    set_standard_preview_CSS({
      display: 'block',
      left: e.clientX - rect.left + 60,
    });

    three_js_manager_ref.current?.getThumbnailForFrame(frameIndex).then(dataUrl => 
    {
      set_standard_preview_src(dataUrl);
    });
  }

  function handleSliderPreviewMouseLeave(e: React.MouseEvent<HTMLInputElement, MouseEvent>)
  {
    set_standard_preview_CSS({
      display: 'none',
    });
    set_standard_preview_src(null);
  }


  // ======================= range label slider ======================= 

const [slider_label_preview_src, set_label_preview_src] = useState<string | null>(null);
const [slider_label_preview_CSS, set_label_preview_CSS] = useState<React.CSSProperties>({});

  const [slider_label_value, set_slider_label_value] = useState<number>(0); // Slider-Wert
  const [labelSliderRange, setLabelSliderRange] = useState<[number, number]>([0, 100]);

  // function handleSliderChange(_event: Event, newValue: number | number[]) 
  // {
  //   if (typeof newValue === "number") 
  //     {
  //       set_slider_label_value(newValue);
  //       // Preview updaten wie oben, wenn du live willst!
  //       console.log("newValue in change")
  //   }
  // }

const [activeThumb, setActiveThumb] = useState<0 | 1>(0);

function handleLabelSliderChange(_e: Event, newValue: number | number[], activeThumbIdx: number) {
  if (Array.isArray(newValue) && newValue.length === 2) {
    setLabelSliderRange([newValue[0], newValue[1]]);
    setActiveThumb(activeThumbIdx as 0 | 1);
  }
}



  function handle_label_slider_preview_MouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // // Wichtig: target ist Track oder Thumb, immer als HTMLDivElement casten!
    // const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    // set_label_preview_CSS({
    //   display: "block",
    //   left: e.clientX - rect.left + 60,
    //   position: "absolute",
    //   top: -200, // over Slider
    //   zIndex: 20,
    // });
    // set_slider_label_value(value);

    // // Hole Preview nur, wenn Frame geändert (Performance)
    // three_js_manager_ref.current?.getThumbnailForFrame(value).then(dataUrl => {
    //   set_label_preview_src(dataUrl);
    // });

  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
  const val = labelSliderRange[activeThumb];
  set_label_preview_CSS({
    display: 'block',
    left: ((val - minValue) / (maxValue - minValue)) * rect.width + 60, // Position anpassen!
    position: 'absolute',
    top: -290,
    zIndex: 20,
  });
  three_js_manager_ref.current?.getThumbnailForFrame(val).then(dataUrl => {
    set_label_preview_src(dataUrl);
  });
  }

  function handle_label_slider_preview_MouseLeave(e: React.MouseEvent<HTMLInputElement, MouseEvent>)
  {
      set_label_preview_CSS({ display: "none" });
      set_label_preview_src(null);
  }



  return (
    <>
      <div id="ui-overlay">
        <WidgetPresenter
          inputRef={inputRef}
          onFileInputChange={handle_file_input_change}
          triggerFileDialog={open_file_dialog}
          is_dropdown_open={toggle_dropdown}
          on_toggle_dropdown={handleToggleDropdown}
          inputRefs={refs}
          onCreate={handle_motion_description_attributes}
          on_convert_pose_viewer={handle_convert_with_pose_viewer}
          on_convert_bvh={handle_convert_motion_file}

          motionFiles={motionFiles}
          selectedMotionFile={selectedMotionFile}
          onFetchFileList={handleFetchFileList}
          onSelectMotionFile={handleSelectMotionFile}
          
          status_massage={status_massage}
        />
      </div>
      <div ref={mountRef} id="scene-container"/>
      <WidgetPresenterSlider
        sliderRef={slider_standard_reference}
        onMouseMove={handleSliderPreviewMouseMove}
        onMouseLeave={handleSliderPreviewMouseLeave}
        previewStyle={slider_standard_preview_CSS}
        previewImgSrc={slider_standard_preview_src}

        minValue={minValue}
        maxValue={maxValue}
        min={0}
        max={frameCount > 0 ? frameCount : 100}
        // onChange={(newMin, newMax) => 
        // {
        //   setMinValue(newMin);
        //   setMaxValue(newMax);
        // }}
        onChange={handleLabelSliderChange}
        value={slider_label_value}
        onMouseMove_SliderLabel     ={handle_label_slider_preview_MouseMove}
        onMouseLeave_SliderLabel    ={handle_label_slider_preview_MouseLeave}
        preview_Style_labelslider   ={slider_label_preview_CSS}
        previewImgSrc_labelslider   ={slider_label_preview_src}
        
      />
    </>
  );
}
