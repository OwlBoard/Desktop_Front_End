// src/hooks/useLayers.ts
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { LayerDef, ShapeDef } from '../types/whiteboard';

const initialLayers: LayerDef[] = [{ id: "layer-1", name: "Layer 1", visible: true, locked: false }];

export const useLayers = (setShapes: React.Dispatch<React.SetStateAction<ShapeDef[]>>) => {
  const [layers, setLayers] = useState<LayerDef[]>(initialLayers);
  const [currentLayer, setCurrentLayer] = useState<string>(initialLayers[0].id);

  const addLayer = () => {
    const id = uuidv4();
    setLayers((prev) => [...prev, { id, name: `Layer ${prev.length + 1}`, visible: true, locked: false }]);
    setCurrentLayer(id);
  };

  const removeLayer = (id: string) => {
    if (layers.length === 1) return;
    const nextLayers = layers.filter((l) => l.id !== id);
    setLayers(nextLayers);
    setShapes((prev) => prev.filter((s) => s.layerId !== id));
    if (currentLayer === id) {
      setCurrentLayer(nextLayers[0]?.id || "");
    }
  };

  const toggleLayerVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const toggleLayerLock = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l))
    );
  };

  return { layers, currentLayer, setCurrentLayer, addLayer, removeLayer, toggleLayerVisibility, toggleLayerLock, setLayers };
};