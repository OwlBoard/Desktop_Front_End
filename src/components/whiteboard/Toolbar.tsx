import React from "react";
import type { ToolOption } from "../../types/types";
import "../../styles/Toolbar.css";

interface ToolbarProps {
  tool: ToolOption;
  setTool: (tool: ToolOption) => void;
}

interface ToolConfig {
  icon: string;
  label: string;
  shortcut?: string;
}

const toolConfigs: Record<ToolOption, ToolConfig> = {
  select: { icon: "↖️", label: "Selection Tool", shortcut: "V" },
  pen: { icon: "✒️", label: "Pen Tool", shortcut: "P" },
  brush: { icon: "🖌️", label: "Brush Tool", shortcut: "B" },
  line: { icon: "📏", label: "Line Tool", shortcut: "L" },
  rectangle: { icon: "▭", label: "Rectangle", shortcut: "M" },
  circle: { icon: "◯", label: "Circle", shortcut: "O" },
  ellipse: { icon: "⬭", label: "Ellipse", shortcut: "E" },
  polygon: { icon: "⬡", label: "Polygon", shortcut: "N" },
  eraser: { icon: "🧼", label: "Eraser", shortcut: "D" },
  pan: { icon: "🖐️", label: "Pan Tool", shortcut: "Space" },
  comment: { icon: "💬", label: "Comment", shortcut: "C" },
};

export default function Toolbar({ tool, setTool }: ToolbarProps): React.ReactElement {
  const toolGroups = [
    {
      name: "Selection",
      tools: ["select" as ToolOption, "pan" as ToolOption]
    },
    {
      name: "Drawing",
      tools: ["pen" as ToolOption, "brush" as ToolOption, "line" as ToolOption]
    },
    {
      name: "Shapes",
      tools: ["rectangle" as ToolOption, "circle" as ToolOption, "ellipse" as ToolOption, "polygon" as ToolOption]
    },
    {
      name: "Other",
      tools: ["eraser" as ToolOption, "comment" as ToolOption]
    }
  ];

  return (
    <div className="toolbar-container">
      <h6>Tools</h6>

      {toolGroups.map((group) => (
        <div key={group.name} style={{ marginBottom: 16 }}>
          <div className="toolbar-group-title">{group.name}</div>
          <div className="toolbar-buttons">
            {group.tools.map((t) => {
              const config = toolConfigs[t];
              const isActive = tool === t;

              return (
                <button
                  key={t}
                  className={`toolbar-button ${isActive ? "active" : ""}`}
                  onClick={() => setTool(t)}
                  title={`${config.label}${config.shortcut ? ` (${config.shortcut})` : ""}`}
                >
                  <span>{config.icon}</span>
                  <span>{config.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
