import { useCallback } from "react";
import { Point, Shape, ShapeType } from "../types/drawing";
import { getNextFrameNumber, getContainingFrame } from "../utils/frameUtils";

export const useDrawing = () => {
  const createShape = useCallback(
    (
      type: ShapeType,
      startPoint: Point,
      endPoint: Point,
      fillColor: string,
      strokeColor: string,
      shapes: Shape[] = [],
    ): Shape | null => {
      const minSize = 80;
      const frameMinWidth = 1200;
      const frameMinHeight = 720;

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

      let width = endPoint.x - startPoint.x;
      let height = endPoint.y - startPoint.y;

      const isClick = width === 0 && height === 0;

      if (type !== "line" && isClick) {
        if (type === "frame") {
          width = frameMinWidth;
          height = frameMinHeight;
        } else {
          width = minSize;
          height = minSize;
        }
        endPoint = {
          x: startPoint.x + width,
          y: startPoint.y + height,
        };
      }

      if (type === "line") {
        if (isClick) {
          width = minSize;
          height = minSize;
          endPoint = {
            x: startPoint.x + width,
            y: startPoint.y + height,
          };
        }
        return {
          ...baseShape,
          x: startPoint.x,
          y: startPoint.y,
          width,
          height,
          startPoint: { x: startPoint.x, y: startPoint.y },
          endPoint: { x: endPoint.x, y: endPoint.y },
        };
      }

      const x = width < 0 ? endPoint.x : startPoint.x;
      const y = height < 0 ? endPoint.y : startPoint.y;

      const absWidth = isClick
        ? type === "frame"
          ? frameMinWidth
          : minSize
        : Math.abs(width);
      const absHeight = isClick
        ? type === "frame"
          ? frameMinHeight
          : minSize
        : Math.abs(height);

      const adjustedWidth =
        type === "circle" ? Math.max(absWidth, absHeight) : absWidth;
      const adjustedHeight =
        type === "circle" ? Math.max(absWidth, absHeight) : absHeight;

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
    [],
  );

  const updateShapePosition = useCallback(
    (shapes: Shape[], startPoint: Point, currentPoint: Point): Shape[] => {
      const dx = currentPoint.x - startPoint.x;
      const dy = currentPoint.y - startPoint.y;

      const selectedShapes = shapes.filter((s) => s.isSelected);

      const frames = shapes.filter((s) => s.type === "frame");

      const shapeFrameMap = new Map<string, Shape | null>();
      shapes.forEach((shape) => {
        if (shape.type !== "frame") {
          shapeFrameMap.set(shape.id, getContainingFrame(shape, frames));
        }
      });

      const movingFrames = new Set(
        selectedShapes.filter((s) => s.type === "frame").map((f) => f.id),
      );

      const updatedShapes = shapes.map((shape) => {
        if (shape.isSelected) {
          return {
            ...shape,
            x: shape.x + dx,
            y: shape.y + dy,
          };
        }

        const containingFrame = shapeFrameMap.get(shape.id);
        if (containingFrame && movingFrames.has(containingFrame.id)) {
          return {
            ...shape,
            x: shape.x + dx,
            y: shape.y + dy,
          };
        }

        return shape;
      });

      return updatedShapes;
    },
    [],
  );

  return { createShape, updateShapePosition };
};
