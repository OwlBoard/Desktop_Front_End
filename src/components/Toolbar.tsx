// src/components/Toolbar.tsx
import React from "react";
import type { ToolOption } from "../types/types";

interface ToolbarProps {
  tool: ToolOption;
  setTool: (tool: ToolOption) => void;
}

// Simple map for icons
const toolIcons: Record<ToolOption, string> = {
  brush: "🖌️",
  eraser: "🧼",
  rectangle: "▭",
  circle: "○",
  pan: "🖐️",
  comment: "💬",
};

export default function Toolbar({ tool, setTool }: ToolbarProps): React.ReactElement {
  return (
    <div>
      <h6>Herramientas</h6>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {(Object.keys(toolIcons) as ToolOption[]).map((t) => (
          <button
            key={t}
            className={`btn ${tool === t ? "btn-primary" : "btn-outline-secondary"}`}
            style={{ flex: "1 1 45%" }}
            onClick={() => setTool(t)}
            title={t.charAt(0).toUpperCase() + t.slice(1)}
          >
            {toolIcons[t]}
          </button>
        ))}
      </div>
    </div>
  );
}