import { useCallback } from "react";
import { Point, Shape } from "../types/drawing";
import { isPointInShape } from "../utils/shapeUtils";

interface UseShapeInteractionsProps {
  onShapeUpdate: (shapes: Shape[]) => void;
}

export const useShapeInteractions = ({
  onShapeUpdate,
}: UseShapeInteractionsProps) => {
  const handleShapeSelection = useCallback(
    (
      shapes: Shape[],
      point: Point,
      isShiftKey: boolean,
    ): { isDragging: boolean } => {
      const clickedShape = [...shapes]
        .reverse()
        .find((shape) => isPointInShape(shape, point));

      if (clickedShape) {
        if (isShiftKey) {
          const updatedShapes = shapes.map((shape) => ({
            ...shape,
            isSelected:
              shape.id === clickedShape.id
                ? !shape.isSelected
                : shape.isSelected,
          }));
          onShapeUpdate(updatedShapes);
        } else {
          if (
            clickedShape.isSelected &&
            shapes.filter((s) => s.isSelected).length > 1
          ) {
            return { isDragging: true };
          } else {
            const updatedShapes = shapes.map((shape) => ({
              ...shape,
              isSelected: shape.id === clickedShape.id,
            }));
            onShapeUpdate(updatedShapes);
          }
        }
        return { isDragging: true };
      } else {
        if (!isShiftKey) {
          onShapeUpdate(
            shapes.map((shape) => ({ ...shape, isSelected: false })),
          );
        }
        return { isDragging: false };
      }
    },
    [onShapeUpdate],
  );

  return {
    handleShapeSelection,
  };
};
