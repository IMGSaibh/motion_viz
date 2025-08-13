import { useRef, useEffect, useState } from 'react';
import type { SelectChangeEvent } from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { ThreeManager } from '../threeJS/three_js_manager';
import { WidgetPresenterUI } from '../components/widget_presenter_UI';
import { WidgetPresenterSlider } from '../components/widget_presenter_slider';

import { useMotionFiles } from '../hooks/select_motion_files';
import { useUploadMotionFiles } from '../hooks/upload_motion_files';
import { useCreateMotionDescriptor } from '../hooks/create_motion_file_descriptor';
import { useConvertBvh, useConvertWithPoseViewer } from '../hooks/convert_motion_files';

import type { MotionDescriptorData } from '../api/api_file_processing';

export function WidgetContainer() {
  const three_js_scene_reference = useRef<HTMLDivElement>(null);
  const three_js_mngr_reference = useRef<ThreeManager | null>(null);
  const file_dialog_reference = useRef<HTMLInputElement>(null);

  const [motion_config_is_open, set_motion_config_is_open] = useState(false);
  const [motion_file_selected, set_motion_file_selected] = useState<string | null>(null);

  const motion_config_references = {
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
  } as const;

  const std_slider_reference = useRef<HTMLSpanElement | null>(null);
  const [std_slider_thumbnail_css, set_std_slider_thumbnail_css] = useState<React.CSSProperties>({});
  const [std_slider_thumbnail, set_std_slider_thumbnail] = useState<string | null>(null);
  const [std_slider_value, set_std_slider_value] = useState<number>(0);

  const [framecount, set_framecount] = useState(0);

  const [labelslider_thumbnail_css, set_label_slider_thumbnail_css] = useState<React.CSSProperties>({});
  const [labelslider_thumbnail, set_label_slider_thumbnail] = useState<string | null>(null);
  const [label_slider_range, set_label_slider_range] = useState<[number, number]>([0, 100]);

  const [snackbar_open, set_snackbar_open] = useState(false);
  const [success_message, set_success_message] = useState<string | null>(null);
  const [warning_message, set_warning_message] = useState<string | null>(null);

  // --- React Query hooks ---
  const motionFilesQuery = useMotionFiles({ enabled: false });
  const uploadFilesMutation = useUploadMotionFiles();
  const createDescriptorMutation = useCreateMotionDescriptor();
  const convertPVMutation = useConvertWithPoseViewer();
  const convertBVHMutation = useConvertBvh();

  // ======================= Three.js Lifecycle =======================
  useEffect(() => {
    const container = three_js_scene_reference.current;
    if (!container) return;

    if (!three_js_mngr_reference.current) {
      three_js_mngr_reference.current = new ThreeManager(container);
      three_js_mngr_reference.current.start_engine_cycle();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') three_js_mngr_reference.current?.play_pause();
      if (e.code === 'KeyS') {
        three_js_mngr_reference.current?.stop();
        three_js_mngr_reference.current?.go_to_frame(0);
        set_std_slider_value(0);
      }
      if (e.code === 'KeyR') {
        three_js_mngr_reference.current?.cleanup_scene();
        set_label_slider_range([0, 0]);
        set_std_slider_value(0);
        set_framecount(0);
      }
      if (e.code === 'KeyP') three_js_mngr_reference.current?.print_scene_components();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      three_js_mngr_reference.current?.stop_engine_cycle();
      three_js_mngr_reference.current?.dispose();
      three_js_mngr_reference.current = null;
    };
  }, []);

  // ======================= Handlers =======================
  async function handle_file_dialog_on_change(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const res = await uploadFilesMutation.mutateAsync(files);

    set_success_message((res as any)?.message ?? 'Upload complete');
    const warning = (res as any)?.warning;
    set_warning_message(warning ? String(warning) : null);
    set_snackbar_open(true);

    e.target.value = '';
  }

  const handle_snack_close = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    set_snackbar_open(false);
    set_success_message(null);
    set_warning_message(null);
  };

  function handle_motion_config_on_click() {
    set_motion_config_is_open((prev) => !prev);
  }

  function handle_motion_config_create_on_click() {
    const data: MotionDescriptorData = {
      format: motion_config_references.format.current?.value || 'csv',
      abbrev: motion_config_references.abbrev.current?.value || '',
      scale: parseFloat(motion_config_references.scale.current?.value || '1'),
      positions: motion_config_references.positions.current?.value || 'absolute',
      rotations: motion_config_references.rotations.current?.value || 'none',
      systemname: motion_config_references.systemname.current?.value || '',
      fps: parseInt(motion_config_references.fps.current?.value || '30'),
      jointcount: parseInt(motion_config_references.jointcount.current?.value || '30'),
      coloffset: parseInt(motion_config_references.coloffset.current?.value || '0'),
      colgap: parseInt(motion_config_references.colgap.current?.value || '0'),
      dimsize: parseInt(motion_config_references.dimsize.current?.value || '3'),
    };

    createDescriptorMutation.mutate(data, {
      onSuccess: (r: any) => {
        set_success_message(r?.message || 'Created descriptor file!');
        set_snackbar_open(true);
      },
    });
  }

  async function handle_motion_file_list_on_focus() {
    await motionFilesQuery.refetch();
  }

  async function handle_motion_file_list_on_change(e: SelectChangeEvent<string>) {
    three_js_mngr_reference.current?.cleanup_scene();
    set_motion_file_selected(e.target.value);
    await three_js_mngr_reference.current!.load_motionfile_and_player(e.target.value);
    const framecount_threejs = three_js_mngr_reference.current!.get_frame_count();

    set_framecount(framecount_threejs);
    set_label_slider_range([0, 0]);
    set_std_slider_value(0);

    const player = three_js_mngr_reference.current!.get_current_player();
    player!.set_on_frame_changed_callback((new_frame_index: number) => {
      set_std_slider_value(new_frame_index);
    });
  }

  async function handle_convert_with_pose_viewer() {
    const r = await convertPVMutation.mutateAsync();
    set_success_message((r as any)?.message || 'Converted with Pose Viewer');
    set_warning_message((r as any)?.warning ? String((r as any).warning) : null);
    set_snackbar_open(true);
  }

  async function handle_convert_motion_file() {
    const r = await convertBVHMutation.mutateAsync();
    set_success_message((r as any)?.message || 'BVH conversion done');
    set_warning_message((r as any)?.warning ? String((r as any).warning) : null);
    set_snackbar_open(true);
  }

  function handle_std_slider_on_mouse_move(e: React.MouseEvent) {
    const rect = std_slider_reference.current?.getBoundingClientRect();
    if (!rect || !framecount) return;

    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(percent, 1));

    let slider_value = Math.round(percent * framecount);
    slider_value = Math.max(0, Math.min(slider_value, framecount - 1));

    set_std_slider_thumbnail_css({
      display: 'block',
      left: (slider_value / framecount) * rect.width,
      position: 'absolute',
      border: '1px solid #000000',
      top: -220,
      zIndex: 0,
    });

    three_js_mngr_reference.current?.get_thumbnail_for_frame(slider_value).then((dataUrl) => {
      set_std_slider_thumbnail(dataUrl);
    });
  }

  function handle_std_slider_on_mouse_leave() {
    set_std_slider_thumbnail_css({ display: 'none' });
    set_std_slider_thumbnail(null);
  }

  function handle_std_slider_on_change(_e: Event, value: number) {
    three_js_mngr_reference.current?.stop();
    three_js_mngr_reference.current?.go_to_frame(value);
    set_std_slider_value(value);
  }

  function handle_label_slider_on_change(_e: Event, value: number | number[], active_slider_hndl_idx: number) {
    const rect = std_slider_reference.current?.getBoundingClientRect();
    if (!rect || !framecount) return;

    if (Array.isArray(value) && value.length === 2) {
      set_label_slider_range([value[0], value[1]]);

      set_label_slider_thumbnail_css({
        display: 'block',
        left: (value[active_slider_hndl_idx] / framecount) * rect.width,
        position: 'absolute',
        border: '1px solid #000000',
        top: -220,
        zIndex: 0,
      });

      three_js_mngr_reference.current
        ?.get_thumbnail_for_frame(value[active_slider_hndl_idx])
        .then((dataUrl) => set_label_slider_thumbnail(dataUrl));
    }
  }

  function handle_label_slider_on_mouse_leave() {
    set_label_slider_thumbnail_css({ display: 'none' });
    set_label_slider_thumbnail(null);
  }

  return (
    <>
      <div ref={three_js_scene_reference} id="scene-container" />

      <WidgetPresenterUI
        file_dialog_reference={file_dialog_reference}
        file_dialog_on_change={handle_file_dialog_on_change}
        motion_config_reference={motion_config_references}
        motion_config_is_open={motion_config_is_open}
        motion_config_on_click={handle_motion_config_on_click}
        motion_config_create_on_click={handle_motion_config_create_on_click}
        convert_pv_files_on_click={handle_convert_with_pose_viewer}
        convert_bvh_files_on_click={handle_convert_motion_file}
        motion_files={motionFilesQuery.data ?? []}
        motion_file_selected={motion_file_selected}
        motion_file_list_on_focus={handle_motion_file_list_on_focus}
        motion_file_list_on_change={handle_motion_file_list_on_change}
      />

      <WidgetPresenterSlider
        std_slider_value={std_slider_value}
        std_slider_framecount={framecount}
        std_slider_reference={std_slider_reference}
        std_slider_on_change={handle_std_slider_on_change}
        std_slider_on_mouse_move={handle_std_slider_on_mouse_move}
        std_slider_on_mouse_leave={handle_std_slider_on_mouse_leave}
        std_slider_thumbnail_css={std_slider_thumbnail_css}
        std_slider_thumbnail={std_slider_thumbnail}
        label_slider_value={label_slider_range}
        label_slider_framecount={framecount}
        label_slider_on_change={handle_label_slider_on_change}
        label_slider_on_mouse_leave={handle_label_slider_on_mouse_leave}
        label_slider_thumbnail_css={labelslider_thumbnail_css}
        label_slider_thumbnail={labelslider_thumbnail}
      />

      <Snackbar
        className="snackbar-centered"
        open={snackbar_open}
        autoHideDuration={8000}
        onClose={handle_snack_close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <div>
          {success_message && (
            <Alert onClose={handle_snack_close} severity="success" variant="filled">
              {success_message}
            </Alert>
          )}
          {warning_message && (
            <Alert onClose={handle_snack_close} severity="warning" variant="filled">
              {warning_message}
            </Alert>
          )}
        </div>
      </Snackbar>
    </>
  );
}
