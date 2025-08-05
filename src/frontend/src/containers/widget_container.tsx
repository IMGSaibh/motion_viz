import { useRef, useEffect, useState } from "react";
import { ThreeManager } from "../threeJS/three_js_manager";
import { WidgetPresenter } from "../components/widget_presenter";
import { WidgetPresenterSlider } from "../components/widget_presenter_slider";
import { api_motion_file_conversion } from "../api/api_motion_file_conversion";
import { api_file_processing, MotionDescriptorData } from "../api/api_file_processing";

export function WidgetContainer() 
{
  const three_js_scene_reference = useRef<HTMLDivElement>(null);
  const three_js_mngr_reference = useRef<ThreeManager>(null);
  
  useEffect(() => 
  {
    const container = three_js_scene_reference.current;

    if (!container) 
    {
      console.warn("Three.js not found");
      return;
    }

    // init if manager doesnt exists
    if (!three_js_mngr_reference.current) 
    {
      three_js_mngr_reference.current = new ThreeManager(container);
      three_js_mngr_reference.current.start();
    }

    // keyboard-events
    const handleKeyDown = (e: KeyboardEvent) => 
    {
      if (e.code === "KeyP"){three_js_mngr_reference.current?.print_scene_components();}
      if (e.code === "KeyR") {three_js_mngr_reference.current?.cleanup_scene()}
    };

    window.addEventListener("keydown", handleKeyDown);

    // cleanup
    return () => 
    {
      window.removeEventListener("keydown", handleKeyDown);

      if (three_js_mngr_reference.current) 
      {
        three_js_mngr_reference.current.stop();
        three_js_mngr_reference.current.dispose();
        three_js_mngr_reference.current = null;
      }
    };
  }, []);

  const file_dialog_reference = useRef<HTMLInputElement>(null);
  const { upload_files } = api_file_processing();
  const { create_motion_descriptor } = api_file_processing();
  const { convert_with_pose_viewer, convert_bvh } = api_motion_file_conversion();
  
  const { list_motion_files } = api_file_processing();
  const [motion_config_is_open, set_motion_config_is_open] = useState(false);
  const [motion_files, set_motion_files] = useState<{type: string, name: string}[]>([]);
  const [motion_file_selected, set_motion_file_selected] = useState<string | null>(null);

  
  const [framecount, set_framecount] = useState(0);
  const [minValue, set_min_value] = useState(0);
  const [maxValue, set_max_value] = useState(100);
  
  const [status_massage, set_status_massage] = useState<string | null>(null);

  const motion_config_references = 
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

  function handle_file_dialog_on_click() 
  {
    file_dialog_reference.current?.click();
    set_status_massage("")
  }

  async function handle_file_dialog_on_change(e: React.ChangeEvent<HTMLInputElement>) 
  {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const response = await upload_files(files);
    const message = "✅ " + response.data.message;
    const warning = response.data.not_supported_files ? `⚠️ ${response.data.not_supported_files}` : "";
    set_status_massage(`${message} ${warning}`);
  }

  function handle_motion_config_on_click() 
  {
    set_motion_config_is_open(prev => !prev);
  }

  function handle_motion_config_create_on_click() 
  {
    const data: MotionDescriptorData = {
      format: motion_config_references.format.current?.value || "csv",
      abbrev: motion_config_references.abbrev.current?.value || "",
      scale: parseFloat(motion_config_references.scale.current?.value || "1"),
      positions: motion_config_references.positions.current?.value || "absolute",
      rotations: motion_config_references.rotations.current?.value || "none",
      systemname: motion_config_references.systemname.current?.value || "",
      fps: parseInt(motion_config_references.fps.current?.value || "30"),
      jointcount: parseInt(motion_config_references.jointcount.current?.value || "30"),
      coloffset: parseInt(motion_config_references.coloffset.current?.value || "0"),
      colgap: parseInt(motion_config_references.colgap.current?.value || "0"),
      dimsize: parseInt(motion_config_references.dimsize.current?.value || "3"),
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

  async function handle_motion_file_list_on_focus() 
  {
    const response = await list_motion_files();
    const all_files = [
      ...response.data.bvh.map((f: string) => ({ type: "bvh", name: f })),
      ...response.data.fbx.map((f: string) => ({ type: "fbx", name: f })),
      ...response.data.npy.map((f: string) => ({ type: "npy", name: f })),
    ];
    set_motion_files(all_files);
  }

  async function handle_motion_file_list_on_change(e: React.ChangeEvent<HTMLSelectElement>) 
  {
    set_motion_file_selected(e.target.value);
    await three_js_mngr_reference.current!.load_motionfile_and_player(e.target.value);

    const framecount_threejs = three_js_mngr_reference.current!.get_frame_count();
    set_framecount(framecount_threejs);

    set_min_value(0);
    set_max_value(framecount_threejs > 0 ? framecount_threejs : 0);
  }


  // ======================= standard slider ======================= 

  const std_slider_reference = useRef<HTMLInputElement | null>(null);
  const [std_slider_thumbnail_css, set_std_slider_thumbnail_css] = useState<React.CSSProperties>({});
  const [std_slider_thumbnail, set_std_slider_thumbnail] = useState<string | null>(null);

  function handle_std_slider_on_mouse_move(e: React.MouseEvent<HTMLInputElement, MouseEvent>) 
  {
    if (!std_slider_reference.current) return;

    const slider = std_slider_reference.current;
    const rect = slider.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const frameIndex = Math.round(percent * (parseInt(slider.max) - parseInt(slider.min)));

    // positioning via CSS
    set_std_slider_thumbnail_css({
      display: 'block',
      left: e.clientX - rect.left + 60,
    });

    three_js_mngr_reference.current?.getThumbnailForFrame(frameIndex).then(dataUrl => 
    {
      set_std_slider_thumbnail(dataUrl);
    });
  }

  function handle_std_slider_on_mouse_leave(e: React.MouseEvent<HTMLInputElement, MouseEvent>)
  {
    set_std_slider_thumbnail_css({ display: 'none'});
    set_std_slider_thumbnail(null);
    set_labelslider_thumbnail_css({ display: "none" });
    set_labelslider_thumbnail(null);
  }


  // ======================= range label slider ======================= 

  const [labelslider_thumbnail_css, set_labelslider_thumbnail_css] = useState<React.CSSProperties>({});
  const [labelslider_thumbnail, set_labelslider_thumbnail] = useState<string | null>(null);
  const [label_slider_range, set_label_slider_range] = useState<[number, number]>([0, 100]);
  const [active_slidercontrol, set_active_slidercontrol] = useState<0 | 1>(0);


  function handleLabelSliderChange(e: Event, value: number | number[], active_slidercontrol_idx: number) 
  {
    if (Array.isArray(value) && value.length === 2) 
    {
      set_label_slider_range([value[0], value[1]]);
      set_active_slidercontrol(active_slidercontrol_idx as 0 | 1);

      const slider_value = value[active_slidercontrol_idx];
      const rect = std_slider_reference.current?.getBoundingClientRect();

      set_labelslider_thumbnail_css({
        display: 'block',
        left: ((slider_value - minValue) / (maxValue - minValue)) * rect!.width + 60,
        position: 'absolute',
        top: -200,
        zIndex: 20,
      });
      three_js_mngr_reference.current?.getThumbnailForFrame(slider_value).then(dataUrl => 
      {
        set_labelslider_thumbnail(dataUrl);
      });

      console.log("Dragging Thumb " + active_slidercontrol_idx + " Value: " + slider_value);
    }
  }


  return (
    <>
      <div id="ui-overlay">
        <WidgetPresenter
          file_dialog_reference           ={file_dialog_reference}
          file_dialog_on_change           ={handle_file_dialog_on_change}
          file_dialog_on_click            ={handle_file_dialog_on_click}

          motion_config_reference         ={motion_config_references}
          motion_config_is_open           ={motion_config_is_open}
          motion_config_on_click          ={handle_motion_config_on_click}
          motion_config_create_on_click   ={handle_motion_config_create_on_click}

          convert_pv_files_on_click       ={handle_convert_with_pose_viewer}
          convert_bvh_files_on_click      ={handle_convert_motion_file}

          motion_files                    ={motion_files}
          motion_file_selected            ={motion_file_selected}
          motion_file_list_on_focus       ={handle_motion_file_list_on_focus}
          motion_file_list_on_change      ={handle_motion_file_list_on_change}
        />
        <p>{status_massage}</p>
      </div>
      <div ref={three_js_scene_reference} id="scene-container"/>
      <WidgetPresenterSlider
        std_slider_reference              ={std_slider_reference}
        std_slider_on_mouse_move          ={handle_std_slider_on_mouse_move}
        std_slider_on_mouse_leave         ={handle_std_slider_on_mouse_leave}
        std_slider_thumbnail_css          ={std_slider_thumbnail_css}
        std_slider_thumbnail              ={std_slider_thumbnail}

        value                             ={label_slider_range}
        labelslider_framecount            ={framecount > 0 ? framecount : 100}
        labelslider_on_change             ={handleLabelSliderChange}
        labelslider_on_mouse_leave        ={handle_std_slider_on_mouse_leave}
        labelslider_thumbnail_css         ={labelslider_thumbnail_css}
        labelslider_thumbnail             ={labelslider_thumbnail}
        
      />
    </>
  );
}
