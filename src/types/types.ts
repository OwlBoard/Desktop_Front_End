// Tipos globales de la pizarra

export type ToolOption = "brush" | "eraser" | "rectangle" | "circle" | "line" | "select" | "pan" | "comment";

export interface CommentDef {
  id: string;
  x: number;
  y: number;
  text: string;
  user: {
    name: string;
  };
  // Campos adicionales para integración con backend
  backendId?: string;
  dashboardId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}