import { useCallback, useState } from "react";
import { Point, Shape, Tool } from "../types/drawing";
import { getCanvasPoint } from "../utils/coordinates";

interface UseCanvasEventsProps {
  shapes: Shape[];
  selectedTool: Tool;
  fillColor: string;
  strokeColor: string;
  onShapeUpdate: (shapes: Shape[]) => void;
  getCanvasPoint: (clientX: number, clientY: number) => Point | null;
  updateShapePosition: (shapes: Shape[], startPoint: Point, currentPoint: Point) => Shape[];
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
  getCanvasPoint,
  updateShapePosition,
  canvasRef,
  zoom,
  pan,
}: UseCanvasEventsProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPencilShape, setCurrentPencilShape] = useState<Shape | null>(null);
  const [previewShape, setPreviewShape] = useState<Shape | null>(null);
  const [selectionBox, setSelectionBox] = useState<Shape | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.button !== 0) return;

      const point = getCanvasPoint(e.clientX, e.clientY);
      if (!point) return;

      if (selectedTool === "text") {
        const newShape: Shape = {
          id: Math.random().toString(),
          type: "text",
          x: point.x,
          y: point.y,
          width: 200,
          height: 50,
          rotation: 0,
          scale: { x: 1, y: 1 },
          fillColor,
          strokeColor,
          isSelected: false,
          text: "",
          fontSize: 16,
          isEditing: true,
          isNew: true,
        };
        onShapeUpdate([...shapes, newShape]);
        return;
      }

      setIsDrawing(true);
      setStartPoint(point);

      if (selectedTool === "pencil") {
        const newShape: Shape = {
          id: Math.random().toString(),
          type: "pencil",
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
          rotation: 0,
          scale: { x: 1, y: 1 },
          fillColor,
          strokeColor,
          isSelected: false,
          points: [{ x: 0, y: 0 }],
        };
        setCurrentPencilShape(newShape);
        onShapeUpdate([...shapes, newShape]);
      }
    },
    [selectedTool, shapes, fillColor, strokeColor, onShapeUpdate, getCanvasPoint]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (selectedTool === "text" || selectedTool === "select" || selectedTool === "pan") return;

      const currentPoint = getCanvasPoint(e.clientX, e.clientY);
      if (!currentPoint || !startPoint) return;

      if (isDrawing) {
        if (selectedTool === "pencil" && currentPencilShape) {
          const points = [...currentPencilShape.points!, {
            x: currentPoint.x - currentPencilShape.x,
            y: currentPoint.y - currentPencilShape.y
          }];
          onShapeUpdate(
            shapes.map((shape) =>
              shape.id === currentPencilShape.id
                ? { ...shape, points }
                : shape
            )
          );
        } else {
          const preview: Shape = {
            id: Math.random().toString(),
            type: selectedTool,
            x: startPoint.x,
            y: startPoint.y,
            width: currentPoint.x - startPoint.x,
            height: currentPoint.y - startPoint.y,
            rotation: 0,
            scale: { x: 1, y: 1 },
            fillColor,
            strokeColor,
            isSelected: false,
          };
          setPreviewShape(preview);
        }
      }
    },
    [
      selectedTool,
      isDrawing,
      startPoint,
      currentPencilShape,
      shapes,
      fillColor,
      strokeColor,
      onShapeUpdate,
      getCanvasPoint,
    ]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (selectedTool === "text" || selectedTool === "select" || selectedTool === "pan") return;

      if (isDrawing && previewShape) {
        onShapeUpdate([...shapes, previewShape]);
      }

      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPencilShape(null);
      setPreviewShape(null);
      setSelectionBox(null);
    },
    [selectedTool, isDrawing, shapes, previewShape, onShapeUpdate]
  );

  return {
    isDrawing,
    previewShape,
    selectionBox,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
