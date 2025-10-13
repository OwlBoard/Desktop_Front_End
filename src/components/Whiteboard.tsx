import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";

import { useCamera } from "../hooks/useCamera";
import { useLayers } from "../hooks/useLayers";
import { useShapes } from "../hooks/useShapes";
import { useDrawing } from "../hooks/useDrawing";
import { useComments } from "../hooks/useComments";

import { Canvas } from "./whiteboard/Canvas";
import { RightSidebar } from "./whiteboard/RightSidebar";
import Toolbar from "./whiteboard/Toolbar";
import PropertiesPanel from "./PropertiesPanel";

import { ToolOption } from "../types/types";
import { getUserMongoId } from "../utils/UserMongoId";

export default function WhiteboardApp(): React.ReactElement {
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  const [tool, setTool] = useState<ToolOption>("select");
  const [color, setColor] = useState<string>("#111827");
  const [fillColor, setFillColor] = useState<string>("transparent");
  const [size, setSize] = useState<number>(2);
  const [opacity, setOpacity] = useState<number>(1);
  const [stageSize, setStageSize] = useState({ width: 1000, height: 700 });

  const USER_ID = getUserMongoId();
  const DASHBOARD_ID = "507f1f77bcf86cd799439011";

  const {
    comments,
    createTemporaryComment,
    saveTemporaryComment,
    cancelTemporaryComment,
    updateComment,
    deleteComment,
    updateCommentPosition,
  } = useComments({ dashboardId: DASHBOARD_ID, userId: USER_ID });

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState<string>("");

  const { shapes, setShapes, selectedIds, setSelectedIds, shapeNodeRefs, onDragEnd, onTransformEnd, deleteSelectedShapes } = useShapes();
  const { layers, currentLayer, setCurrentLayer, addLayer, removeLayer, toggleLayerVisibility, toggleLayerLock, setLayers } = useLayers(setShapes);
  const { camera, handleWheel, resetCamera, screenToWorld, handlePanStart } = useCamera(tool, stageSize, stageRef);
  const drawing = useDrawing({ tool, currentLayer, color, fillColor, size, opacity, setShapes, screenToWorld });

  const handleMoveLayer = (id: string, direction: "up" | "down") => {
    setLayers((prev) => {
      const index = prev.findIndex((l) => l.id === id);
      if (index === -1) return prev;
      const newLayers = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= newLayers.length) return prev;
      [newLayers[index], newLayers[target]] = [newLayers[target], newLayers[index]];
      return newLayers;
    });
  };

  const handleCommentDrag = (e: KonvaEventObject<DragEvent>, id: string) => {
    const { x, y } = e.target.position();
    updateCommentPosition(id, x, y);
  };

  const handlePointerDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === "pan") {
      handlePanStart(e);
      return;
    }
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (tool === "comment") {
      // 🔹 Corrige coordenadas del comentario
      const { x, y } = screenToWorld(pointer.x, pointer.y);
      const tempComment = createTemporaryComment(x, y);
      setEditingCommentId(tempComment.id);
      setEditingCommentText("");
      setTool("select");
      return;
    }

    const clickedOnShape = e.target !== stage && e.target.name() !== "background";
    if (e.target === stage || e.target.name() === "background") setSelectedIds([]);

    const currentLayerObj = layers.find((l) => l.id === currentLayer);
    if (currentLayerObj?.locked) return;

    if (tool !== "select" && tool !== "comment" && !clickedOnShape) {
      drawing.startDrawing(screenToWorld(pointer.x, pointer.y));
    }
  };

  const handlePointerMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (drawing.isDrawing.current) {
      const pointer = stageRef.current?.getPointerPosition();
      if (pointer) drawing.draw(screenToWorld(pointer.x, pointer.y));
    }
  };

  const handlePointerUp = () => {
    if (drawing.isDrawing.current) drawing.stopDrawing();
  };

  const handleShapeClick = (e: KonvaEventObject<MouseEvent>, id: string) => {
    if (tool !== "select") return;
    e.cancelBubble = true;
    setSelectedIds((prev) =>
      e.evt.shiftKey ? (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]) : [id]
    );
  };

  useEffect(() => {
    const measure = () => {
      if (canvasWrapperRef.current) {
        const rect = canvasWrapperRef.current.getBoundingClientRect();
        setStageSize({ width: rect.width, height: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: `225px 1fr 270px 240px`,
        background: " rgba(15, 23, 42, 0.65)",
      }}
    >
      <div style={{ background: " rgba(15, 23, 42, 0.65)", borderRight: "1px solid  rgba(15, 23, 42, 0.65)", padding: 12 }}>
        <Toolbar tool={tool} setTool={setTool} />
        <PropertiesPanel color={color} setColor={setColor} fillColor={fillColor} setFillColor={setFillColor} size={size} setSize={setSize} opacity={opacity} setOpacity={setOpacity} />
      </div>

      <div ref={canvasWrapperRef} style={{ position: "relative", overflow: "hidden" }}>
        <Canvas
          stageSize={stageSize}
          stageRef={stageRef}
          camera={camera}
          layers={layers}
          shapes={shapes}
          selectedIds={selectedIds}
          shapeNodeRefs={shapeNodeRefs}
          tool={tool}
          setShapes={setShapes}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onShapeClick={handleShapeClick}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
          comments={comments}
          editingCommentId={editingCommentId}
          editingCommentText={editingCommentText}
          setEditingCommentId={setEditingCommentId}
          setEditingCommentText={setEditingCommentText}
          saveTemporaryComment={saveTemporaryComment}
          cancelTemporaryComment={cancelTemporaryComment}
          updateComment={updateComment}
          deleteComment={deleteComment}
          handleCommentDrag={handleCommentDrag}
        />
      </div>

      <div style={{ background: " rgba(15, 23, 42, 0.65)", borderLeft: "1px solid #e5e7eb", padding: 12 }}>
        <RightSidebar
          layers={layers}
          currentLayer={currentLayer}
          selectedIds={selectedIds}
          onSetCurrentLayer={setCurrentLayer}
          onAddLayer={addLayer}
          onRemoveLayer={removeLayer}
          onToggleVisibility={toggleLayerVisibility}
          onToggleLock={toggleLayerLock}
          onDeleteSelected={deleteSelectedShapes}
          onMoveLayer={handleMoveLayer}
        />
      </div>
    </div>
  );
}
