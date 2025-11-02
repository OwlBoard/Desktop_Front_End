// src/components/BoardTopBar.tsx
import React from "react";
import { Dropdown } from "react-bootstrap";
import { Undo2, Redo2, UserPlus } from "lucide-react";

interface BoardTopBarProps {
  onNew?: () => void;
  onSave?: () => void;
  onMoveToBin?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const BoardTopBar: React.FC<BoardTopBarProps> = ({
  onNew,
  onSave,
  onMoveToBin,
  onUndo,
  onRedo,
}) => {
  return (
    <div
      style={{
        background: "#0f172a", // azul oscuro elegante
        borderBottom: "1px solid #1e293b",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#f1f5f9",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      {/* Left Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <img
          src="/logo192.png"
          alt="Logo"
          style={{ height: "32px", cursor: "pointer", filter: "brightness(1.1)" }}
        />

        {/* Dropdown Menus */}
        {["File", "Edit", "View"].map((menu) => (
          <Dropdown key={menu}>
            <Dropdown.Toggle
              variant="dark"
              id={`dropdown-${menu.toLowerCase()}`}
              style={{
                background: "transparent",
                border: "1px solid #334155",
                color: "#e2e8f0",
                fontSize: 13,
                padding: "4px 10px",
                borderRadius: 6,
              }}
            >
              {menu}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {menu === "File" && (
                <>
                  <Dropdown.Item onClick={onNew}>New</Dropdown.Item>
                  <Dropdown.Item onClick={onSave}>Save</Dropdown.Item>
                  <Dropdown.Item onClick={onMoveToBin}>Move to Bin</Dropdown.Item>
                </>
              )}
              {menu === "Edit" && (
                <>
                  <Dropdown.Item>Copy</Dropdown.Item>
                  <Dropdown.Item>Paste</Dropdown.Item>
                  <Dropdown.Item>Cut</Dropdown.Item>
                </>
              )}
              {menu === "View" && (
                <>
                  <Dropdown.Item>Zoom In</Dropdown.Item>
                  <Dropdown.Item>Zoom Out</Dropdown.Item>
                  <Dropdown.Item>Full Screen</Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        ))}

        {/* Back to dashboard */}
        <button
          style={{
            background: "transparent",
            border: "1px solid #334155",
            color: "#e2e8f0",
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1e293b")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Right Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          style={iconButtonStyle}
          title="Undo"
          onClick={onUndo}
        >
          <Undo2 size={18} />
        </button>
        <button
          style={iconButtonStyle}
          title="Redo"
          onClick={onRedo}
        >
          <Redo2 size={18} />
        </button>
        <button
          style={{
            background: "#0ea5e9",
            border: "none",
            color: "#fff",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#38bdf8")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#0ea5e9")}
        >
          <UserPlus size={16} /> Invite
        </button>
      </div>
    </div>
  );
};

const iconButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #334155",
  color: "#e2e8f0",
  borderRadius: 6,
  padding: "6px 8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

export default BoardTopBar;
