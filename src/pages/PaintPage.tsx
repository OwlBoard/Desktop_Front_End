// src/pages/PaintPage.tsx
import React, { useRef } from "react";
import Whiteboard from "../components/Whiteboard";
import BoardTopBar from "../components/BoardTopBar";
import "../styles/PaintPage.css";

const PaintPage: React.FC = () => {
  const whiteboardRef = useRef<any>(null);

  // Handlers for top bar actions
  const handleNew = () => {
    console.log("🆕 New board");
    whiteboardRef.current?.clearCanvas?.();
  };

  const handleSave = () => {
    console.log("💾 Save board");
    whiteboardRef.current?.saveCanvas?.();
  };

  const handleMoveToBin = () => {
    console.log("🗑️ Move to bin");
  };

  const handleUndo = () => {
    console.log("↩️ Undo");
    whiteboardRef.current?.undo?.();
  };

  const handleRedo = () => {
    console.log("↪️ Redo");
    whiteboardRef.current?.redo?.();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: " rgba(15, 23, 42, 0.65);",
        overflow: "hidden",
      }}
    >
      {/* Top bar - Fixed height */}
      <div style={{ 
        height: "64px", 
        flexShrink: 0,
        zIndex: 1000 
      }}>
        <BoardTopBar
          onNew={handleNew}
          onSave={handleSave}
          onMoveToBin={handleMoveToBin}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>

      {/* Whiteboard - Takes remaining space */}
      <div style={{ 
        flex: 1, 
        overflow: "hidden",
        minHeight: 0 // Important for flex child scrolling
      }}>
        <Whiteboard ref={whiteboardRef} />
      </div>
    </div>
  );
};

export default PaintPage;