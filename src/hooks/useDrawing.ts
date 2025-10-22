import { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { ShapeDef, LineShape, RectShape, CircleShape, PolygonShape } from "../types/whiteboard";

interface UseDrawingProps {
  tool: string;
  currentLayer: string;
  color: string;
  fillColor: string;
  size: number;
  opacity: number;
  setShapes: React.Dispatch<React.SetStateAction<ShapeDef[]>>;
  screenToWorld: (x: number, y: number) => { x: number; y: number };
}

export const useDrawing = ({
  tool,
  currentLayer,
  color,
  fillColor,
  size,
  opacity,
  setShapes,
  screenToWorld,
}: UseDrawingProps) => {
  const isDrawingRef = useRef(false);
  const drawingRef = useRef<ShapeDef | null>(null);

  const startDrawing = (worldPos: { x: number; y: number }) => {
    isDrawingRef.current = true;
    const id = uuidv4();
    let newShape: ShapeDef | null = null;

    switch (tool) {
      case "brush":
      case "pen":
        newShape = {
          id,
          layerId: currentLayer,
          type: "line",
          points: [worldPos.x, worldPos.y],
          stroke: color,
          strokeWidth: size,
          opacity,
          tension: 0.5,
          selectable: false,
        } as LineShape;
        break;

      case "eraser":
        newShape = {
          id,
          layerId: currentLayer,
          type: "line",
          points: [worldPos.x, worldPos.y],
          stroke: "#ffffff",
          strokeWidth: size * 2,
          opacity: 1,
          tension: 0.5,
          selectable: false,
        } as LineShape;
        break;

      case "line":
        newShape = {
          id,
          layerId: currentLayer,
          type: "line",
          points: [worldPos.x, worldPos.y, worldPos.x, worldPos.y],
          stroke: color,
          strokeWidth: size,
          opacity,
          tension: 0,
          selectable: false,
        } as LineShape;
        break;

      case "rectangle":
        newShape = {
          id,
          layerId: currentLayer,
          type: "rect",
          x: worldPos.x,
          y: worldPos.y,
          width: 0,
          height: 0,
          stroke: color,
          fill: fillColor,
          strokeWidth: size,
          opacity,
          selectable: true,
        } as RectShape;
        break;

      case "circle":
      case "ellipse":
        newShape = {
          id,
          layerId: currentLayer,
          type: tool,
          x: worldPos.x,
          y: worldPos.y,
          radiusX: 0,
          radiusY: 0,
          stroke: color,
          fill: fillColor,
          strokeWidth: size,
          opacity,
          selectable: true,
        } as CircleShape;
        break;

      case "polygon":
        newShape = {
          id,
          layerId: currentLayer,
          type: "polygon",
          x: worldPos.x,
          y: worldPos.y,
          sides: 6,
          radius: 0,
          stroke: color,
          fill: fillColor,
          strokeWidth: size,
          opacity,
          selectable: true,
          points: [],
        } as PolygonShape;
        break;
    }

    if (newShape) {
      drawingRef.current = newShape;
      setShapes((prev) => [...prev, newShape!]);
    }
  };

  const draw = (worldPos: { x: number; y: number }) => {
    if (!isDrawingRef.current || !drawingRef.current) return;
    const current = drawingRef.current;

    let updatedShape: ShapeDef | null = null;

    if (current.type === "line" && ["brush", "pen", "line", "eraser"].includes(tool)) {
      const lineShape = { ...current } as LineShape;
      if (tool === "brush" || tool === "pen" || tool === "eraser") {
        lineShape.points = [...lineShape.points, worldPos.x, worldPos.y];
      } else {
        lineShape.points = [lineShape.points[0], lineShape.points[1], worldPos.x, worldPos.y];
      }
      updatedShape = lineShape;
    } else if (current.type === "rect") {
      const rect = { ...current } as RectShape;
      rect.width = worldPos.x - rect.x!;
      rect.height = worldPos.y - rect.y!;
      updatedShape = rect;
    } else if (current.type === "circle" || current.type === "ellipse") {
      const circ = { ...current } as CircleShape;
      const dx = Math.abs(worldPos.x - circ.x!);
      const dy = Math.abs(worldPos.y - circ.y!);
      circ.radiusX = tool === "circle" ? Math.sqrt(dx * dx + dy * dy) : dx;
      circ.radiusY = tool === "circle" ? circ.radiusX : dy;
      updatedShape = circ;
    } else if (current.type === "polygon") {
      const poly = { ...current } as PolygonShape;
      const dx = worldPos.x - poly.x!;
      const dy = worldPos.y - poly.y!;
      poly.radius = Math.sqrt(dx * dx + dy * dy);

      const sides = poly.sides || 6;
      const points: number[] = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        points.push(
          poly.x! + poly.radius * Math.cos(angle),
          poly.y! + poly.radius * Math.sin(angle)
        );
      }
      poly.points = points;
      updatedShape = poly;
    }

    if (updatedShape) {
      drawingRef.current = updatedShape;
      setShapes((prev) => prev.map((s) => (s.id === updatedShape!.id ? updatedShape! : s)));
    }
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    drawingRef.current = null;
  };

  return { startDrawing, draw, stopDrawing, isDrawing: isDrawingRef };
};