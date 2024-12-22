import { useCallback, useState } from "react";
import { Point, Shape, Tool } from "../types/drawing";
import { useDrawing } from "./useDrawing";
import { getBoundingBox } from "../utils/shapeUtils";

interface UseCanvasEventsProps {
  shapes: Shape[];
  selectedTool: Tool;
  fillColor: string;
  strokeColor: string;
  onShapeUpdate: (shapes: Shape[]) => void;
  onToolSelect: (tool: Tool) => void;
  getCanvasPoint: (clientX: number, clientY: number) => Point | null;
  updateShapePosition: (
    shapes: Shape[],
    startPoint: Point,
    currentPoint: Point
  ) => Shape[];
}

export const useCanvasEvents = ({
  shapes,
  selectedTool,
  fillColor,
  strokeColor,
  onShapeUpdate,
  getCanvasPoint,
  updateShapePosition,
}: UseCanvasEventsProps) => {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewShape, setPreviewShape] = useState<Shape | null>(null);
  const [currentPencilShape, setCurrentPencilShape] = useState<Shape | null>(
    null
  );

  const { createShape } = useDrawing();

  const handleMouseDown = useCallback(
    (
      e: React.MouseEvent,
      startPan: (e: React.MouseEvent) => void,
      handleShapeSelection: (
        shapes: Shape[],
        point: Point,
        isShiftKey: boolean
      ) => { isDragging: boolean }
    ) => {
      const point = getCanvasPoint(e.clientX, e.clientY);
      if (!point) return;

      // Handle right-click or alt+left-click for panning
      if (e.button === 2 || (e.button === 0 && e.altKey)) {
        startPan(e);
        return;
      }

      setStartPoint(point);

      if (selectedTool === "select") {
        const { isDragging: newIsDragging } = handleShapeSelection(
          shapes,
          point,
          e.shiftKey
        );
        setIsDragging(newIsDragging);
      } else if (selectedTool === "pencil") {
        const newShape = createShape(
          "pencil",
          point,
          point,
          fillColor,
          strokeColor,
          shapes
        );
        if (newShape) {
          newShape.points = [{ x: 0, y: 0 }];
          setCurrentPencilShape(newShape);
          setPreviewShape(newShape);
          setIsDrawing(true);
        }
      } else {
        setIsDrawing(true);
      }
    },
    [shapes, selectedTool, fillColor, strokeColor, getCanvasPoint, createShape]
  );

  const handleMouseMove = useCallback(
    (
      e: React.MouseEvent,
      updatePan: (e: React.MouseEvent, prevPan: Point) => Point,
      setPan: (pan: Point) => void
    ) => {
      if (!startPoint) return;

      const currentPoint = getCanvasPoint(e.clientX, e.clientY);
      if (!currentPoint) return;

      if (isDrawing) {
        if (selectedTool === "pencil" && currentPencilShape) {
          const relativePoint = {
            x: currentPoint.x - currentPencilShape.x,
            y: currentPoint.y - currentPencilShape.y,
          };

          const updatedPoints = [
            ...(currentPencilShape.points || []),
            relativePoint,
          ];
          const box = getBoundingBox(updatedPoints);

          const updatedShape = {
            ...currentPencilShape,
            points: updatedPoints,
            width: box.width,
            height: box.height,
          };

          setCurrentPencilShape(updatedShape);
          setPreviewShape(updatedShape);
        } else {
          if (selectedTool !== "select") {
            const shape = createShape(
              selectedTool,
              startPoint,
              currentPoint,
              fillColor,
              strokeColor,
              shapes
            );
            if (shape) {
              setPreviewShape(shape);
            }
          }
        }
      } else if (isDragging && shapes.some((s) => s.isSelected)) {
        const updatedShapes = updateShapePosition(
          shapes,
          startPoint,
          currentPoint
        );
        onShapeUpdate(updatedShapes);
        setStartPoint(currentPoint);
      } else if (e.buttons === 2 || (e.buttons === 1 && e.altKey)) {
        setPan(updatePan(e, { x: 0, y: 0 }));
      }
    },
    [
      shapes,
      selectedTool,
      fillColor,
      strokeColor,
      startPoint,
      isDrawing,
      isDragging,
      currentPencilShape,
      createShape,
      updateShapePosition,
      onShapeUpdate,
      getCanvasPoint,
    ]
  );

  const handleMouseUp = useCallback(
    (stopPan: () => void) => {
      if (previewShape) {
        // Add the new shape without selecting it
        const newShapes = [...shapes, previewShape];
        onShapeUpdate(newShapes);
      }
      stopPan();
      setIsDrawing(false);
      setIsDragging(false);
      setStartPoint(null);
      setPreviewShape(null);
      setCurrentPencilShape(null);
    },
    [shapes, previewShape, onShapeUpdate]
  );

  return {
    startPoint,
    isDrawing,
    isDragging,
    previewShape,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
