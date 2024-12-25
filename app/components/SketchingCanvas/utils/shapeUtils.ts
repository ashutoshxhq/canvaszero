import { Point, Shape, SelectionBox } from "../types/drawing";

export const getBoundingBox = (points: Point[]) => {
  if (!points.length) return { x: 0, y: 0, width: 0, height: 0 };

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
};

export const transformPoints = (
  points: Point[],
  scale: { x: number; y: number },
): Point[] => {
  return points.map((point) => ({
    x: point.x * scale.x,
    y: point.y * scale.y,
  }));
};

const distanceToLineSegment = (
  point: Point,
  lineStart: Point,
  lineEnd: Point,
): number => {
  const { x: px, y: py } = point;
  const { x: x1, y: y1 } = lineStart;
  const { x: x2, y: y2 } = lineEnd;

  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;

  return Math.sqrt(dx * dx + dy * dy);
};

export const isPointInShape = (shape: Shape, point: Point): boolean => {
  const { x, y } = point;

  if (shape.type === "line") {
    const lineStart = { x: shape.x, y: shape.y };
    const lineEnd = { x: shape.x + shape.width, y: shape.y + shape.height };
    return distanceToLineSegment(point, lineStart, lineEnd) <= 5;
  }

  let shapeBox = {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  };

  if (shape.type === "pencil" && shape.points) {
    const transformedPoints = transformPoints(shape.points, shape.scale);
    const box = getBoundingBox(transformedPoints);
    shapeBox.x = shape.x + box.x;
    shapeBox.y = shape.y + box.y;
    shapeBox.width = box.width;
    shapeBox.height = box.height;
  }

  // Convert canvas coordinates to shape coordinates
  const shapeX = x - shapeBox.x;
  const shapeY = y - shapeBox.y;

  console.log('Hit detection:', {
    type: shape.type,
    point: { x, y },
    shapeBox,
    shapeCoords: { x: shapeX, y: shapeY },
    isHit: (
      shapeX >= 0 &&
      shapeX <= shapeBox.width &&
      shapeY >= 0 &&
      shapeY <= shapeBox.height
    )
  });

  return (
    shapeX >= 0 &&
    shapeX <= shapeBox.width &&
    shapeY >= 0 &&
    shapeY <= shapeBox.height
  );
};

export const isShapeInSelectionBox = (
  shape: Shape,
  selectionBox: SelectionBox,
): boolean => {
  const minX = Math.min(selectionBox.startPoint.x, selectionBox.endPoint.x);
  const maxX = Math.max(selectionBox.startPoint.x, selectionBox.endPoint.x);
  const minY = Math.min(selectionBox.startPoint.y, selectionBox.endPoint.y);
  const maxY = Math.max(selectionBox.startPoint.y, selectionBox.endPoint.y);

  let shapeBox = {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  };

  if (shape.type === "pencil" && shape.points) {
    const transformedPoints = transformPoints(shape.points, shape.scale);
    const box = getBoundingBox(transformedPoints);
    shapeBox = {
      x: shape.x + box.x,
      y: shape.y + box.y,
      width: box.width,
      height: box.height,
    };
  } else if (shape.type === "text") {
    // For text shapes, use the actual dimensions
    shapeBox = {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    };
  }

  return !(
    shapeBox.x + shapeBox.width < minX ||
    shapeBox.x > maxX ||
    shapeBox.y + shapeBox.height < minY ||
    shapeBox.y > maxY
  );
};
