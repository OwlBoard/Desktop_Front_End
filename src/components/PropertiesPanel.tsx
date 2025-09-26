import React from "react";
import ColorPickerButton from "./ChromePicker";

interface PropertiesPanelProps {
  color: string;
  setColor: (c: string) => void;
  size: number;
  setSize: (s: number) => void;
  opacity: number;
  setOpacity: (o: number) => void;
}

export default function PropertiesPanel({
  color,
  setColor,
  size,
  setSize,
  opacity,
  setOpacity,
}: PropertiesPanelProps) {
  return (
    <div className="properties-panel">
      <h6>Propiedades</h6>

      <div>
        <label style={{ fontSize: 13 }}>Color</label>
        <div>
          <ColorPickerButton color={color} setColor={setColor} />
        </div>
      </div>



      <div className="mt-2">
        <label>Tamaño: {size}px</label>
        <input
          type="range"
          min={1}
          max={80}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <div className="mt-2">
        <label>Opacidad: {Math.round(opacity * 100)}%</label>
        <input
          type="range"
          min={0.05}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
