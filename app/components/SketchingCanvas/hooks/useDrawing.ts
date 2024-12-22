import { useCallback } from "react";
import { Point, Shape, ShapeType } from "../types/drawing";
import { getNextFrameNumber } from "../utils/frameUtils";

export const useDrawing = () => {
  const createShape = useCallback(
    (
      type: ShapeType,
      startPoint: Point,
      endPoint: Point,
      fillColor: string,
      strokeColor: string,
      shapes: Shape[] = []
    ): Shape | null => {
      const baseShape = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        fillColor,
        strokeColor,
        isSelected: false,
        rotation: 0,
        scale: { x: 1, y: 1 },
        borderRadius: 8,
      };

      if (type === "pencil") {
        return {
          ...baseShape,
          x: startPoint.x,
          y: startPoint.y,
          width: 0,
          height: 0,
          points: [],
        };
      }

      const width = endPoint.x - startPoint.x;
      const height = endPoint.y - startPoint.y;

      // For line tool, allow zero width or height
      if (type !== "line" && width === 0 && height === 0) {
        return null;
      }

      const x = startPoint.x;
      const y = startPoint.y;

      const adjustedWidth =
        type === "circle" ? Math.max(Math.abs(width), Math.abs(height)) : width;
      const adjustedHeight =
        type === "circle"
          ? Math.max(Math.abs(width), Math.abs(height))
          : height;

      const shape: Shape = {
        ...baseShape,
        x,
        y,
        width: adjustedWidth,
        height: adjustedHeight,
      };

      if (type === "frame") {
        shape.name = `Frame ${getNextFrameNumber(shapes)}`;
      }

      return shape;
    },
    []
  );

  const updateShapePosition = useCallback(
    (shapes: Shape[], startPoint: Point, currentPoint: Point): Shape[] => {
      const dx = currentPoint.x - startPoint.x;
      const dy = currentPoint.y - startPoint.y;

      return shapes.map((shape) => {
        if (!shape.isSelected) return shape;

        if (shape.type === "pencil" && shape.points) {
          return {
            ...shape,
            x: shape.x + dx,
            y: shape.y + dy,
          };
        }

        return {
          ...shape,
          x: shape.x + dx,
          y: shape.y + dy,
        };
      });
    },
    []
  );

  return {
    createShape,
    updateShapePosition,
  };
};
