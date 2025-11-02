// src/hooks/useShapes.ts
import { useState, useRef } from 'react';
import type { ShapeDef, RectShape, CircleShape, PolygonShape } from '../types/whiteboard';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';

export const useShapes = () => {
  const [shapes, setShapes] = useState<ShapeDef[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const shapeNodeRefs = useRef<Record<string, Konva.Node>>({});

  const onDragEnd = (e: KonvaEventObject<DragEvent>, shapeId: string) => {
    const node = e.target;
    const pos = node.position();
    setShapes(prev => prev.map(s => s.id !== shapeId ? s : { ...s, x: pos.x, y: pos.y }));
  };

  const onTransformEnd = (e: KonvaEventObject<Event>, shapeId: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    setShapes(prev => prev.map(s => {
      if (s.id !== shapeId) return s;
      
      node.scaleX(1);
      node.scaleY(1);

      const commonProps = { x: node.x(), y: node.y(), rotation };

      if (s.type === "rect") {
        const rect = s as RectShape;
        return { ...rect, ...commonProps, width: Math.max(5, rect.width * scaleX), height: Math.max(5, rect.height * scaleY) };
      }
      if (s.type === "circle" || s.type === "ellipse") {
        const circ = s as CircleShape;
        return { ...circ, ...commonProps, radiusX: Math.max(5, circ.radiusX * scaleX), radiusY: Math.max(5, (circ.radiusY || circ.radiusX) * scaleY) };
      }
      if (s.type === "polygon") {
        const poly = s as PolygonShape;
        return { ...poly, ...commonProps, radius: Math.max(5, poly.radius * Math.max(scaleX, scaleY)) };
      }
      return s;
    }));
  };

  const deleteSelectedShapes = () => {
    if (window.confirm('Delete selected objects?')) {
      setShapes(prev => prev.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    }
  };

  return { shapes, setShapes, selectedIds, setSelectedIds, shapeNodeRefs, onDragEnd, onTransformEnd, deleteSelectedShapes };
};