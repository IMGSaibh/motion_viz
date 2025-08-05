
type WidgetPlaySliderProps = 
{
  std_slider_reference: React.RefObject<HTMLInputElement | null>;
  std_slider_on_mouse_move: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  std_slider_on_mouse_leave: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  std_slider_thumbnail_css: React.CSSProperties;
  std_slider_thumbnail: string | null;
};

export function WidgetPlaySlider({ 
  std_slider_reference,
  std_slider_on_mouse_move,
  std_slider_on_mouse_leave,
  std_slider_thumbnail_css,
  std_slider_thumbnail
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
        ref={std_slider_reference}
        onMouseMove={std_slider_on_mouse_move}
        onMouseLeave={std_slider_on_mouse_leave}
      />
      <div id="preview-popup" style={std_slider_thumbnail_css}>
        <img src={std_slider_thumbnail || undefined} />
      </div>
    </>
  );
}