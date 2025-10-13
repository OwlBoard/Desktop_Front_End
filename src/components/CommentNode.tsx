import React, { useState } from "react";
import { Group, Circle, Label, Tag, Text } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Html } from "react-konva-utils";
import { CommentDef } from "../types/types";

interface CommentNodeProps {
  comment: CommentDef;
  onDblClick?: () => void;
  onDragMove?: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  editing?: boolean;
  saveTemporaryComment?: (id: string, text: string) => Promise<any>;
  cancelTemporaryComment?: (id: string) => void;
  updateComment?: (id: string, text: string) => Promise<any>;
  deleteComment?: (id: string) => Promise<any>;
  editingCommentId?: string | null;
  editingCommentText?: string;
  setEditingCommentId?: (id: string | null) => void;
  setEditingCommentText?: (text: string) => void;
}

const CommentNode: React.FC<CommentNodeProps> = ({
  comment,
  onDblClick,
  onDragMove,
  onDragEnd,
  editingCommentId,
  editingCommentText,
  setEditingCommentId,
  setEditingCommentText,
  saveTemporaryComment,
  cancelTemporaryComment,
  updateComment,
  deleteComment,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const isEditing = editingCommentId === comment.id;

  return (
    <Group
      x={comment.x}
      y={comment.y}
      draggable
      onDblClick={onDblClick}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      {/* 🔵 Pin del comentario */}
      <Circle
        radius={8}
        fill="#3b82f6"
        stroke="white"
        strokeWidth={2}
        onClick={handleToggle}
        shadowColor="rgba(0,0,0,0.25)"
        shadowBlur={3}
        shadowOffsetY={2}
      />

      {/* 💬 Caja de comentario (solo si está abierta) */}
      {isOpen && (
        <>
          <Label y={15}>
            <Tag fill="white" stroke="#3b82f6" cornerRadius={6} shadowBlur={4} />
            <Text
              text={`${comment.user?.name || "Anónimo"}:`}
              fontSize={14}
              fill="#1e3a8a"
              padding={5}
            />
          </Label>

          {/* Caja HTML editable */}
          <Html
            divProps={{
              style: {
                position: "absolute",
                top: `${comment.y + 35}px`,
                left: `${comment.x + 20}px`,
                transform: "translate(-50%, 0)",
                zIndex: 10,
              },
            }}
          >
            <div
              style={{
                background: "white",
                border: "1px solid #3b82f6",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                padding: "8px",
                width: "220px",
              }}
            >
              {isEditing ? (
                <>
                  <textarea
                    style={{
                      width: "100%",
                      height: "60px",
                      resize: "none",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      padding: "4px",
                      fontSize: "14px",
                      fontFamily: "Inter, sans-serif",
                    }}
                    value={editingCommentText || ""}
                    onChange={(e) => setEditingCommentText?.(e.target.value)}
                    autoFocus
                  />
                  <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                    <button
                      style={{
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        if (comment.id.startsWith("temp-")) {
                          await saveTemporaryComment?.(comment.id, editingCommentText || "");
                        } else {
                          await updateComment?.(comment.id, editingCommentText || "");
                        }
                        setEditingCommentId?.(null);
                      }}
                    >
                      💾 Guardar
                    </button>
                    <button
                      style={{
                        background: "#e5e7eb",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (comment.id.startsWith("temp-")) {
                          cancelTemporaryComment?.(comment.id);
                        }
                        setEditingCommentId?.(null);
                        setIsOpen(false);
                      }}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: "14px", margin: "4px 0" }}>
                    {comment.text || "(Sin contenido)"}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button
                      style={{
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setEditingCommentId?.(comment.id);
                        setEditingCommentText?.(comment.text);
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                      onClick={() => deleteComment?.(comment.id)}
                    >
                      🗑️ Borrar
                    </button>
                  </div>
                </>
              )}
            </div>
          </Html>
        </>
      )}
    </Group>
  );
};

export default CommentNode;
