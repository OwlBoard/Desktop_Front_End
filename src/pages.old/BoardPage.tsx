import React from "react";
import BoardTopBar from "../components/BoardTopBar";
import Whiteboard from "../components/Whiteboard";

const BoardPage: React.FC = () => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <BoardTopBar />

      {/* Whiteboard area */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Whiteboard />
      </div>
    </div>
  );
};

export default BoardPage;
