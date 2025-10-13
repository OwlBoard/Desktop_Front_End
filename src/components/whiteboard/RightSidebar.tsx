import React from "react";
import "../../styles/RightSidebar.css";
import { LayerDef } from "../../types/whiteboard";
import {
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUnlock,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
} from "react-icons/fa";

interface RightSidebarProps {
  layers: LayerDef[];
  currentLayer: string;
  selectedIds: string[];
  onSetCurrentLayer: (id: string) => void;
  onAddLayer: () => void;
  onRemoveLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteSelected: () => void;
  onMoveLayer: (id: string, direction: "up" | "down") => void;
}

export function RightSidebar({
  layers,
  currentLayer,
  selectedIds,
  onSetCurrentLayer,
  onAddLayer,
  onRemoveLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteSelected,
  onMoveLayer,
}: RightSidebarProps) {
  return (
    <div className="right-sidebar">
      <h6>Layers</h6>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {layers.map((ly, index) => (
          <div
            key={ly.id}
            className={`layer-card ${currentLayer === ly.id ? "active" : ""}`}
            onClick={() => onSetCurrentLayer(ly.id)}
          >
            <div className="layer-header">
              <span className="layer-name">{ly.name}</span>

              <div style={{ display: "flex", gap: 4 }}>
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLayer(ly.id, "up");
                  }}
                  disabled={index === 0}
                  title="Move Up"
                >
                  <FaArrowUp size={14} />
                </button>
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLayer(ly.id, "down");
                  }}
                  disabled={index === layers.length - 1}
                  title="Move Down"
                >
                  <FaArrowDown size={14} />
                </button>
              </div>
            </div>

            <div className="layer-actions">
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(ly.id);
                }}
                title={ly.visible ? "Hide Layer" : "Show Layer"}
              >
                {ly.visible ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
              </button>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock(ly.id);
                }}
                title={ly.locked ? "Unlock Layer" : "Lock Layer"}
              >
                {ly.locked ? <FaLock size={14} /> : <FaUnlock size={14} />}
              </button>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveLayer(ly.id);
                }}
                disabled={layers.length === 1}
                title="Delete Layer"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="add-layer-btn" onClick={onAddLayer}>
        <FaPlus size={14} /> Add Layer
      </button>

      {selectedIds.length > 0 && (
        <div className="selected-box">
          <span>
            <strong>{selectedIds.length}</strong>{" "}
            object{selectedIds.length > 1 ? "s" : ""} selected
          </span>

          <button className="delete-selected-btn" onClick={onDeleteSelected}>
            Delete Selected
          </button>
        </div>
      )}
    </div>
  );
}
