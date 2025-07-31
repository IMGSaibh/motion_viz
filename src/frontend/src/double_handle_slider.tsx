import React, { useRef, useState, useCallback, useEffect } from "react";
import { NPY_Player } from "./threeJS/motion_player/npy_player";


export const DoubleHandleSlider: React.FC<{
  min?: number;
  max?: number;
  initialMin?: number;
  initialMax?: number;
  onChange?: (range: { min: number; max: number }) => void;
}> = ({
  min = 0,
  max = 100,
  initialMin = 10,
  initialMax = 90,
  onChange,
}) => {
  const [minValue, setMinValue] = useState(initialMin);
  const [maxValue, setMaxValue] = useState(initialMax);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Drag State & Positions als Refs (damit sie immer aktuell im Handler sind)
  const dragType = useRef<"min" | "max">(null);

  // Aktuelle Werte auch als Ref (damit handleMouseMove immer aktuelle Werte hat)
  const minRef = useRef(minValue);
  const maxRef = useRef(maxValue);

  useEffect(() => { minRef.current = minValue }, [minValue]);
  useEffect(() => { maxRef.current = maxValue }, [maxValue]);

  // Notifiziere Parent
  useEffect(() => 
  {
    onChange?.({ min: minValue, max: maxValue });
  }, [minValue, maxValue, onChange]);

  const getPercent = useCallback((val: number) => ((val - min) / (max - min)) * 100, [min, max]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => 
  {
    if (!sliderRef.current || !dragType.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const value = Math.round(min + percent * (max - min));

    if (dragType.current === "min") 
    {
      setMinValue(Math.min(value, maxRef.current - 1));
    }
    else if (dragType.current === "max") 
    {
      setMaxValue(Math.max(value, minRef.current + 1));
    }
  }, [min, max]);

  const handleMouseUp = useCallback(() => 
  {
    dragType.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  // Drag Start: MouseDown am Thumb
  const handleThumbMouseDown = useCallback((type: "min" | "max") => 
  {
    dragType.current = type;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  // Clean-up falls Komponente unmounted während Drag
  useEffect(() => () => 
  {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div style={{ width: "100%", maxWidth: 600, margin: "30px auto", userSelect: "none" }}>
      <div
        ref={sliderRef}
        style={{
          position: "relative",
          height: 24,
          background: "#222",
          borderRadius: 10,
        }}
      >
        {/* Selected Range */}
        <div
          style={{
            position: "absolute",
            left: `${getPercent(minValue)}%`,
            width: `${getPercent(maxValue) - getPercent(minValue)}%`,
            top: 0,
            bottom: 0,
            background: "#4b9fff88",
            borderRadius: 10,
            zIndex: 1,
          }}
        />
        {/* Min Handle */}
        <div id="startframe_handle"
          style={{
            position: "absolute",
            left: `calc(${getPercent(minValue)}% - 12px)`,
            top: -6,
            width: 24,
            height: 36,
            background: "#4b9fff",
            border: "2px solid #222",
            borderRadius: 6,
            cursor: "pointer",
            zIndex: 2,
            boxShadow: "0 0 6px #0003",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 14,
            color: "#000",
            userSelect: "none",
          }}
          onMouseDown={() => handleThumbMouseDown("min")}
        >
          |
        </div>
        {/* Max Handle */}
        <div id="endframe_handle"
          style={{
            position: "absolute",
            left: `calc(${getPercent(maxValue)}% - 12px)`,
            top: -6,
            width: 24,
            height: 36,
            background: "#ff7e22",
            border: "2px solid #222",
            borderRadius: 6,
            cursor: "pointer",
            zIndex: 2,
            boxShadow: "0 0 6px #0003",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 14,
            color: "#000",
            userSelect: "none",
          }}
          onMouseDown={() => handleThumbMouseDown("max")}
        >
          |
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span>Start: {minValue}</span>
        <span>Ende: {maxValue}</span>
      </div>
    </div>
  );
};
