// src/components/ColorPickerButton.tsx
import React, { useState } from "react";
import { ChromePicker, ColorResult } from "react-color";

interface ColorPickerButtonProps {
  color: string;
  setColor: (color: string) => void;
}

const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({ color, setColor }) => {
  const [show, setShow] = useState(false);

  const handleChange = (colorResult: ColorResult) => {
    setColor(colorResult.hex);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          backgroundColor: color,
          border: "1px solid #ccc",
          width: 36,
          height: 36,
          borderRadius: "50%",
          cursor: "pointer",
        }}
      />
      {show && (
        <div style={{ position: "absolute", top: "110%", left: 0, zIndex: 10 }}>
          <ChromePicker color={color} onChange={handleChange} />
        </div>
      )}
    </div>
  );
};

export default ColorPickerButton;
