import { useCallback, useState } from "react";
import { Shape } from "../types/drawing";

interface UseCopyPasteProps {
  shapes: Shape[];
  onShapeUpdate: (shapes: Shape[]) => void;
}

export const useCopyPaste = ({ shapes, onShapeUpdate }: UseCopyPasteProps) => {
  const [copiedShapes, setCopiedShapes] = useState<Shape[]>([]);

  const handleCopy = useCallback(() => {
    const selectedShapes = shapes.filter((shape) => shape.isSelected);
    if (selectedShapes.length > 0) {
      setCopiedShapes(selectedShapes);
    }
  }, [shapes]);

  const handlePaste = useCallback(() => {
    if (copiedShapes.length > 0) {
      const newShapes = copiedShapes.map((shape) => ({
        ...shape,
        id: Math.random().toString(36).substr(2, 9),
        x: shape.x + 20,
        y: shape.y + 20,
        isSelected: true,
      }));

      const updatedShapes = [
        ...shapes.map((shape) => ({ ...shape, isSelected: false })),
        ...newShapes,
      ];

      onShapeUpdate(updatedShapes);
    }
  }, [shapes, copiedShapes, onShapeUpdate]);

  return {
    handleCopy,
    handlePaste,
  };
};
