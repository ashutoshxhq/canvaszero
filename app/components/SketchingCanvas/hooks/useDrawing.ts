import { useCallback } from "react";
import { Point, Shape, ShapeType } from "../types/drawing";
import { getNextFrameNumber, getContainingFrame } from "../utils/frameUtils";

export const useDrawing = () => {
  const createShape = useCallback(
    (
      type: ShapeType,
      startPoint: Point,
      endPoint: Point,
      fillColor: string,
      strokeColor: string,
      shapes: Shape[] = []
    ): Shape | null => {
      const minSize = 80; // Minimum size for regular shapes
      const frameMinWidth = 1200; // Minimum width for frames
      const frameMinHeight = 720; // Minimum height for frames

      const baseShape = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        fillColor,
        strokeColor,
        isSelected: false,
        rotation: 0,
        scale: { x: 1, y: 1 },
        borderRadius: 8,
      };

      if (type === "pencil") {
        return {
          ...baseShape,
          x: startPoint.x,
          y: startPoint.y,
          width: 0,
          height: 0,
          points: [],
        };
      }

      let width = endPoint.x - startPoint.x;
      let height = endPoint.y - startPoint.y;

      // Only apply minimum size when exactly clicked (no drag)
      const isClick = width === 0 && height === 0;

      // For line tool, allow zero width or height
      if (type !== "line" && isClick) {
        // Set minimum dimensions instead of returning null
        if (type === "frame") {
          width = frameMinWidth;
          height = frameMinHeight;
        } else {
          width = minSize;
          height = minSize;
        }
        endPoint = {
          x: startPoint.x + width,
          y: startPoint.y + height
        };
      }

      // Special handling for line tool to keep start point fixed
      if (type === "line") {
        if (isClick) {
          // For line tool, create a diagonal line when clicked
          width = minSize;
          height = minSize;
          endPoint = {
            x: startPoint.x + width,
            y: startPoint.y + height
          };
        }
        return {
          ...baseShape,
          x: startPoint.x,
          y: startPoint.y,
          width,
          height,
          startPoint: { x: startPoint.x, y: startPoint.y },
          endPoint: { x: endPoint.x, y: endPoint.y }
        };
      }

      // Calculate position and dimensions, handling negative values
      const x = width < 0 ? endPoint.x : startPoint.x;
      const y = height < 0 ? endPoint.y : startPoint.y;
      // Only apply minimum size on click, otherwise use actual size
      const absWidth = isClick ? (type === "frame" ? frameMinWidth : minSize) : Math.abs(width);
      const absHeight = isClick ? (type === "frame" ? frameMinHeight : minSize) : Math.abs(height);

      const adjustedWidth =
        type === "circle" ? Math.max(absWidth, absHeight) : absWidth;
      const adjustedHeight =
        type === "circle" ? Math.max(absWidth, absHeight) : absHeight;

      const shape: Shape = {
        ...baseShape,
        x,
        y,
        width: adjustedWidth,
        height: adjustedHeight,
      };

      if (type === "frame") {
        shape.name = `Frame ${getNextFrameNumber(shapes)}`;
      }

      return shape;
    },
    []
  );

  const updateShapePosition = useCallback(
    (shapes: Shape[], startPoint: Point, currentPoint: Point): Shape[] => {
      console.log('updateShapePosition called with:', { shapes, startPoint, currentPoint });
      const dx = currentPoint.x - startPoint.x;
      const dy = currentPoint.y - startPoint.y;

      // Get all selected shapes
      const selectedShapes = shapes.filter(s => s.isSelected);

      // Get all frames
      const frames = shapes.filter(s => s.type === 'frame');

      // Create a map of shapes to their containing frames
      const shapeFrameMap = new Map<string, Shape | null>();
      shapes.forEach(shape => {
        if (shape.type !== 'frame') {
          shapeFrameMap.set(shape.id, getContainingFrame(shape, frames));
        }
      });

      // Track which frames are moving
      const movingFrames = new Set(selectedShapes.filter(s => s.type === 'frame').map(f => f.id));

      const updatedShapes = shapes.map((shape) => {
        // If the shape is selected, move it
        if (shape.isSelected) {
          return {
            ...shape,
            x: shape.x + dx,
            y: shape.y + dy,
          };
        }

        // If the shape is inside a moving frame, move it along with the frame
        const containingFrame = shapeFrameMap.get(shape.id);
        if (containingFrame && movingFrames.has(containingFrame.id)) {
          return {
            ...shape,
            x: shape.x + dx,
            y: shape.y + dy,
          };
        }

        // Otherwise, keep the shape as is
        return shape;
      });

      console.log('updateShapePosition returning:', updatedShapes);
      return updatedShapes;
    },
    []
  );

  return { createShape, updateShapePosition };
};
