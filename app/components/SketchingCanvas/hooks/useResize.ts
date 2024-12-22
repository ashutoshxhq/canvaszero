import { useState, useCallback } from "react";
import { Shape, ResizeHandle, ResizeData, Point } from "../types/drawing";
import {
  calculatePencilResize,
  calculateLineResize,
  calculateRectangleResize,
} from "../utils/resizeUtils";

const MOVEMENT_THRESHOLD = 1; // Minimum movement required to trigger resize

export const useResize = () => {
  const [resizeData, setResizeData] = useState<ResizeData | null>(null);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  const startResize = useCallback(
    (shape: Shape, handle: ResizeHandle, startPoint: Point) => {
      // Deep clone the original shape to preserve initial state
      const originalShape = {
        ...shape,
        points: shape.points ? [...shape.points] : undefined,
        scale: { ...shape.scale },
      };

      setResizeData({
        originalShape,
        handle,
        startPoint,
        // Store original dimensions for aspect ratio calculations
        originalBox: {
          width: shape.width,
          height: shape.height,
        },
        aspectRatio: shape.width / shape.height,
        originalScale: { ...shape.scale },
      });
      setLastPoint(startPoint);
    },
    []
  );

  const calculateResize = useCallback(
    (
      shape: Shape,
      startPoint: Point,
      currentPoint: Point,
      keepAspectRatio: boolean
    ): Partial<Shape> => {
      if (!resizeData || !lastPoint) return {};

      // Calculate movement with threshold
      const dx = currentPoint.x - lastPoint.x;
      const dy = currentPoint.y - lastPoint.y;

      // Only update if movement exceeds threshold
      const movementX = Math.abs(dx) >= MOVEMENT_THRESHOLD ? dx : 0;
      const movementY = Math.abs(dy) >= MOVEMENT_THRESHOLD ? dy : 0;

      // Return early if movement is below threshold
      if (movementX === 0 && movementY === 0) {
        return {};
      }

      // Update last point for next calculation
      setLastPoint(currentPoint);

      // Handle different shape types
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
            keepAspectRatio
          );
        }

        default: {
          // For rectangle, circle, and frame shapes
          const resizeResult = calculateRectangleResize(
            shape,
            resizeData.handle,
            movementX,
            movementY,
            keepAspectRatio
          );

          // Apply minimum size constraints
          return {
            ...resizeResult,
            width: Math.max(resizeResult.width, 1),
            height: Math.max(resizeResult.height, 1),
          };
        }
      }
    },
    [resizeData, lastPoint]
  );

  const endResize = useCallback(() => {
    // Clean up resize state
    setResizeData(null);
    setLastPoint(null);
  }, []);

  return {
    isResizing: !!resizeData,
    startResize,
    calculateResize,
    endResize,
    // Expose current resize data for debugging if needed
    currentResizeData: resizeData,
  };
};
