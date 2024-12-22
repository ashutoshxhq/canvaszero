import { useCallback } from 'react';
import { Point, Shape } from '../types/drawing';
import { isPointInShape } from '../utils/shapeUtils';

interface UseShapeInteractionsProps {
  onShapeUpdate: (shapes: Shape[]) => void;
}

export const useShapeInteractions = ({ onShapeUpdate }: UseShapeInteractionsProps) => {
  const handleShapeSelection = useCallback((
    shapes: Shape[],
    point: Point,
    isShiftKey: boolean
  ): { isDragging: boolean } => {
    const clickedShape = [...shapes].reverse().find(shape =>
      isPointInShape(shape, point)
    );

    if (clickedShape) {
      // If we clicked on a shape
      if (isShiftKey) {
        // If shift is held, toggle the clicked shape's selection
        const updatedShapes = shapes.map(shape => ({
          ...shape,
          isSelected: shape.id === clickedShape.id ? !shape.isSelected : shape.isSelected
        }));
        onShapeUpdate(updatedShapes);
      } else {
        // If shift is not held
        if (clickedShape.isSelected && shapes.filter(s => s.isSelected).length > 1) {
          // If we clicked on an already selected shape and there are multiple selections,
          // keep all selections to allow dragging
          return { isDragging: true };
        } else {
          // Otherwise, select only the clicked shape
          const updatedShapes = shapes.map(shape => ({
            ...shape,
            isSelected: shape.id === clickedShape.id
          }));
          onShapeUpdate(updatedShapes);
        }
      }
      return { isDragging: true };
    } else {
      // If we clicked on empty space, clear selection unless shift is held
      if (!isShiftKey) {
        onShapeUpdate(shapes.map(shape => ({ ...shape, isSelected: false })));
      }
      return { isDragging: false };
    }
  }, [onShapeUpdate]);

  return {
    handleShapeSelection
  };
};