import { useState, useCallback, useRef } from "react";
import { Shape } from "../types/drawing";

const MAX_HISTORY_LENGTH = 50;

export const useHistory = () => {
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUpdating = useRef(false);
  const batchedUpdates = useRef<Shape[][]>([]);

  const cloneShape = (shape: Shape): Shape => {
    if (!shape) return shape;

    const clonedShape = {
      ...shape,
      type: shape.type,
      id: shape.id,
      scale: { ...shape.scale },
      points: shape.points ? [...shape.points] : undefined,
      startPoint: shape.startPoint ? { ...shape.startPoint } : undefined,
      endPoint: shape.endPoint ? { ...shape.endPoint } : undefined,
      isSelected: shape.isSelected,
      isFrame: shape.type === "frame",
      name: shape.name,
      borderRadius: shape.borderRadius,
      fillColor: shape.fillColor,
      strokeColor: shape.strokeColor,
      rotation: shape.rotation,
      width: Math.max(1, shape.width),
      height: Math.max(1, shape.height),
      x: shape.x,
      y: shape.y,
    };

    return clonedShape;
  };

  const flushBatchedUpdates = useCallback(() => {
    if (batchedUpdates.current.length === 0) return;

    setHistory((prev) => {
      let newHistory = prev.slice(0, currentIndex + 1);

      newHistory = [...newHistory, ...batchedUpdates.current];

      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory = newHistory.slice(-MAX_HISTORY_LENGTH);
      }

      batchedUpdates.current = [];

      return newHistory;
    });

    setCurrentIndex((prev) => {
      const newIndex = Math.min(
        prev + batchedUpdates.current.length,
        MAX_HISTORY_LENGTH - 1,
      );
      return newIndex;
    });
  }, [currentIndex]);

  const pushHistory = useCallback(
    (shapes: Shape[]) => {
      if (!shapes) return;

      try {
        if (isUpdating.current) {
          const clonedShapes = shapes.map(cloneShape);
          batchedUpdates.current.push(clonedShapes);
          return;
        }

        isUpdating.current = true;

        const clonedShapes = shapes.map(cloneShape);

        setHistory((prev) => {
          let newHistory = prev.slice(0, currentIndex + 1);

          newHistory = [...newHistory, clonedShapes];

          if (newHistory.length > MAX_HISTORY_LENGTH) {
            newHistory = newHistory.slice(-MAX_HISTORY_LENGTH);
          }

          return newHistory;
        });

        setCurrentIndex((prev) => {
          const newIndex = Math.min(prev + 1, MAX_HISTORY_LENGTH - 1);
          return newIndex;
        });
      } finally {
        isUpdating.current = false;

        if (batchedUpdates.current.length > 0) {
          setTimeout(flushBatchedUpdates, 0);
        }
      }
    },
    [currentIndex, flushBatchedUpdates],
  );

  const undo = useCallback(() => {
    if (currentIndex > 0 && !isUpdating.current) {
      try {
        isUpdating.current = true;
        setCurrentIndex((prev) => {
          return Math.max(0, prev - 1);
        });
      } finally {
        isUpdating.current = false;
      }
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1 && !isUpdating.current) {
      try {
        isUpdating.current = true;
        setCurrentIndex((prev) => {
          return Math.min(history.length - 1, prev + 1);
        });
      } finally {
        isUpdating.current = false;
      }
    }
  }, [currentIndex, history.length]);

  const currentShapes = history[currentIndex]?.map(cloneShape) || [];

  return {
    shapes: currentShapes,
    pushHistory,
    undo,
    redo,
  };
};
