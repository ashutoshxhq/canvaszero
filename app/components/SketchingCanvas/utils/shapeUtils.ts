import { Point, Shape } from "../types/drawing";

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
  const tolerance = 5;

  if (shape.type === "pencil" && shape.points) {
    // Transform points based on shape's current position and scale
    const transformedPoints = shape.points.map((p) => ({
      x: p.x * shape.scale.x,
      y: p.y * shape.scale.y,
    }));

    // Get bounding box of transformed points
    const box = getBoundingBox(transformedPoints);

    // Check if point is within the padded bounding box
    return (
      point.x >= shape.x + box.x - tolerance &&
      point.x <= shape.x + box.x + box.width + tolerance &&
      point.y >= shape.y + box.y - tolerance &&
      point.y <= shape.y + box.y + box.height + tolerance
    );
  }

  switch (shape.type) {
    case "rectangle":
    case "frame": {
      // Check if point is near the border for frames
      if (shape.type === "frame") {
        const borderWidth = 10; // Clickable border width
        const isNearHorizontalBorder =
          (point.y >= shape.y - tolerance &&
            point.y <= shape.y + borderWidth) ||
          (point.y >= shape.y + shape.height - borderWidth &&
            point.y <= shape.y + shape.height + tolerance);
        const isNearVerticalBorder =
          (point.x >= shape.x - tolerance &&
            point.x <= shape.x + borderWidth) ||
          (point.x >= shape.x + shape.width - borderWidth &&
            point.x <= shape.x + shape.width + tolerance);

        return (
          (isNearHorizontalBorder &&
            point.x >= shape.x - tolerance &&
            point.x <= shape.x + shape.width + tolerance) ||
          (isNearVerticalBorder &&
            point.y >= shape.y - tolerance &&
            point.y <= shape.y + shape.height + tolerance)
        );
      }

      // Regular rectangle hit detection
      return (
        point.x >= shape.x - tolerance &&
        point.x <= shape.x + shape.width + tolerance &&
        point.y >= shape.y - tolerance &&
        point.y <= shape.y + shape.height + tolerance
      );
    }

    case "circle": {
      const centerX = shape.x + shape.width / 2;
      const centerY = shape.y + shape.height / 2;
      const radius = Math.min(shape.width, shape.height) / 2;
      const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
      );
      return distance <= radius + tolerance;
    }

    case "line": {
      const x1 = shape.x;
      const y1 = shape.y;
      const x2 = shape.x + shape.width;
      const y2 = shape.y + shape.height;

      // Calculate distance from point to line segment
      const A = point.x - x1;
      const B = point.y - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const len_sq = C * C + D * D;
      let param = -1;

      if (len_sq !== 0) {
        param = dot / len_sq;
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

      const dx = point.x - xx;
      const dy = point.y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= tolerance;
    }

    default:
      return false;
  }
};
