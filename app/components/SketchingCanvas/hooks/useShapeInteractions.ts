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
      const updatedShapes = shapes.map(shape => ({
        ...shape,
        isSelected: shape === clickedShape && !isShiftKey ? true : 
                   isShiftKey ? shape.isSelected || shape === clickedShape :
                   false
      }));
      onShapeUpdate(updatedShapes);
      return { isDragging: true };
    } else {
      onShapeUpdate(shapes.map(shape => ({ ...shape, isSelected: false })));
      return { isDragging: false };
    }
  }, [onShapeUpdate]);

  return {
    handleShapeSelection
  };
};