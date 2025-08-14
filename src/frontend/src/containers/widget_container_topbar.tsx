import { useRef, useState } from 'react';
import type { SelectChangeEvent } from '@mui/material/Select';

import { ThreeJSEngine } from '@/context_three_js';

import { WidgetPresenterTopbar } from '@/components/widget_presenter_topbar';

import { select_motion_files } from '@/hooks/hook_select_motion_files';
import { useUploadMotionFiles as upload_motion_files } from '@/hooks/hook_upload_motion_files';
import { useCreateMotionDescriptor as create_motion_descriptor } from '@/hooks/hook_create_motion_file_descriptor';
import { convert_bvh, convert_with_pose_viewer } from '@/hooks/hook_convert_motion_files';

import type { MotionDescriptorData } from '@/api/api_file_processing';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export function WidgetContainerTopbar() {
  const { three_js_scene_reference, set_selected_motion } = ThreeJSEngine();

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

  const [snackbar_open, set_snackbar_open] = useState(false);
  const [success_message, set_success_message] = useState<string | null>(null);
  const [warning_message, set_warning_message] = useState<string | null>(null);

  // --- React Query hooks ---
  const query_motion_files = select_motion_files({ enabled: false });
  const mutation_upload_files = upload_motion_files();
  const mutation_create_descriptor = create_motion_descriptor();
  const mutation_convert_pv = convert_with_pose_viewer();
  const mutation_convert_bvh = convert_bvh();

  // ======================= Handlers =======================
  async function handle_file_dialog_on_change(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const respond = await mutation_upload_files.mutateAsync(files);

    const success = respond.message !== '' ? `${respond.message} Files Uploaded` : null;
    const warning = respond.warning !== '' ? `${respond.warning} not supported` : null;

    set_success_message(success);
    set_warning_message(warning);
    set_snackbar_open(Boolean(success || warning));

    e.target.value = '';
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
      onSuccess: (respond: any) => {
        set_success_message(respond?.message || 'Created descriptor file!');
        set_snackbar_open(true);
      },
    });
  }

  async function handle_motion_file_list_on_change(e: SelectChangeEvent<string>) {
    set_selected_motion(e.target.value);
  }

  async function handle_convert_with_pose_viewer() {
    const respond = await mutation_convert_pv.mutateAsync();

    const success = respond.message !== '' ? `${respond.message}` : null;
    const warning = respond.warning !== '' ? `${respond.warning}` : null;

    set_success_message(success);
    set_warning_message(warning);
    set_snackbar_open(Boolean(success || warning));
  }

  async function handle_convert_motion_file() {
    const respond = await mutation_convert_bvh.mutateAsync();

    const success = respond.message !== '' ? `${respond.message}` : null;
    const warning = respond.warning !== '' ? `${respond.warning}` : null;

    set_success_message(success);
    set_warning_message(warning);
    set_snackbar_open(Boolean(success || warning));
  }

  async function handle_motion_file_list_on_focus() {
    await query_motion_files.refetch();
  }

  const handle_snack_close = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    set_snackbar_open(false);
    set_success_message(null);
    set_warning_message(null);
  };

  return (
    <>
      <div ref={three_js_scene_reference} id="scene-container" />

      <WidgetPresenterTopbar
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
