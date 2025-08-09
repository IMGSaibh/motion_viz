import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';

type MotionDescriptorProps = {
  motion_config_reference: { [key: string]: React.RefObject<HTMLInputElement | null> };
  motion_config_is_open: boolean;
  motion_config_on_click: () => void;
  motion_config_create_on_click: () => void;
};

export function WidgetCreateDescriptorFile(motion_descriptor_props: MotionDescriptorProps) {
  return (
    <div id="motion-config-dropdown">
      <Button
        onClick={motion_descriptor_props.motion_config_on_click}
        startIcon={<SettingsIcon sx={{ color: '#fff' }} />}
      >
        Motion Config
      </Button>
      {motion_descriptor_props.motion_config_is_open && (
        <div id="motion-config-panel">
          <form id="motion-config-form" onSubmit={(e) => e.preventDefault()}>
            <div className="config-row">
              <label htmlFor="input_format">Format</label>
              <input
                type="text"
                id="input_format"
                defaultValue="csv"
                ref={motion_descriptor_props.motion_config_reference.format}
              />
            </div>
            <div className="config-row">
              <label htmlFor="input_abbrev">Abbreviation</label>
              <input
                type="text"
                id="input_abbrev"
                defaultValue=""
                ref={motion_descriptor_props.motion_config_reference.abbrev}
              />
            </div>
            <div className="config-row">
              <label htmlFor="input_scale">Scale</label>
              <input
                type="number"
                id="input_scale"
                defaultValue="1"
                step="any"
                ref={motion_descriptor_props.motion_config_reference.scale}
              />
            </div>
            <div className="config-row">
              <label htmlFor="input_positions">Positions</label>
              <input
                type="text"
                id="input_positions"
                defaultValue="absolute"
                ref={motion_descriptor_props.motion_config_reference.positions}
              />
            </div>
            <div className="config-row">
              <label htmlFor="input_rotations">Rotations</label>
              <input
                type="text"
                id="input_rotations"
                defaultValue="none"
                ref={motion_descriptor_props.motion_config_reference.rotations}
              />
            </div>
            <div className="config-row">
              <label htmlFor="input_systemname">Systemname</label>
              <input
                type="text"
                id="input_systemname"
                defaultValue=""
                ref={motion_descriptor_props.motion_config_reference.systemname}
              />
            </div>
            <div className="config-row">
              <label htmlFor="input_fps">FPS</label>
              <input
                type="number"
                id="input_fps"
                defaultValue="30"
                min="1"
                max="1000"
                ref={motion_descriptor_props.motion_config_reference.fps}
              />
            </div>
            <div className="config-row">
              <label htmlFor="input_jointcount">Joint count</label>
              <input
                type="number"
                id="input_jointcount"
                defaultValue="30"
                min="1"
                max="1000"
                ref={motion_descriptor_props.motion_config_reference.jointcount}
              />
            </div>
            <div className="config-row">
              <label htmlFor="input_coloffset">Col offset</label>
              <input
                type="number"
                id="input_coloffset"
                defaultValue="0"
                min="0"
                ref={motion_descriptor_props.motion_config_reference.coloffset}
              />
            </div>
            <div className="config-row">
              <label htmlFor="input_colgap">Col gap</label>
              <input
                type="number"
                id="input_colgap"
                defaultValue="0"
                min="0"
                ref={motion_descriptor_props.motion_config_reference.colgap}
              />
            </div>
            <div className="config-row">
              <label htmlFor="input_dimsize">Dim size for position</label>
              <input
                type="number"
                id="input_dimsize"
                defaultValue="3"
                min="1"
                max="10"
                ref={motion_descriptor_props.motion_config_reference.dimsize}
              />
            </div>

            <Button onClick={motion_descriptor_props.motion_config_create_on_click}>
              Create descriptor Json
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
