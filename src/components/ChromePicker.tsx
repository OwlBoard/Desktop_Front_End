import React, { useState, useRef, useEffect } from "react";
import { ChromePicker, ColorResult } from "react-color";
import { createPortal } from "react-dom";

interface ColorPickerButtonProps {
  color: string;
  setColor: (color: string) => void;
}

export default function ColorPickerButton({ color, setColor }: ColorPickerButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (showPicker && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPickerPos({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [showPicker]);

  // ✅ Detecta clics fuera del picker y del botón
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        pickerRef.current &&
        !buttonRef.current.contains(target) &&
        !pickerRef.current.contains(target)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={buttonRef} style={{ position: "relative", display: "inline-block" }}>
      <div
        onClick={() => setShowPicker((prev) => !prev)}
        style={{
          width: 28,
          height: 28,
          borderRadius: 4,
          border: "1px solid #ccc",
          backgroundColor: color,
          cursor: "pointer",
        }}
      />

      {showPicker &&
        createPortal(
          <div
            ref={pickerRef}
            style={{
              position: "absolute",
              top: pickerPos.top,
              left: pickerPos.left,
              zIndex: 9999,
            }}
          >
            {/* ✅ onChange en tiempo real mientras arrastras */}
            <ChromePicker
              color={color}
              onChange={(c: ColorResult) => setColor(c.hex)}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
