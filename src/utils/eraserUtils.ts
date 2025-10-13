import { v4 as uuidv4 } from "uuid";
import type { ShapeDef, LineShape } from "../types/whiteboard";

// Check if a point is within a distance from a line segment
function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

// Check if eraser path intersects with a shape
export function eraserIntersectsShape(
  eraserPoints: number[],
  eraserWidth: number,
  shape: ShapeDef
): boolean {
  const eraserRadius = eraserWidth / 2;

  // Check line shapes
  if (shape.type === "line" || shape.type === "pen") {
    const lineShape = shape as LineShape;
    const shapePoints = lineShape.points;

    if (shapePoints.length < 4) return false;

    // Check each point in the eraser path against the line
    for (let i = 0; i < eraserPoints.length; i += 2) {
      const ex = eraserPoints[i];
      const ey = eraserPoints[i + 1];

      // Check distance to each segment of the line
      for (let j = 0; j < shapePoints.length - 2; j += 2) {
        const sx1 = shapePoints[j];
        const sy1 = shapePoints[j + 1];
        const sx2 = shapePoints[j + 2];
        const sy2 = shapePoints[j + 3];

        const dist = pointToSegmentDistance(ex, ey, sx1, sy1, sx2, sy2);
        
        if (dist <= eraserRadius + (lineShape.strokeWidth || 1) / 2) {
          return true;
        }
      }
    }
  }

  // Check rect shapes
  if (shape.type === "rect") {
    const { x = 0, y = 0, width = 0, height = 0 } = shape;
    const rectPoints = [
      x, y,
      x + width, y,
      x + width, y + height,
      x, y + height,
      x, y
    ];

    for (let i = 0; i < eraserPoints.length; i += 2) {
      const ex = eraserPoints[i];
      const ey = eraserPoints[i + 1];

      // Check if eraser point is near rect outline
      for (let j = 0; j < rectPoints.length - 2; j += 2) {
        const dist = pointToSegmentDistance(
          ex, ey,
          rectPoints[j], rectPoints[j + 1],
          rectPoints[j + 2], rectPoints[j + 3]
        );
        
        if (dist < eraserRadius) {
          return true;
        }
      }

      // Check if eraser is inside filled rect
      if (shape.fill && shape.fill !== "transparent") {
        if (ex >= x && ex <= x + width && ey >= y && ey <= y + height) {
          return true;
        }
      }
    }
  }

  // Check circle/ellipse shapes
  if (shape.type === "circle" || shape.type === "ellipse") {
    const { x = 0, y = 0, radiusX = 0, radiusY = 0 } = shape;

    for (let i = 0; i < eraserPoints.length; i += 2) {
      const ex = eraserPoints[i];
      const ey = eraserPoints[i + 1];

      // Distance from eraser point to circle center
      const dx = (ex - x) / (radiusX || 1);
      const dy = (ey - y) / (radiusY || radiusX || 1);
      const normalizedDist = Math.sqrt(dx * dx + dy * dy);

      // Check if eraser intersects with circle outline
      const outlineThickness = (shape.strokeWidth || 1) / (radiusX || 1);
      if (Math.abs(normalizedDist - 1) < (eraserRadius / (radiusX || 1) + outlineThickness)) {
        return true;
      }

      // Check if eraser is inside filled circle
      if (shape.fill && shape.fill !== "transparent" && normalizedDist < 1) {
        return true;
      }
    }
  }

  // Check polygon shapes
  if (shape.type === "polygon") {
    const polyPoints = (shape as any).points || [];
    
    for (let i = 0; i < eraserPoints.length; i += 2) {
      const ex = eraserPoints[i];
      const ey = eraserPoints[i + 1];

      // Check if eraser point is near polygon outline
      for (let j = 0; j < polyPoints.length; j += 2) {
        const nextJ = (j + 2) % polyPoints.length;
        const dist = pointToSegmentDistance(
          ex, ey,
          polyPoints[j], polyPoints[j + 1],
          polyPoints[nextJ], polyPoints[nextJ + 1]
        );
        
        if (dist < eraserRadius) {
          return true;
        }
      }
    }
  }

  return false;
}

// Split a line at intersection points with eraser
export function splitLineAtEraserIntersection(
  lineShape: LineShape,
  eraserPoints: number[],
  eraserWidth: number
): LineShape[] {
  const points = lineShape.points;
  const eraserRadius = eraserWidth / 2;
  const segments: LineShape[] = [];
  let currentSegment: number[] = [];

  // Check each point in the line
  for (let i = 0; i < points.length; i += 2) {
    const px = points[i];
    const py = points[i + 1];
    
    let isErased = false;

    // Check if this point is close to any point in the eraser path
    for (let j = 0; j < eraserPoints.length; j += 2) {
      const ex = eraserPoints[j];
      const ey = eraserPoints[j + 1];

      const dist = Math.sqrt((px - ex) ** 2 + (py - ey) ** 2);
      
      if (dist <= eraserRadius + (lineShape.strokeWidth || 1) / 2) {
        isErased = true;
        break;
      }
    }

    if (!isErased) {
      currentSegment.push(px, py);
    } else {
      // End current segment if it has enough points
      if (currentSegment.length >= 4) {
        segments.push({
          ...lineShape,
          id: uuidv4(),
          points: [...currentSegment],
        });
      }
      currentSegment = [];
    }
  }

  // Add final segment if it exists
  if (currentSegment.length >= 4) {
    segments.push({
      ...lineShape,
      id: uuidv4(),
      points: [...currentSegment],
    });
  }

  return segments;
}