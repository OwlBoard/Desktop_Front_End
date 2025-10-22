// src/types/types.ts - UPDATED VERSION

// Tool options - expanded with Adobe Illustrator-style tools
export type ToolOption = 
  | "select"      // Selection tool (V)
  | "pen"         // Pen tool for bezier paths (P)
  | "brush"       // Freehand brush (B)
  | "line"        // Straight line tool (L)
  | "rectangle"   // Rectangle tool (M)
  | "circle"      // Circle tool
  | "ellipse"     // Ellipse tool (E)
  | "polygon"     // Polygon tool (N)
  | "eraser"      // Eraser tool
  | "pan"         // Pan/Hand tool (Space)
  | "comment";    // Comment tool (C)

// Comment definition (UNCHANGED - DO NOT MODIFY)
export interface CommentDef {
  id: string;
  backendId?: string;
  x: number;
  y: number;
  text: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

// src/types/types.ts (add this to your existing types file)

export interface CommentDef {
  id: string;
  x: number;
  y: number;
  text: string;
  user: {
    name: string;
  };
  // Backend integration fields
  backendId?: string;
  dashboardId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

