// src/types/whiteboard.ts
export type ToolOption =
  | "select" | "brush" | "pen" | "eraser" | "rectangle"
  | "circle" | "ellipse" | "polygon" | "line" | "pan" | "comment";

export interface CommentDef {
  id: string;
  backendId?: string;
  userId: string;
  dashboardId: string;
  text: string;
  x: number;
  y: number;
  createdAt: string;
  isTemporary?: boolean;
}

export interface LayerDef {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface BaseShape {
  id: string;
  layerId: string;
  type: string;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  opacity?: number;
  draggable?: boolean;
  x?: number;
  y?: number;
  rotation?: number;
  globalCompositeOperation?: 'source-over' | 'destination-out';
}

export interface LineShape extends BaseShape {
  type: "line" | "pen";
  points: number[];
  tension?: number;
  closed?: boolean;
}

export interface RectShape extends BaseShape {
  type: "rect";
  width: number;
  height: number;
  cornerRadius?: number;
}

export interface CircleShape extends BaseShape {
  type: "circle" | "ellipse";
  radiusX: number;
  radiusY?: number;
}

export interface PolygonShape extends BaseShape {
  type: "polygon";
  sides: number;
  radius: number;
}

export interface PathShape extends BaseShape {
  type: "path";
  data: string;
}

export type ShapeDef = LineShape | RectShape | CircleShape | PolygonShape | PathShape;