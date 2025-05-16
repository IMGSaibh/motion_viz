// Logik & UI Anwendung

import React, { useRef, useEffect, useState } from "react";
import Scene from "./viewer/Scene";
import SequenceUI from "./viewer/SequenceUI";

export default function App() {
  const [sequence, setSequence] = useState({ start: 0, end: 100 });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1 }}>
        <Scene sequence={sequence} />
      </div>
      <div style={{ width: "300px", padding: "1rem", background: "#f4f4f4" }}>
        <SequenceUI sequence={sequence} setSequence={setSequence} />
      </div>
    </div>
  );
}
