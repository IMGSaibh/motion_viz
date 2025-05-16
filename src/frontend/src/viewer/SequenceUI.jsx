import React from "react";

export default function SequenceUI({ sequence, setSequence }) {
  return (
    <div>
      <h3>Motion-Abschnitt wählen</h3>
      <div>
        <label>Start Frame:</label>
        <input
          type="number"
          value={sequence.start}
          onChange={(e) => setSequence({ ...sequence, start: +e.target.value })}
        />
      </div>
      <div>
        <label>End Frame:</label>
        <input
          type="number"
          value={sequence.end}
          onChange={(e) => setSequence({ ...sequence, end: +e.target.value })}
        />
      </div>
      <button
        style={{ marginTop: "1rem" }}
        onClick={() => {
          alert(`Sequenz ausgewählt: ${sequence.start}–${sequence.end}`);
          // Optional: hier Daten speichern/exportieren
        }}
      >
        Labeln / Exportieren
      </button>
    </div>
  );
}
