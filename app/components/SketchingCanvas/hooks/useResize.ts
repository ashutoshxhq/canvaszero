import { useState, useCallback } from "react";
import { Shape, ResizeHandle, ResizeData, Point } from "../types/drawing";
import {
  calculatePencilResize,
  calculateLineResize,
  calculateRectangleResize,
} from "../utils/resizeUtils";

const MOVEMENT_THRESHOLD = 1;

export const useResize = () => {
  const [resizeData, setResizeData] = useState<ResizeData | null>(null);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  const startResize = useCallback(
    (shape: Shape, handle: ResizeHandle, startPoint: Point) => {
      const originalShape = {
        ...shape,
        points: shape.points ? [...shape.points] : undefined,
        scale: { ...shape.scale },
      };

      setResizeData({
        originalShape,
        handle,
        startPoint,

        originalBox: {
          width: shape.width,
          height: shape.height,
        },
        aspectRatio: shape.width / shape.height,
        originalScale: { ...shape.scale },
      });
      setLastPoint(startPoint);
    },
    [],
  );

  const calculateResize = useCallback(
    (
      shape: Shape,
      startPoint: Point,
      currentPoint: Point,
      keepAspectRatio: boolean,
    ): Partial<Shape> => {
      if (!resizeData || !lastPoint) return {};

      const dx = currentPoint.x - lastPoint.x;
      const dy = currentPoint.y - lastPoint.y;

      const movementX = Math.abs(dx) >= MOVEMENT_THRESHOLD ? dx : 0;
      const movementY = Math.abs(dy) >= MOVEMENT_THRESHOLD ? dy : 0;

      if (movementX === 0 && movementY === 0) {
        return {};
      }

      setLastPoint(currentPoint);

      switch (shape.type) {
        case "line": {
          return calculateLineResize(shape, resizeData.handle, currentPoint);
        }

        case "pencil": {
          if (!shape.points || !resizeData.originalShape.points) {
            return {};
          }

          return calculatePencilResize(
            shape,
            resizeData.originalShape,
            resizeData.handle,
            movementX,
            movementY,
            keepAspectRatio,
          );
        }

        default: {
          const resizeResult = calculateRectangleResize(
            shape,
            resizeData.handle,
            movementX,
            movementY,
            keepAspectRatio,
          );

          return {
            ...resizeResult,
            width: Math.max(resizeResult.width, 1),
            height: Math.max(resizeResult.height, 1),
          };
        }
      }
    },
    [resizeData, lastPoint],
  );

  const endResize = useCallback(() => {
    setResizeData(null);
    setLastPoint(null);
  }, []);

  return {
    isResizing: !!resizeData,
    startResize,
    calculateResize,
    endResize,

    currentResizeData: resizeData,
  };
};
