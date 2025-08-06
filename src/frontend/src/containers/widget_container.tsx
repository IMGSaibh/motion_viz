import { useRef, useEffect, useState, SetStateAction } from "react";
import { ThreeManager } from "../threeJS/three_js_manager";
import { WidgetPresenter } from "../components/widget_presenter";
import { WidgetPresenterSlider } from "../components/widget_presenter_slider";
import { api_motion_file_conversion } from "../api/api_motion_file_conversion";
import { api_file_processing, MotionDescriptorData } from "../api/api_file_processing";
import { NPY_Player } from "@/threeJS/motion_player/npy_player";

export function WidgetContainer() 
{
  const three_js_scene_reference = useRef<HTMLDivElement>(null);
  const three_js_mngr_reference = useRef<ThreeManager>(null);
  
  const file_dialog_reference = useRef<HTMLInputElement>(null);
  const { upload_files } = api_file_processing();
  const { create_motion_descriptor } = api_file_processing();
  const { convert_with_pose_viewer, convert_bvh } = api_motion_file_conversion();
  
  const { list_motion_files } = api_file_processing();
  const [motion_config_is_open, set_motion_config_is_open] = useState(false);
  const [motion_files, set_motion_files] = useState<{type: string, name: string}[]>([]);
  const [motion_file_selected, set_motion_file_selected] = useState<string | null>(null);
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

  const std_slider_reference = useRef<HTMLSpanElement | null>(null);
  const [std_slider_thumbnail_css, set_std_slider_thumbnail_css] = useState<React.CSSProperties>({});
  const [std_slider_thumbnail, set_std_slider_thumbnail] = useState<string | null>(null);
  const [std_slider_value, set_std_slider_value] = useState<number>(0);
  
  const [framecount, set_framecount] = useState(0);
  
  const [labelslider_thumbnail_css, set_label_slider_thumbnail_css] = useState<React.CSSProperties>({});
  const [labelslider_thumbnail, set_label_slider_thumbnail] = useState<string | null>(null);
  const [label_slider_range, set_label_slider_range] = useState<[number, number]>([0, 100]);


  const [status_massage, set_status_massage] = useState<string | null>(null);


  useEffect(() => 
  {
    const three_js_scene_container = three_js_scene_reference.current;

    if (!three_js_scene_container) 
    {
      console.warn("Three.js not found");
      return;
    }

    // init if manager doesnt exists
    if (!three_js_mngr_reference.current) 
    {
      three_js_mngr_reference.current = new ThreeManager(three_js_scene_container);
      three_js_mngr_reference.current.start_engine_cycle();
      console.info("three_js_mngr_reference was initialized");
    }

    // const player = three_js_mngr_reference.current.get_current_player()
    // console.log("was ist player " + player)
    // if(player instanceof NPY_Player)
    // {
    //   console.log("in if NPY_Player")
    //   player.setOnFrameChangedCallback((new_frame_index: number) => 
    //   {
    //     set_std_slider_value(new_frame_index);
    //     console.log("on frame changed")
    //   }); 
    // }

    // keyboard-events
    const handleKeyDown = (e: KeyboardEvent) => 
    {
      if (e.code === "KeyP") {three_js_mngr_reference.current?.print_scene_components();}
      if (e.code === "KeyR") {three_js_mngr_reference.current?.cleanup_scene()}
      if (e.code === "Space"){three_js_mngr_reference.current?.play_pause()}
      if (e.code === "KeyS") {three_js_mngr_reference.current?.player_stop()}
    };
    window.addEventListener("keydown", handleKeyDown);

    // cleanup
    return () => 
    {
      window.removeEventListener("keydown", handleKeyDown);

      if (three_js_mngr_reference.current) 
      {
        three_js_mngr_reference.current.stop_engine_cycle();
        three_js_mngr_reference.current.dispose();
        three_js_mngr_reference.current = null;
      }
    };
  }, []);


  // ======================= file dialog upload ======================= 


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

  // ======================= motion config ======================= 

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
    three_js_mngr_reference.current?.cleanup_scene()
    set_motion_file_selected(e.target.value);
    await three_js_mngr_reference.current!.load_motionfile_and_player(e.target.value)
    let framecount_threejs = three_js_mngr_reference.current!.get_frame_count()

    set_framecount(framecount_threejs)

    const player = three_js_mngr_reference.current!.get_current_player()
    if (player instanceof NPY_Player)
    {
      player.setOnFrameChangedCallback((new_frame_index: number) =>
      {
        set_std_slider_value(new_frame_index)
      });
    }


  }

  // ======================= file convertion ======================= 

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

  // ======================= standard slider ======================= 


  function handle_std_slider_on_mouse_move(e: React.MouseEvent) 
  {
    const rect = std_slider_reference.current?.getBoundingClientRect();
    if(!rect || !framecount){return}
    
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(percent, 1));

    let slider_value = Math.round(percent * framecount);
    slider_value = Math.max(0, Math.min(slider_value, framecount - 1));
    
    set_std_slider_thumbnail_css({
      display: 'block',
      left: (slider_value / framecount) * rect!.width,
      position: 'absolute',
      border: '1px solid #000000',
      top: -280,
      zIndex: 0,
    });

    three_js_mngr_reference.current?.get_thumbnail_for_frame(slider_value).then(dataUrl => 
    {
      set_std_slider_thumbnail(dataUrl)
    });

  }

  function handle_std_slider_on_mouse_leave(e: React.MouseEvent<HTMLInputElement, MouseEvent>)
  {
    set_std_slider_thumbnail_css({ display: 'none'})
    set_std_slider_thumbnail(null)
  }

  function handle_std_slider_on_change(e: Event, value: number)
  {
    three_js_mngr_reference.current?.player_stop()
    three_js_mngr_reference.current?.go_to_frame(value)
    set_std_slider_value(value)
  }

  // ======================= range label slider ======================= 


  function handle_label_slider_on_change(e: Event, value: number | number[], active_slider_hndl_idx: number) 
  {
    const rect = std_slider_reference.current?.getBoundingClientRect();
    if(!rect || !framecount){return}

    if (Array.isArray(value) && value.length === 2) 
    {
      set_label_slider_range([value[0], value[1]]);
      const slider_value = value[active_slider_hndl_idx];

      set_label_slider_thumbnail_css({
        display: 'block',
        left: (slider_value / framecount) * rect!.width,
        position: 'absolute',
        border: '1px solid #000000',
        top: -220,
        zIndex: 0,
      });

      three_js_mngr_reference.current?.get_thumbnail_for_frame(slider_value).then(dataUrl => 
      {
        set_label_slider_thumbnail(dataUrl);
      });
    }
  }

  function handle_label_slider_on_mouse_leave(e: React.MouseEvent<HTMLInputElement, MouseEvent>)
  {
    set_label_slider_thumbnail_css({ display: "none" });
    set_label_slider_thumbnail(null);
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
        std_slider_value                  ={std_slider_value}
        std_slider_framecount             ={framecount}
        std_slider_reference              ={std_slider_reference}
        std_slider_on_change              ={handle_std_slider_on_change}
        std_slider_on_mouse_move          ={handle_std_slider_on_mouse_move}
        std_slider_on_mouse_leave         ={handle_std_slider_on_mouse_leave}
        std_slider_thumbnail_css          ={std_slider_thumbnail_css}
        std_slider_thumbnail              ={std_slider_thumbnail}

        label_slider_value                ={label_slider_range}
        label_slider_framecount           ={framecount}
        label_slider_on_change            ={handle_label_slider_on_change}
        label_slider_on_mouse_leave       ={handle_label_slider_on_mouse_leave}
        label_slider_thumbnail_css        ={labelslider_thumbnail_css}
        label_slider_thumbnail            ={labelslider_thumbnail}
        
      />
    </>
  );
}
