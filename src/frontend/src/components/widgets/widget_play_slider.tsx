type WidgetPlaySliderProps = 
{

};

export function WidgetPlaySlider({ 

}: WidgetPlaySliderProps) {
  return (
    <>
      <div id="frame-label">Frame: 0 / 0</div>
      <input type="range" 
          id="frame-slider" 
          min="0" 
          max="100" 
          defaultValue="0"
          // TODO: slider is implemented in player and should not be there
          // onMouseMove={e => managerRef.current?.slider_preview_mousemove(e)}
          // onMouseLeave={handleSliderPreviewMouseleave}
      />
      <div id="preview-popup">
          <img id="preview-img" src={undefined}/>
      </div>
    </>
  );
}