import { useState, useCallback } from "react";
import { Shape } from "../types/drawing";

export const useHistory = () => {
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cloneShape = (shape: Shape): Shape => {
    const clonedShape = {
      ...shape,
      scale: { ...shape.scale },
      points: shape.points?.map((p) => ({ ...p })),
    };

    // Only clone these properties if they exist
    if (shape.startPoint) {
      clonedShape.startPoint = { ...shape.startPoint };
    }
    if (shape.endPoint) {
      clonedShape.endPoint = { ...shape.endPoint };
    }

    return clonedShape;
  };

  const pushHistory = useCallback(
    (shapes: Shape[]) => {
      if (!shapes) return;

      // Deep clone the shapes to prevent reference issues
      const clonedShapes = shapes.map(cloneShape);

      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        return [...newHistory, clonedShapes];
      });
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  // Deep clone shapes before returning them
  const currentShapes = history[currentIndex]?.map(cloneShape) || [];

  return {
    shapes: currentShapes,
    pushHistory,
    undo,
    redo,
  };
};
