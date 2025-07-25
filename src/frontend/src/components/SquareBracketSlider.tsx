import React, { useRef, useState, useEffect } from "react";

interface SquareBracketSliderProps {
  min?: number;
  max?: number;
  initialMin?: number;
  initialMax?: number;
  onChange?: (range: { min: number; max: number }) => void;
}

export const SquareBracketSlider: React.FC<SquareBracketSliderProps> = ({
  min = 0,
  max = 100,
  initialMin = 20,
  initialMax = 80,
  onChange,
}) => {
  const [minValue, setMinValue] = useState(initialMin);
  const [maxValue, setMaxValue] = useState(initialMax);
  const trackRef = useRef<HTMLDivElement>(null);

  // Notify parent on change
  useEffect(() => {
    onChange?.({ min: minValue, max: maxValue });
  }, [minValue, maxValue, onChange]);

  // Clamp and avoid crossing
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxValue - 1);
    setMinValue(val);
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minValue + 1);
    setMaxValue(val);
  };

  // Calculate left/width for the range overlay
  const percent = (v: number) => ((v - min) / (max - min)) * 100;
  const left = percent(minValue);
  const width = percent(maxValue) - percent(minValue);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "30px auto",
        position: "relative",
        height: 56,
        userSelect: "none",
      }}
    >
      {/* Track */}
      <div
        ref={trackRef}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 20,
          height: 14,
          background: "#242424",
          borderRadius: 8,
          zIndex: 1,
        }}
      />
      {/* Selected Range Overlay */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: `${left}%`,
          width: `${width}%`,
          height: 14,
          background: "#4b9fff88",
          borderRadius: 8,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Two Inputs, both overlaid */}
      <input
        type="range"
        min={min}
        max={max}
        value={minValue}
        onChange={handleMinChange}
        style={sliderStyle}
        className="bracket-thumb min"
        step={1}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxValue}
        onChange={handleMaxChange}
        style={sliderStyle}
        className="bracket-thumb max"
        step={1}
      />

      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "0.95em" }}>
        <span>Start: {minValue}</span>
        <span>Ende: {maxValue}</span>
      </div>
    </div>
  );
};

// Slider Styling (works in all browsers)
const sliderStyle: React.CSSProperties = {
  position: "absolute",
  top: 10,
  left: 0,
  width: "100%",
  background: "none",
  pointerEvents: "auto",
  zIndex: 3,
  height: 36,
  margin: 0,
  appearance: "none" as any,
};

