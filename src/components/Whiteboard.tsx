// src/WhiteboardApp.tsx
import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Rect, Circle, Transformer } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuidv4 } from "uuid";
import type { ToolOption, CommentDef } from "../types/types";
// Importar los nuevos componentes
import Toolbar from "./Toolbar";
import PropertiesPanel from "./PropertiesPanel";
import CommentsLayer from "./CommentNode";
import { Html } from 'react-konva-utils';
import CommentNode from "./CommentNode";

// Para evitar error "Cannot find namespace 'JSX'"
import type {} from "react/jsx-runtime";


interface LayerDef {
  id: string;
  name: string;
  visible: boolean;
}

interface BaseShape {
  id: string;
  layerId: string;
  type: string;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  opacity?: number;
  draggable?: boolean;
  globalCompositeOperation?: string;
}

interface LineShape extends BaseShape {
  type: "line";
  points: number[];
}

interface RectShape extends BaseShape {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CircleShape extends BaseShape {
  type: "circle";
  x: number;
  y: number;
  radius: number;
}

type ShapeDef = LineShape | RectShape | CircleShape;

const initialLayers: LayerDef[] = [{ id: "layer-1", name: "Capa 1", visible: true }];

export default function WhiteboardApp(): React.ReactElement {

  // layout refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const shapeNodeRefs = useRef<Record<string, Konva.Node>>({});

  // UI state
  const [tool, setTool] = useState<ToolOption>("brush");
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);
  const [stageScale, setStageScale] = useState(1);
  const [color, setColor] = useState<string>("#111827");
  const [size, setSize] = useState<number>(6);
  const [opacity, setOpacity] = useState<number>(1);
  const [scale, setScale] = useState(1);
  const scaleBy = 1.05; // factor de zoom
  const [isPanning, setIsPanning] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  const [prevTool, setPrevTool] = useState<ToolOption>("brush");

  // layers & shapes
  const [layers, setLayers] = useState<LayerDef[]>(initialLayers);
  const [currentLayer, setCurrentLayer] = useState<string>(initialLayers[0].id);
  const [shapes, setShapes] = useState<ShapeDef[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentDef[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // drawing state
  const isDrawingRef = useRef(false);
  const drawingRef = useRef<ShapeDef | null>(null);

  const handleCommentDrag = (e: any, id: string) => {
    const { x, y } = e.target.position();
    setComments(prevComments =>
      prevComments.map(c =>
        c.id === id ? { ...c, x: Math.round(x), y: Math.round(y) } : c
      )
    );
  };

  // responsive stage size
  const [stageSize, setStageSize] = useState({ width: 1000, height: 700 });
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const reserved = 400; // Ajustado para las barras laterales (200 + 180 + márgenes)
      setStageSize({
        width: Math.max(400, rect.width - reserved),
        height: Math.max(300, rect.height - 40),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // support high DPI (retina)
  const pixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const stagePixelWidth = Math.round(stageSize.width * pixelRatio);
  const stagePixelHeight = Math.round(stageSize.height * pixelRatio);

  // layer functions
  const addLayer = () => {
    const id = uuidv4();
    setLayers((prev) => [...prev, { id, name: `Capa ${prev.length + 1}`, visible: true }]);
    setCurrentLayer(id);
  };

  const removeLayer = (id: string) => {
    if (layers.length === 1) return;
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setShapes((prev) => prev.filter((s) => s.layerId !== id));
    if (currentLayer === id) setCurrentLayer(layers[0].id);
  };

  const toggleLayerVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  // stage events
  const handlePointerDown = (e: any) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getRelativePointerPosition();
    if (!pointer) return;
    
    if (tool === "comment") {
      const newComment: CommentDef = {
        id: uuidv4(),
        x: pointer.x,
        y: pointer.y,
        text: "Nuevo comentario...",
        user: { name: "Usuario" } // Placeholder
      };
      setComments(prev => [...prev, newComment]);
      setTool("select"); // Vuelve a la herramienta de selección
      return; // Termina la función aquí
    }

    if (tool === "select") {
      if (e.target === stage) setSelectedId(null);
      return;
    }

    if (tool === "brush" || tool === "eraser") {
      isDrawingRef.current = true;
      const id = uuidv4();
      const newLine: LineShape = {
        id,
        layerId: currentLayer,
        type: "line",
        points: [pointer.x, pointer.y],
        stroke: color,
        strokeWidth: size,
        opacity,
        draggable: false,
        globalCompositeOperation: tool === "eraser" ? "destination-out" : undefined,
      };
      drawingRef.current = newLine;
      setShapes((prev) => [...prev, newLine]);
    } else if (tool === "rectangle" || tool === "circle") {
      isDrawingRef.current = true;
      const id = uuidv4();
      if (tool === "rectangle") {
        const newRect: RectShape = {
          id,
          layerId: currentLayer,
          type: "rect",
          x: pointer.x,
          y: pointer.y,
          width: 0,
          height: 0,
          stroke: color,
          fill: "",
          strokeWidth: size,
          opacity,
          draggable: false,
        };
        drawingRef.current = newRect;
        setShapes((prev) => [...prev, newRect]);
      } else {
        const newCircle: CircleShape = {
          id,
          layerId: currentLayer,
          type: "circle",
          x: pointer.x,
          y: pointer.y,
          radius: 0,
          stroke: color,
          fill: "",
          strokeWidth: size,
          opacity,
          draggable: false,
        };
        drawingRef.current = newCircle;
        setShapes((prev) => [...prev, newCircle]);
      }
    }
  };

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    if (!stageRef.current) return;

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const scaleBy = 1.05;
    let newScale =
      e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // 🔹 Limitar escala
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    let newPos = { x: 0, y: 0 };

    if (newScale === MIN_SCALE) {
      // reset al estado inicial
      newPos = { x: 0, y: 0 };
    } else {
      newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
    }

    // 🔹 Clamp para que no se salga del área del canvas
    const canvasWidth = stagePixelWidth;
    const canvasHeight = stagePixelHeight;

    const minX = -(canvasWidth * newScale - canvasWidth);
    const minY = -(canvasHeight * newScale - canvasHeight);

    newPos.x = Math.min(0, Math.max(minX, newPos.x));
    newPos.y = Math.min(0, Math.max(minY, newPos.y));

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPrevTool(tool);  // guardamos la herramienta actual
        setTool("pan");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setTool(prevTool); // 🔙 volvemos a la herramienta original
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [tool, prevTool]);

  const handleMouseDownPan = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    setIsPanning(true);
    setLastPos({ x: pointer.x, y: pointer.y });
  };

  const handleMouseMovePan = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPanning || !lastPos) return;
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const dx = pointer.x - lastPos.x;
    const dy = pointer.y - lastPos.y;

    stage.position({
      x: stage.x() + dx,
      y: stage.y() + dy,
    });

    stage.batchDraw();
    setLastPos({ x: pointer.x, y: pointer.y });
  };

  const handleMouseUpPan = () => {
    setIsPanning(false);
    setLastPos(null);
  };

  const handleDragEnd = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.position();
    const maxX = 0;
    const maxY = 0;
    const minX = stagePixelWidth - stage.width() * scale;
    const minY = stagePixelHeight - stage.height() * scale;

    const clampedX = Math.min(maxX, Math.max(minX, pos.x));
    const clampedY = Math.min(maxY, Math.max(minY, pos.y));

    stage.position({ x: clampedX, y: clampedY });
    stage.batchDraw();
  };


  const handlePointerMove = (e: any) => {
    if (!isDrawingRef.current || !drawingRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;

    const current = drawingRef.current;
    if (current.type === "line") {
      (current as LineShape).points = [...(current as LineShape).points, pos.x, pos.y];
      setShapes((prev) => prev.map((s) => (s.id === current.id ? current : s)));
    } else if (current.type === "rect") {
      const rect = current as RectShape;
      rect.width = pos.x - rect.x;
      rect.height = pos.y - rect.y;
      setShapes((prev) => prev.map((s) => (s.id === rect.id ? rect : s)));
    } else if (current.type === "circle") {
      const circ = current as CircleShape;
      const dx = pos.x - circ.x;
      const dy = pos.y - circ.y;
      circ.radius = Math.sqrt(dx * dx + dy * dy);
      setShapes((prev) => prev.map((s) => (s.id === circ.id ? circ : s)));
    }
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    drawingRef.current = null;
  };

  // selection & transformer
  useEffect(() => {
    if (!transformerRef.current) return;
    if (selectedId) {
      const node = shapeNodeRefs.current[selectedId];
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw?.();
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw?.();
    }
  }, [selectedId, shapes]);

  const handleShapeClick = (e: any, id: string) => {
    if (tool !== "select") return;
    setSelectedId(id);
    e.cancelBubble = true;
  };

  

  // helpers
  const onDragEnd = (e: any, shape: ShapeDef) => {
    const node = e.target;
    const { x, y } = node.position();
    setShapes((prev) =>
      prev.map((s) => {
        if (s.id !== shape.id) return s;
        if (s.type === "line") {
          const line = s as LineShape;
          const dx = x - (line.points[0] || 0);
          const dy = y - (line.points[1] || 0);
          const newPoints = line.points.map((val, idx) =>
            idx % 2 === 0 ? val + dx : val + dy
          );
          return { ...line, points: newPoints };
        } else if (s.type === "rect") {
          return { ...(s as RectShape), x, y };
        } else if (s.type === "circle") {
          return { ...(s as CircleShape), x, y };
        }
        return s;
      })
    );
  };

  const onTransformEnd = (e: any, shape: ShapeDef) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    setShapes((prev) =>
      prev.map((s) => {
        if (s.id !== shape.id) return s;
        if (s.type === "rect") {
          const rect = s as RectShape;
          const newW = Math.max(1, rect.width * scaleX);
          const newH = Math.max(1, rect.height * scaleY);
          node.scaleX(1);
          node.scaleY(1);
          return { ...rect, x: node.x(), y: node.y(), width: newW, height: newH };
        } else if (s.type === "circle") {
          const circ = s as CircleShape;
          const newR = Math.max(1, circ.radius * Math.max(scaleX, scaleY));
          node.scaleX(1);
          node.scaleY(1);
          return { ...circ, x: node.x(), y: node.y(), radius: newR };
        }
        return s;
      })
    );
  };

  // export
  const exportPNG = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "whiteboard_export.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const clearCanvas = () => {
    if (!window.confirm("Borrar todo el contenido de la pizarra?")) return;
    setShapes([]);
    setComments([]);
  };

  return (
    <div ref={containerRef} style={{ height: "100vh", display: "flex", background: "#f8fafc" }}>
      {/* left toolbar - INTEGRATED COMPONENTS */}
      <div style={{ width: 200, padding: 12, borderRight: "1px solid #e5e7eb", background: "#ffffff", display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Toolbar tool={tool} setTool={setTool} />
        <PropertiesPanel
          color={color}
          setColor={setColor}
          size={size}
          setSize={setSize}
          opacity={opacity}
          setOpacity={setOpacity}
        />
        <div style={{ marginTop: 'auto', display: "flex", flexDirection: "column", gap: 6 }}>
          <hr/>
          <button className="btn btn-sm btn-outline-secondary" onClick={exportPNG}>Exportar PNG</button>
          <button className="btn btn-sm btn-outline-danger" onClick={clearCanvas}>Borrar todo</button>
        </div>
      </div>

      {/* center canvas */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <div style={{ padding: 8, borderBottom: "1px solid #e5e7eb", background: "#ffffff" }}>
          <strong>Pizarra</strong>
          <span style={{ marginLeft: 12, color: "#6b7280" }}>{layers.length} capas — {shapes.length} objetos</span>
        </div>
        <div style={{ flex: 1, display: "flex", padding: 8 }}>
          <div style={{ flex: 1, background: "#ffffff", border: "1px solid #e5e7eb", position: 'relative' }}>
            <Stage
              ref={stageRef}
              width={stagePixelWidth}
              height={stagePixelHeight}
              scaleX={scale / pixelRatio} 
              scaleY={scale / pixelRatio}
              style={{ width: stageSize.width, height: stageSize.height, background: "#fff" }}
              onMouseDown={tool === "pan" ? handleMouseDownPan : handlePointerDown}
              onMouseMove={tool === "pan" ? handleMouseMovePan : handlePointerMove}
              onMouseUp={tool === "pan" ? handleMouseUpPan : handlePointerUp}
              onMouseLeave={handleMouseUpPan} // dejar de mover si sale del canvas
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              onWheel={handleWheel}
              onDragEnd={handleDragEnd}
            >
              {layers.map((ly) => (
                <Layer key={ly.id} visible={ly.visible}>
                  <Rect
                    x={0}
                    y={0}
                    width={stageSize.width}
                    height={stageSize.height}
                    fill={"transparent"}
                    listening={true}
                    onMouseDown={(e) => {
                      if (tool === "select") {
                        if (e.target === e.target.getStage()) setSelectedId(null);
                      }
                    }}
                  />
                  {shapes.filter((s) => s.layerId === ly.id).map((s) => {
                    if (s.type === "line") {
                      const line = s as LineShape;
                      return (
                        <Line
                          key={line.id}
                          points={line.points}
                          stroke={line.stroke}
                          strokeWidth={line.strokeWidth}
                          lineCap="round"
                          lineJoin="round"
                          opacity={line.opacity}
                          draggable={tool === "select"}
                          onClick={(e) => handleShapeClick(e, line.id)}
                          onTap={(e) => handleShapeClick(e, line.id)}
                          onDragEnd={(e) => onDragEnd(e, line)}
                          ref={(node) => { if (node) shapeNodeRefs.current[line.id] = node; }}
                          // @ts-ignore
                          globalCompositeOperation={line.globalCompositeOperation}
                        />
                      );
                    }
                    if (s.type === "rect") {
                      const rect = s as RectShape;
                      return (
                        <Rect
                          key={rect.id}
                          x={rect.x}
                          y={rect.y}
                          width={rect.width}
                          height={rect.height}
                          stroke={rect.stroke}
                          fill={rect.fill}
                          strokeWidth={rect.strokeWidth}
                          opacity={rect.opacity}
                          draggable={tool === "select"}
                          onClick={(e) => handleShapeClick(e, rect.id)}
                          onTap={(e) => handleShapeClick(e, rect.id)}
                          onDragEnd={(e) => onDragEnd(e, rect)}
                          onTransformEnd={(e) => onTransformEnd(e, rect)}
                          ref={(node) => { if (node) shapeNodeRefs.current[rect.id] = node; }}
                        />
                      );
                    }
                    if (s.type === "circle") {
                      const circ = s as CircleShape;
                      return (
                        <Circle
                          key={circ.id}
                          x={circ.x}
                          y={circ.y}
                          radius={circ.radius}
                          stroke={circ.stroke}
                          fill={circ.fill}
                          strokeWidth={circ.strokeWidth}
                          opacity={circ.opacity}
                          draggable={tool === "select"}
                          onClick={(e) => handleShapeClick(e, circ.id)}
                          onTap={(e) => handleShapeClick(e, circ.id)}
                          onDragEnd={(e) => onDragEnd(e, circ)}
                          onTransformEnd={(e) => onTransformEnd(e, circ)}
                          ref={(node) => { if (node) shapeNodeRefs.current[circ.id] = node; }}
                        />
                      );
                    }
                    return null;
                  })}
                </Layer>
              ))}
              <Layer>
                {comments.map((comment) => (
                  <CommentNode
                    key={comment.id}
                    comment={comment}
                    onDblClick={() => setEditingCommentId(comment.id)}
                    onDragMove={(e) => handleCommentDrag(e, comment.id)} // <-- AÑADIR
                    onDragEnd={(e) => handleCommentDrag(e, comment.id)}   // <-- AÑADIR
                  />
                ))}
                {/* Lógica para mostrar un textarea cuando un comentario se está editando */}
                {comments.find(c => c.id === editingCommentId) && (
                  <Html groupProps={{
                    x: comments.find(c => c.id === editingCommentId)!.x + 20,
                    y: comments.find(c => c.id === editingCommentId)!.y - 20,
                  }}>
                    <textarea
                      style={{
                        width: '200px',
                        height: '100px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        fontSize: '14px',
                        fontFamily: 'sans-serif'
                      }}
                      value={comments.find(c => c.id === editingCommentId)!.text}
                      onChange={(e) => {
                        const newText = e.currentTarget.value;
                        setComments(prev =>
                          prev.map(c => c.id === editingCommentId ? { ...c, text: newText } : c)
                        );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            setEditingCommentId(null); // Guardar con Enter
                        }
                        if (e.key === 'Escape') {
                            setEditingCommentId(null); // Cancelar con Escape
                        }
                      }}
                      autoFocus
                    />
                  </Html>
                )}
              </Layer>
              <Layer>
                <Transformer
                  ref={transformerRef}
                  rotateEnabled={true}
                />
              </Layer>
            </Stage>
          </div>
        </div>
      </div>

      {/* right sidebar layers */}
      <div style={{ width: 180, padding: 12, borderLeft: "1px solid #e5e7eb", background: "#ffffff" }}>
        <h6 style={{ marginTop: 0 }}>Capas</h6>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {layers.map((ly) => (
            <div
              key={ly.id}
              style={{
                padding: 6,
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                background: currentLayer === ly.id ? "#e0f2fe" : "#f9fafb",
                cursor: 'pointer'
              }}
              onClick={() => setCurrentLayer(ly.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, userSelect: 'none' }}>{ly.name}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn btn-sm btn-light" style={{ fontSize: 11, padding: "2px 4px" }} onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(ly.id)}}>
                    {ly.visible ? "👁️" : "🚫"}
                  </button>
                  <button className="btn btn-sm btn-light" style={{ fontSize: 11, padding: "2px 4px" }} onClick={(e) => { e.stopPropagation(); removeLayer(ly.id)}}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-sm btn-secondary mt-2 w-100" onClick={addLayer}>+ Añadir capa</button>
      </div>
    </div>
  );
}