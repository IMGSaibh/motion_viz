
type MotionDescriptorProps = 
{
  on_toggle_dropdown: () => void;
  isOpen: boolean;
  inputRefs: { [key: string]: React.RefObject<HTMLInputElement | null> };
  onCreate: () => void;
};

export function WidgetCreateDescriptorFile({ 
    on_toggle_dropdown,
    isOpen,
    inputRefs, 
    onCreate
}: MotionDescriptorProps) 
{
  return (
    <div id="motion-config-dropdown">
      <button
        id="motion-config-toggle"
        onClick={on_toggle_dropdown}
        style={{
          display: "block",
          borderRadius: isOpen ? "8px 8px 0 0" : "6px",
        }}
      >
        Motion Config ⚙️ 
      </button>
      {isOpen && (
        <div id="motion-config-panel">
          <form id="motion-config-form" onSubmit={(e) => e.preventDefault()}>
            <div className="config-row">
              <label htmlFor="input_format">Format</label>
              <input type="text" id="input_format" defaultValue="csv" ref={inputRefs.format} />
            </div>
            <div className="config-row">
              <label htmlFor="input_abbrev">Abbreviation</label>
              <input type="text" id="input_abbrev" defaultValue="" ref={inputRefs.abbrev} />
            </div>
            <div className="config-row">
              <label htmlFor="input_scale">Scale</label>
              <input type="number" id="input_scale" defaultValue="1" step="any" ref={inputRefs.scale} />
            </div>
            <div className="config-row">
              <label htmlFor="input_positions">Positions</label>
              <input type="text" id="input_positions" defaultValue="absolute" ref={inputRefs.positions} />
            </div>
            <div className="config-row">
              <label htmlFor="input_rotations">Rotations</label>
              <input type="text" id="input_rotations" defaultValue="none" ref={inputRefs.rotations} />
            </div>
            <div className="config-row">
              <label htmlFor="input_systemname">Systemname</label>
              <input type="text" id="input_systemname" defaultValue="" ref={inputRefs.systemname} />
            </div>
            <div className="config-row">
              <label htmlFor="input_fps">FPS</label>
              <input type="number" id="input_fps" defaultValue="30" min="1" max="1000" ref={inputRefs.fps} />
            </div>
            <div className="config-row">
              <label htmlFor="input_jointcount">Joint count</label>
              <input type="number" id="input_jointcount" defaultValue="30" min="1" max="1000" ref={inputRefs.jointcount} />
            </div>
            <div className="config-row">
              <label htmlFor="input_coloffset">Col offset</label>
              <input type="number" id="input_coloffset" defaultValue="0" min="0" ref={inputRefs.coloffset} />
            </div>
            <div className="config-row">
              <label htmlFor="input_colgap">Col gap</label>
              <input type="number" id="input_colgap" defaultValue="0" min="0" ref={inputRefs.colgap} />
            </div>
            <div className="config-row">
              <label htmlFor="input_dimsize">Dim size for position</label>
              <input type="number" id="input_dimsize" defaultValue="3" min="1" max="10" ref={inputRefs.dimsize} />
            </div>

            <button
              type="button"
              id="submit_motion_config"
              onClick={onCreate}
            >
              Create descriptor Json
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
