import React from "react";
import ColorPickerButton from "./ChromePicker";
import "../styles/PropertiesPanel.css";

interface PropertiesPanelProps {
  color: string;
  setColor: (c: string) => void;
  fillColor: string;
  setFillColor: (c: string) => void;
  size: number;
  setSize: (s: number) => void;
  opacity: number;
  setOpacity: (o: number) => void;
}

export default function PropertiesPanel({
  color,
  setColor,
  fillColor,
  setFillColor,
  size,
  setSize,
  opacity,
  setOpacity,
}: PropertiesPanelProps) {
  return (
    <div className="properties-panel">
      <h6>Properties</h6>

      <div className="property-group">
        <label>Stroke Color</label>
        <ColorPickerButton color={color} setColor={setColor} />
      </div>

      <div className="property-group">
        <label>Fill Color</label>
        <ColorPickerButton color={fillColor} setColor={setFillColor} />
      </div>

      <div className="property-group">
        <label>Size: <span>{size}px</span></label>
        <input
          type="range"
          min={1}
          max={80}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
      </div>

      <div className="property-group">
        <label>Opacity: <span>{Math.round(opacity * 100)}%</span></label>
        <input
          type="range"
          min={0.05}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
