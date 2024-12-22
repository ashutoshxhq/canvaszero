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
  scale: { x: number; y: number }
): Point[] => {
  return points.map((point) => ({
    x: point.x * scale.x,
    y: point.y * scale.y,
  }));
};

export const isPointInShape = (shape: Shape, point: Point): boolean => {
  const { x, y } = point;
  const shapeBox = {
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

  return (
    x >= shapeBox.x &&
    x <= shapeBox.x + shapeBox.width &&
    y >= shapeBox.y &&
    y <= shapeBox.y + shapeBox.height
  );
};

export const isShapeInSelectionBox = (shape: Shape, selectionBox: SelectionBox): boolean => {
  // Normalize selection box coordinates
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
  }

  // Check if the shape's bounding box intersects with the selection box
  return !(
    shapeBox.x + shapeBox.width < minX ||
    shapeBox.x > maxX ||
    shapeBox.y + shapeBox.height < minY ||
    shapeBox.y > maxY
  );
};
