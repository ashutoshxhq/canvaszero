import { useCallback, useState } from "react";
import { Point, Shape, ResizeHandle } from "../types/drawing";

interface UseResizeHandlersProps {
  shapes: Shape[];
  onShapeUpdate: (shapes: Shape[]) => void;
  getCanvasPoint: (clientX: number, clientY: number) => Point | null;
}

export const useResizeHandlers = ({
  shapes,
  onShapeUpdate,
  getCanvasPoint,
}: UseResizeHandlersProps) => {
  const [resizeStartPoint, setResizeStartPoint] = useState<Point | null>(null);

  const handleResizeStart = useCallback(
    (
      handle: ResizeHandle,
      e: React.MouseEvent,
      startResize: (shape: Shape, handle: ResizeHandle, point: Point) => void,
    ) => {
      e.stopPropagation();
      const point = getCanvasPoint(e.clientX, e.clientY);
      if (!point) return;

      const selectedShape = shapes.find((s) => s.isSelected);
      if (selectedShape) {
        startResize(selectedShape, handle, point);
        setResizeStartPoint(point);
      }
    },
    [shapes, getCanvasPoint],
  );

  const handleResizeMove = useCallback(
    (
      e: React.MouseEvent,
      isResizing: boolean,
      calculateResize: (
        shape: Shape,
        startPoint: Point,
        currentPoint: Point,
        keepAspectRatio: boolean,
      ) => Partial<Shape>,
    ) => {
      if (!isResizing || !resizeStartPoint) return;

      const currentPoint = getCanvasPoint(e.clientX, e.clientY);
      if (!currentPoint) return;

      const selectedShape = shapes.find((s) => s.isSelected);
      if (selectedShape) {
        const resizedShape = calculateResize(
          selectedShape,
          resizeStartPoint,
          currentPoint,
          e.shiftKey,
        );

        const updatedShapes = shapes.map((shape) =>
          shape.isSelected ? { ...shape, ...resizedShape } : shape,
        );
        onShapeUpdate(updatedShapes);
      }
    },
    [shapes, resizeStartPoint, getCanvasPoint, onShapeUpdate],
  );

  const handleResizeEnd = useCallback((endResize: () => void) => {
    endResize();
    setResizeStartPoint(null);
  }, []);

  return {
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
  };
};
