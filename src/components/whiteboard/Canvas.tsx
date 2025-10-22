import React, { useRef, useEffect } from "react";
import { Stage, Layer, Line, Rect, Circle, Transformer, Group } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import type { ShapeDef, LayerDef, PolygonShape } from "../../types/whiteboard";
import type { CommentDef } from "../../types/types";
import CommentNode from "../CommentNode";
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "../../hooks/useCamera";

interface CanvasProps {
  stageSize: { width: number; height: number };
  stageRef: React.RefObject<Konva.Stage | null>;
  camera: { x: number; y: number; zoom: number };
  layers: LayerDef[];
  shapes: ShapeDef[];
  selectedIds: string[];
  shapeNodeRefs: React.MutableRefObject<Record<string, Konva.Node>>;
  tool: string;
  setShapes: React.Dispatch<React.SetStateAction<ShapeDef[]>>;
  onWheel: (e: KonvaEventObject<WheelEvent>) => void;
  onPointerDown: (e: KonvaEventObject<any>) => void;
  onPointerMove: (e: KonvaEventObject<any>) => void;
  onPointerUp: (e: KonvaEventObject<any>) => void;
  onShapeClick: (e: KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>, id: string) => void;
  onTransformEnd: (e: KonvaEventObject<Event>, id: string) => void;
  comments: CommentDef[];
  editingCommentId: string | null;
  editingCommentText: string;
  setEditingCommentId: (id: string | null) => void;
  setEditingCommentText: (text: string) => void;
  saveTemporaryComment: (id: string, text: string) => Promise<any>;
  cancelTemporaryComment: (id: string) => void;
  updateComment: (id: string, text: string) => Promise<any>;
  deleteComment: (id: string) => Promise<any>;
  handleCommentDrag: (e: KonvaEventObject<DragEvent>, id: string) => void;
}

export function Canvas({
  stageSize,
  stageRef,
  camera,
  layers,
  shapes,
  selectedIds,
  shapeNodeRefs,
  tool,
  setShapes,
  onWheel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onShapeClick,
  onDragEnd,
  onTransformEnd,
  comments,
  editingCommentId,
  editingCommentText,
  setEditingCommentId,
  setEditingCommentText,
  saveTemporaryComment,
  cancelTemporaryComment,
  updateComment,
  deleteComment,
  handleCommentDrag,
}: CanvasProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  // Detener dibujo si el mouse sale del canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (stageRef.current) {
        const fakeEvent = { evt: new MouseEvent("mouseup") } as KonvaEventObject<any>;
        onPointerUp(fakeEvent);
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [onPointerUp, stageRef]);

  // Actualizar selección en Transformer
  useEffect(() => {
    if (transformerRef.current) {
      const nodes = selectedIds
        .map((id) => shapeNodeRefs.current[id])
        .filter(Boolean)
        .filter((node) => node.getClassName() !== "Line");
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds, shapes, shapeNodeRefs]);

  return (
    <div
      style={{
        flex: 1,
        background: "#4d5a77ff",
        position: "relative",
        overflow: "hidden",
        width: `${stageSize.width}px`,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={onWheel}
        onMouseDown={(e) => {
          console.log('🎯 STAGE CLICKED!', { tool, target: e.target.name() });
          onPointerDown(e);
        }}
        onMouseMove={tool !== "comment" ? onPointerMove : undefined}
        onMouseUp={tool !== "comment" ? onPointerUp : undefined}
        onMouseLeave={(e) => onPointerUp(e as KonvaEventObject<any>)}
      >
        {/* Fondo y shapes */}
        <Layer x={camera.x} y={camera.y} scaleX={camera.zoom} scaleY={camera.zoom}>
          <Rect
            x={0}
            y={0}
            width={VIRTUAL_WIDTH}
            height={VIRTUAL_HEIGHT}
            fill="#ffffff"
            name="background"
            shadowColor="black"
            shadowBlur={20}
            shadowOpacity={0.15}
            shadowOffsetX={10}
            shadowOffsetY={10}
            listening={true}
          />

          {layers.map((ly) => {
            const layerShapes = shapes.filter((s) => s.layerId === ly.id);
            return (
              <Group key={ly.id} visible={ly.visible}>
                {layerShapes.map((s) => {
                  if ((s as any).isEraser) return null;
                  const isLocked = ly.locked;
                  const isLine = s.type === "line" || s.type === "pen";
                  const isSelectable = tool === "select" && !isLocked && !isLine;
                  const commonProps = {
                    ...s,
                    draggable: isSelectable,
                    listening: isSelectable,
                    onClick: (e: KonvaEventObject<MouseEvent>) => {
                      if (isSelectable) onShapeClick(e, s.id);
                    },
                    onDragEnd: (e: KonvaEventObject<DragEvent>) => onDragEnd(e, s.id),
                    onTransformEnd: (e: KonvaEventObject<Event>) => onTransformEnd(e, s.id),
                    ref: (node: Konva.Node | null) => {
                      if (node) shapeNodeRefs.current[s.id] = node;
                    },
                  };

                  if (isLine)
                    return <Line key={s.id} {...commonProps} lineCap="round" lineJoin="round" />;
                  if (s.type === "rect") return <Rect key={s.id} {...commonProps} />;
                  if (s.type === "circle" || s.type === "ellipse")
                    return <Circle key={s.id} {...commonProps} radius={s.radiusX} />;
                  if (s.type === "polygon")
                    return (
                      <Line
                        key={s.id}
                        points={(s as PolygonShape).points}
                        closed
                        {...commonProps}
                      />
                    );
                  return null;
                })}
              </Group>
            );
          })}

          {/* 💬 Comentarios */}
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              onDblClick={() => {
                setEditingCommentId(comment.id);
                setEditingCommentText(comment.text);
              }}
              onDragMove={(e) => handleCommentDrag(e, comment.id)}
              onDragEnd={(e) => handleCommentDrag(e, comment.id)}
              editingCommentId={editingCommentId}
              editingCommentText={editingCommentText}
              setEditingCommentId={setEditingCommentId}
              setEditingCommentText={setEditingCommentText}
              saveTemporaryComment={saveTemporaryComment}
              cancelTemporaryComment={cancelTemporaryComment}
              updateComment={updateComment}
              deleteComment={deleteComment}
            />
          ))}
        </Layer>

        {/* Transformer */}
        <Layer x={camera.x} y={camera.y} scaleX={camera.zoom} scaleY={camera.zoom}>
          <Transformer
            ref={transformerRef}
            borderStrokeWidth={2 / camera.zoom}
            anchorSize={8 / camera.zoom}
          />
        </Layer>
      </Stage>
    </div>
  );
}
