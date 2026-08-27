import { useRef, useState } from 'react';
import type { SelectChangeEvent } from '@mui/material/Select';

import type { MotionDescriptorData } from '@/api/motion_api';
import { PresenterTopbar } from '@/components/presenter/presenter_topbar';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import { use_frame_slider_context } from '@/context/context_frame_slider';
import {
  use_clear_label_list_ctx,
  use_replace_slider_labels_ctx as use_add_slider_labels_from_file_ctx,
} from '@/context/context_slider_label_list';
import { use_snackbar_ctx } from '@/context/context_snackbar';
import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';
import { useFileUpload } from '@/hooks/use_file_upload';
import { useMotionDescriptor } from '@/hooks/use_motion_descriptor';
import { useMotionFiles } from '@/hooks/use_motion_files';
import { usePoseViewerConversion } from '@/hooks/use_pose_viewer_conversion';
import { useLoadLabels } from '@/hooks/use_load_labels';

function get_error_message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function ContainerTopbar() {
  const { set_selected_motion, load_motion_file, go_to_frame, stop } = use_three_js_engine_ctx();
  const { set_range } = use_frame_slider_context();
  const { success, warning, error } = use_snackbar_ctx();
  const { set_rula_selected, set_owas_selected } = use_ergo_methods_cxt();

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

  const motion_files = useMotionFiles();
  const file_upload = useFileUpload();
  const motion_descriptor = useMotionDescriptor();
  const pose_viewer_conversion = usePoseViewerConversion();
  const load_labels = useLoadLabels();

  const { frame_slider_value, set_frame_slider_value } = use_frame_slider_context();
  const clear_slider_label_list = use_clear_label_list_ctx();
  const add_slider_labels_from_file = use_add_slider_labels_from_file_ctx();

  async function handle_file_dialog_on_change(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    try {
      const result = await file_upload.mutateAsync(files);
      if (result.unsupported_files.length > 0) {
        error(`unsupported files: ${result.unsupported_files.join(', ')}`);
      } else if (result.skipped_existing_files.length > 0) {
        warning(`Upload successful; Files skipped: ${result.skipped_existing_files.join(', ')}`);
      } else if (result.saved_count > 0) {
        success(`Upload successful: ${result.saved_count} file(s) saved`);
      } else {
        warning(result.warning || 'No files uploaded.');
      }
    } catch (requestError: unknown) {
      error(get_error_message(requestError, 'Upload failed'));
    } finally {
      event.target.value = '';
    }
  }

  function handle_motion_config_on_click() {
    set_motion_config_is_open((previous) => !previous);
  }

  async function handle_motion_config_create_on_click() {
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

    try {
      const result = await motion_descriptor.mutateAsync(data);
      if (result.warning) error(`Motion Descriptor: ${result.warning}`);
      else success(result.message || 'Config file created');
    } catch (requestError: unknown) {
      error(get_error_message(requestError, 'Descriptor creation failed'));
    }
  }

  function reset_current_motion() {
    set_motion_file_selected('');
    set_selected_motion(null);
    stop();
    go_to_frame(0);
    set_frame_slider_value(0);
    set_range([0, 0]);
    clear_slider_label_list();
  }

  async function handle_motion_file_list_on_open() {
    const result = await motion_files.refetch();
    if (result.error) error(get_error_message(result.error, 'Could not refresh file list'));
  }

  async function handle_motion_file_list_on_change(event: SelectChangeEvent<string>) {
    const filename = event.target.value;
    reset_current_motion();
    if (!filename) return;

    set_motion_file_selected(filename);
    set_selected_motion(filename);
    try {
      await load_motion_file(filename);
      stop();
      go_to_frame(0);
      set_frame_slider_value(0);
      set_range([0, 0]);

      const loaded_labels = await load_labels.mutateAsync(filename);
      add_slider_labels_from_file(loaded_labels);
      set_rula_selected({
        CAT_UPPERARM: null,
        CAT_LOWERARM: null,
        CAT_WRIST: null,
        CAT_NECK: null,
        CAT_TRUNK: null,
        CAT_LEGS: null,
      });
      set_owas_selected({ CATEGORY_1: null, CATEGORY_2: null, CATEGORY_3: null, CATEGORY_4: null });

      if (loaded_labels.length > 0) success(`Loaded ${loaded_labels.length} label(s) for ${filename}`);
    } catch (requestError: unknown) {
      clear_slider_label_list();
      error(get_error_message(requestError, `Could not load ${filename}`));
    }
  }

  async function handle_convert_with_pose_viewer() {
    try {
      const response = await pose_viewer_conversion.mutateAsync();
      if (response.warning) warning(response.warning);
      else success(response.message || 'Pose Viewer Conversion abgeschlossen');
    } catch (requestError: unknown) {
      error(get_error_message(requestError, 'Conversion failed'));
    }
  }

  return (
    <PresenterTopbar
      file_dialog_reference={file_dialog_reference}
      file_dialog_on_change={handle_file_dialog_on_change}
      file_upload_is_pending={file_upload.isPending}
      motion_config_reference={motion_config_references}
      motion_config_is_open={motion_config_is_open}
      motion_config_on_click={handle_motion_config_on_click}
      motion_config_create_on_click={handle_motion_config_create_on_click}
      motion_descriptor_is_pending={motion_descriptor.isPending}
      convert_pv_files_on_click={handle_convert_with_pose_viewer}
      pose_viewer_conversion_is_pending={pose_viewer_conversion.isPending}
      motion_files={motion_files.data ?? []}
      motion_file_selected={motion_file_selected}
      motion_file_list_on_change={handle_motion_file_list_on_change}
      motion_file_list_on_open={handle_motion_file_list_on_open}
    />
  );
}
