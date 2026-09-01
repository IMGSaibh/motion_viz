import Button from '@mui/material/Button';

type Props = {
  convert_pv_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
  pose_viewer_conversion_is_pending: boolean;
};

/**
 * Renders the Pose Viewer conversion action and its pending state.
 *
 * The conversion workflow is intentionally supplied through props. Backend communication,
 * result handling, and notifications belong in `ContainerTopbar`; button presentation stays
 * in this widget.
 */
export function WidgetConvertMotionFile(props: Props) {
  return (
    <>
      <Button onClick={props.convert_pv_files_on_click} disabled={props.pose_viewer_conversion_is_pending}>
        Convert via Pose Viewer
      </Button>
    </>
  );
}
