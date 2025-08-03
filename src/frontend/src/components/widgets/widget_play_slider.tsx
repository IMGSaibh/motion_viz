
type WidgetPlaySliderProps = 
{
  sliderRef: React.RefObject<HTMLInputElement | null>;
  onMouseMove: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  previewStyle: React.CSSProperties;
  previewImgSrc: string | null;
};

export function WidgetPlaySlider({ 
  sliderRef,
  onMouseMove,
  onMouseLeave,
  previewStyle,
  previewImgSrc
}: WidgetPlaySliderProps) {
  return (
    <>
      <div id="frame-label">Frame: 0 / 0</div>
      <input
        type="range"
        id="frame-slider"
        min="0"
        max="100"
        defaultValue="0"
        ref={sliderRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
      <div id="preview-popup" style={previewStyle}>
        <img src={previewImgSrc || undefined} />
      </div>
    </>
  );
}