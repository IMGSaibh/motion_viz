import { useRef, useState } from 'react';
import type { SelectChangeEvent } from '@mui/material/Select';

import { useThreeJSEngine } from '@/context/context_three_js_engine';
import { PresenterTopbar } from '@/components/presenter/presenter_topbar';

import type { MotionDescriptorData } from '@/api/api_file_processing';
import { select_motion_files } from '@/hooks/hook_select_motion_files';
import { upload_motion_files } from '@/hooks/hook_upload_motion_files';
import { create_motion_descriptor } from '@/hooks/hook_create_motion_file_descriptor';
import { convert_bvh, convert_with_pose_viewer } from '@/hooks/hook_convert_motion_files';
import {
  use_set_range_slider_value_cxt,
  use_set_std_slider_value_cxt,
  use_std_slider_value_cxt,
} from '@/context/context_slider_label_list';

import { use_clear_label_list_ctx } from '@/context/context_slider_label_list';
import { use_snackbar_ctx } from '@/context/context_snackbar';

export function ContainerTopbar() {
  const { set_selected_motion, load_motion_file, go_to_frame } = useThreeJSEngine();
  const set_range = use_set_range_slider_value_cxt();
  const { success, warning, error } = use_snackbar_ctx();

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

  // --- React Query hooks ---
  const query_motion_files = select_motion_files({ enabled: false });
  const mutation_upload_files = upload_motion_files();
  const mutation_create_descriptor = create_motion_descriptor();
  const mutation_convert_pv = convert_with_pose_viewer();
  const mutation_convert_bvh = convert_bvh();

  const std_slider_value = use_std_slider_value_cxt();
  const set_std_slider_value = use_set_std_slider_value_cxt();

  const clear_slider_label_list = use_clear_label_list_ctx();

  // ======================= Handler =======================
  async function handle_file_dialog_on_change(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const respond = await mutation_upload_files.mutateAsync(files);
      if (respond.message) success(`${respond.message} Files Uploaded`);
      if (respond.warning) warning(`${respond.warning} not supported`);
    } catch (err: any) {
      error(err?.message || 'Upload failed');
    } finally {
      e.target.value = '';
    }
  }

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

    mutation_create_descriptor.mutate(data, {
      onSuccess: (respond: any) => success(respond?.message || 'Created descriptor file!'),
      onError: (err: any) => error(err?.message || 'Creation failed'),
    });
  }

  async function handle_motion_file_list_on_change(e: SelectChangeEvent<string>) {
    set_selected_motion(e.target.value);
    await load_motion_file(e.target.value);
    stop();
    go_to_frame(0);
    set_std_slider_value(0);
    set_range([0, 1]);
    clear_slider_label_list();
  }

  async function handle_convert_with_pose_viewer() {
    try {
      const respond = await mutation_convert_pv.mutateAsync();
      if (respond.message) success(respond.message);
      if (respond.warning) warning(`${respond.warning}`);
    } catch (e: any) {
      error(e?.message || 'Conversion failed');
    }
  }

  async function handle_convert_motion_file() {
    try {
      const respond = await mutation_convert_bvh.mutateAsync();
      if (respond.message) success(respond.message);
      if (respond.warning) warning(`${respond.warning}`);
    } catch (e: any) {
      error(e?.message || 'Conversion failed');
    }
  }

  async function handle_motion_file_list_on_focus() {
    await query_motion_files.refetch();
  }

  return (
    <>
      <PresenterTopbar
        file_dialog_reference={file_dialog_reference}
        file_dialog_on_change={handle_file_dialog_on_change}
        motion_config_reference={motion_config_references}
        motion_config_is_open={motion_config_is_open}
        motion_config_on_click={handle_motion_config_on_click}
        motion_config_create_on_click={handle_motion_config_create_on_click}
        convert_pv_files_on_click={handle_convert_with_pose_viewer}
        convert_bvh_files_on_click={handle_convert_motion_file}
        motion_files={query_motion_files.data ?? []}
        motion_file_selected={motion_file_selected}
        motion_file_list_on_focus={handle_motion_file_list_on_focus}
        motion_file_list_on_change={handle_motion_file_list_on_change}
      />
    </>
  );
}
