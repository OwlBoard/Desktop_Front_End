// src/hooks/useCamera.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';

export const VIRTUAL_WIDTH = 3840;
export const VIRTUAL_HEIGHT = 2160;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const OVERPAN_MARGIN = 500;

export const useCamera = (tool: string, stageSize: { width: number; height: number }, stageRef: React.RefObject<Konva.Stage | null>) => {
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const isPanningRef = useRef(false);
  const lastPanPosRef = useRef<{ x: number; y: number } | null>(null);

  const screenToWorld = useCallback((screenX: number, screenY: number) => ({
    x: (screenX - camera.x) / camera.zoom,
    y: (screenY - camera.y) / camera.zoom,
  }), [camera]);
  
  // --- LÓGICA DE PANEO GLOBAL ---
  // Mover
  const handlePanMove = useCallback((event: MouseEvent) => {
    if (!isPanningRef.current || !lastPanPosRef.current) return;
    
    const dx = event.clientX - lastPanPosRef.current.x;
    const dy = event.clientY - lastPanPosRef.current.y;

    setCamera(prev => {
      const nextX = prev.x + dx;
      const nextY = prev.y + dy;

      const maxX = OVERPAN_MARGIN;
      const minX = -(VIRTUAL_WIDTH * prev.zoom) + stageSize.width - OVERPAN_MARGIN;
      const maxY = OVERPAN_MARGIN;
      const minY = -(VIRTUAL_HEIGHT * prev.zoom) + stageSize.height - OVERPAN_MARGIN;
      
      const clampedX = Math.max(minX, Math.min(nextX, maxX));
      const clampedY = Math.max(minY, Math.min(nextY, maxY));

      return { ...prev, x: clampedX, y: clampedY };
    });

    lastPanPosRef.current = { x: event.clientX, y: event.clientY };
  }, [stageSize.width, stageSize.height]);

  // Soltar
  const handlePanEnd = useCallback(() => {
    isPanningRef.current = false;
    lastPanPosRef.current = null;
    const stage = stageRef.current;
    if (stage) {
      stage.container().style.cursor = tool === "pan" ? 'grab' : 'default';
    }
    // Limpiamos los listeners globales
    window.removeEventListener('mousemove', handlePanMove);
    window.removeEventListener('mouseup', handlePanEnd);
  }, [tool, handlePanMove]);

  // Empezar
  const handlePanStart = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool !== 'pan') return;
    
    const stage = stageRef.current;
    if (!stage) return;

    isPanningRef.current = true;
    // Usamos clientX/Y para que funcione fuera del canvas
    lastPanPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };
    stage.container().style.cursor = 'grabbing';
    
    // Añadimos listeners globales
    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', handlePanEnd, { once: true }); // { once: true } es una seguridad extra
  }, [tool, handlePanMove, handlePanEnd]);

  // Limpieza por si el componente se desmonta
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', handlePanEnd);
    };
  }, [handlePanMove, handlePanEnd]);
  
  // ... (El resto de la lógica como handleWheel y resetCamera no cambia)
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.1;
    const oldZoom = camera.zoom;
    const newZoom = e.evt.deltaY > 0
      ? Math.max(MIN_ZOOM, oldZoom / scaleBy)
      : Math.min(MAX_ZOOM, oldZoom * scaleBy);

    const mousePointTo = screenToWorld(pointer.x, pointer.y);

    const newCamera = {
      x: pointer.x - mousePointTo.x * newZoom,
      y: pointer.y - mousePointTo.y * newZoom,
      zoom: newZoom
    };
    setCamera(newCamera);
  }, [camera.zoom, screenToWorld]);

  const resetCamera = useCallback(() => {
    setCamera({ x: 0, y: 0, zoom: 1 });
  }, []);

  return { camera, handleWheel, resetCamera, screenToWorld, isPanningRef, handlePanStart };
};