import { useCallback, useState } from "react";
import { Point, Shape, Tool, SelectionBox } from "../types/drawing";
import { useDrawing } from "./useDrawing";
import {
  getBoundingBox,
  isPointInShape,
  isShapeInSelectionBox,
} from "../utils/shapeUtils";
import { sortShapesByType } from "../utils/frameUtils";

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
    currentPoint: Point,
  ) => Shape[];
  canvasRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  pan: Point;
}

export const useCanvasEvents = ({
  shapes,
  selectedTool,
  fillColor,
  strokeColor,
  onShapeUpdate,
  onToolSelect,
  getCanvasPoint,
  updateShapePosition,
  canvasRef,
  zoom,
  pan,
}: UseCanvasEventsProps) => {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [previewShape, setPreviewShape] = useState<Shape | null>(null);
  const [currentPencilShape, setCurrentPencilShape] = useState<Shape | null>(
    null,
  );
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  const { createShape } = useDrawing();

  const handleMouseDown = useCallback(
    (
      e: React.MouseEvent,
      startPan: (e: React.MouseEvent) => void,
      handleShapeSelection: (
        shapes: Shape[],
        point: Point,
        isShiftKey: boolean,
      ) => { isDragging: boolean },
    ) => {
      const point = getCanvasPoint(e.clientX, e.clientY);
      if (!point) return;

      if (e.button === 2 || e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        e.stopPropagation();
        startPan(e);
        return;
      }

      setStartPoint(point);
      setHasMoved(false);

      if (selectedTool === "select") {
        const clickedShape = shapes.find((shape) =>
          isPointInShape(shape, point),
        );
        if (clickedShape) {
          const { isDragging: newIsDragging } = handleShapeSelection(
            shapes,
            point,
            e.shiftKey,
          );
          setIsDragging(newIsDragging);
        } else {
          setSelectionBox({ startPoint: point, endPoint: point });
          if (!e.shiftKey) {
            onShapeUpdate(
              shapes.map((shape) => ({ ...shape, isSelected: false })),
            );
          }
        }
      } else if (selectedTool === "pencil") {
        const newShape = createShape(
          "pencil",
          point,
          point,
          fillColor,
          strokeColor,
          shapes,
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
    [
      shapes,
      selectedTool,
      fillColor,
      strokeColor,
      getCanvasPoint,
      createShape,
      onShapeUpdate,
    ],
  );

  const handleMouseMove = useCallback(
    (
      e: React.MouseEvent,
      updatePan: (e: React.MouseEvent, prevPan: Point) => Point,
      setPan: (pan: Point) => void,
    ) => {
      if (e.buttons === 2 || e.buttons === 4 || (e.buttons === 1 && e.altKey)) {
        e.preventDefault();
        e.stopPropagation();
        const newPan = updatePan(e, pan);
        setPan(newPan);
        return;
      }

      if (!startPoint) return;

      const currentPoint = getCanvasPoint(e.clientX, e.clientY);
      if (!currentPoint) return;

      const dx = currentPoint.x - startPoint.x;
      const dy = currentPoint.y - startPoint.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        setHasMoved(true);
      }

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
          if (selectedTool !== "select" && hasMoved) {
            const shape = createShape(
              selectedTool,
              startPoint,
              currentPoint,
              fillColor,
              strokeColor,
              shapes,
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
          currentPoint,
        );

        const originalShapesMap = new Map(shapes.map((s) => [s.id, s]));

        const clonedShapes = updatedShapes.map((shape) => {
          const originalShape = originalShapesMap.get(shape.id);
          if (!originalShape) return shape;

          const baseShape = {
            ...originalShape,
            ...shape,
            type: originalShape.type,
            id: originalShape.id,
            width: Math.max(1, shape.width),
            height: Math.max(1, shape.height),
            scale: { ...originalShape.scale },
            isSelected: originalShape.isSelected,
            fillColor: originalShape.fillColor,
            strokeColor: originalShape.strokeColor,
            rotation: originalShape.rotation,
            borderRadius: originalShape.borderRadius,
          };

          if (originalShape.type === "frame") {
            return {
              ...baseShape,
              name: originalShape.name,
            };
          } else if (originalShape.type === "pencil") {
            return {
              ...baseShape,
              points: originalShape.points ? [...originalShape.points] : [],
            };
          } else if (originalShape.type === "line") {
            return {
              ...baseShape,
              startPoint: originalShape.startPoint
                ? { ...originalShape.startPoint }
                : undefined,
              endPoint: originalShape.endPoint
                ? { ...originalShape.endPoint }
                : undefined,
            };
          }

          return baseShape;
        });

        const sortedShapes = sortShapesByType(clonedShapes);
        onShapeUpdate(sortedShapes);
        setStartPoint(currentPoint);
      } else if (selectionBox) {
        setSelectionBox((prev) => ({ ...prev!, endPoint: currentPoint }));
        const updatedShapes = shapes.map((shape) => ({
          ...shape,
          isSelected: isShapeInSelectionBox(shape, {
            startPoint: selectionBox.startPoint,
            endPoint: currentPoint,
          }),
        }));
        onShapeUpdate(updatedShapes);
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
      selectionBox,
      hasMoved,
      createShape,
      updateShapePosition,
      onShapeUpdate,
      getCanvasPoint,
    ],
  );

  const handleMouseUp = useCallback(
    (stopPan: () => void) => {
      if (isDrawing) {
        if (currentPencilShape) {
          onShapeUpdate([...shapes, currentPencilShape]);
          setCurrentPencilShape(null);
        } else if (!hasMoved && startPoint && selectedTool !== "select") {
          const shape = createShape(
            selectedTool,
            startPoint,
            startPoint,
            fillColor,
            strokeColor,
            shapes,
          );
          if (shape) {
            onShapeUpdate([...shapes, shape]);

            onToolSelect("select");
          }
        } else if (previewShape) {
          onShapeUpdate([...shapes, previewShape]);
        }
      }

      setStartPoint(null);
      setIsDrawing(false);
      setIsDragging(false);
      setHasMoved(false);
      setPreviewShape(null);
      setSelectionBox(null);
      stopPan();
    },
    [
      shapes,
      isDrawing,
      currentPencilShape,
      previewShape,
      hasMoved,
      startPoint,
      selectedTool,
      fillColor,
      strokeColor,
      createShape,
      onShapeUpdate,
      onToolSelect,
    ],
  );

  return {
    startPoint,
    isDrawing,
    isDragging,
    previewShape,
    selectionBox,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
