import React, { useEffect, useRef } from "react";
import { initThreeScene } from "./ThreeScene";

export default function Scene({ sequence }) {
  const canvasRef = useRef();

  useEffect(() => {
    initThreeScene(canvasRef.current, sequence);
  }, [sequence]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}
