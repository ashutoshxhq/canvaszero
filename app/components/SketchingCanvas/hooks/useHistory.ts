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
      isFrame: shape.type === 'frame',
      name: shape.name,
      borderRadius: shape.borderRadius,
      fillColor: shape.fillColor,
      strokeColor: shape.strokeColor,
      rotation: shape.rotation,
      width: Math.max(1, shape.width),
      height: Math.max(1, shape.height),
      x: shape.x,
      y: shape.y
    };

    return clonedShape;
  };

  const flushBatchedUpdates = useCallback(() => {
    if (batchedUpdates.current.length === 0) return;

    setHistory(prev => {
      // Get the current state
      let newHistory = prev.slice(0, currentIndex + 1);

      // Add all batched updates
      newHistory = [...newHistory, ...batchedUpdates.current];

      // Keep only the last MAX_HISTORY_LENGTH entries
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory = newHistory.slice(-MAX_HISTORY_LENGTH);
      }

      // Clear the batch
      batchedUpdates.current = [];

      return newHistory;
    });

    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + batchedUpdates.current.length, MAX_HISTORY_LENGTH - 1);
      return newIndex;
    });
  }, [currentIndex]);

  const pushHistory = useCallback(
    (shapes: Shape[]) => {
      if (!shapes) return;
      console.log('pushHistory - Received shapes:', shapes);

      try {
        if (isUpdating.current) {
          // If we're already updating, add to batch
          const clonedShapes = shapes.map(cloneShape);
          batchedUpdates.current.push(clonedShapes);
          return;
        }

        isUpdating.current = true;

        // Deep clone the shapes to prevent reference issues
        const clonedShapes = shapes.map(cloneShape);
        console.log('pushHistory - Cloned shapes:', clonedShapes);

        setHistory(prev => {
          // Slice off any future history if we're not at the end
          let newHistory = prev.slice(0, currentIndex + 1);

          // Add the new state
          newHistory = [...newHistory, clonedShapes];

          // Keep only the last MAX_HISTORY_LENGTH entries
          if (newHistory.length > MAX_HISTORY_LENGTH) {
            newHistory = newHistory.slice(-MAX_HISTORY_LENGTH);
          }

          console.log('pushHistory - Updated history:', newHistory);
          return newHistory;
        });

        setCurrentIndex(prev => {
          const newIndex = Math.min(prev + 1, MAX_HISTORY_LENGTH - 1);
          console.log('pushHistory - New index:', newIndex);
          return newIndex;
        });
      } finally {
        isUpdating.current = false;
        // Flush any batched updates
        if (batchedUpdates.current.length > 0) {
          setTimeout(flushBatchedUpdates, 0);
        }
      }
    },
    [currentIndex, flushBatchedUpdates]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0 && !isUpdating.current) {
      try {
        isUpdating.current = true;
        setCurrentIndex(prev => {
          console.log('undo - Current index:', prev);
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
        setCurrentIndex(prev => {
          console.log('redo - Current index:', prev);
          return Math.min(history.length - 1, prev + 1);
        });
      } finally {
        isUpdating.current = false;
      }
    }
  }, [currentIndex, history.length]);

  // Deep clone shapes before returning them to prevent mutations
  const currentShapes = history[currentIndex]?.map(cloneShape) || [];
  console.log('useHistory - Current shapes:', currentShapes);

  return {
    shapes: currentShapes,
    pushHistory,
    undo,
    redo,
  };
};
