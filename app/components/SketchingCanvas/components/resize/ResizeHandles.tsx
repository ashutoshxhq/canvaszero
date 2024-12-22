import React from "react";
import { Shape, ResizeHandle } from "../../types/drawing";
import { ResizeHandle as ResizeHandleComponent } from "./ResizeHandle";
import { SELECTION_PADDING } from "../../utils/constants";
import { getBoundingBox, transformPoints } from "../../utils/shapeUtils";

interface ResizeHandlesProps {
  shape: Shape;
  onResizeStart: (handle: ResizeHandle, e: React.MouseEvent) => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  shape,
  onResizeStart,
}) => {
  // Calculate handle positions based on shape type and selection padding
  const getHandlePositions = () => {
    let box;

    if (shape.type === "pencil" && shape.points) {
      // Transform points based on current scale and position
      const transformedPoints = transformPoints(shape.points, shape.scale);
      const pointsBox = getBoundingBox(transformedPoints);

      box = {
        x: shape.x + pointsBox.x - SELECTION_PADDING,
        y: shape.y + pointsBox.y - SELECTION_PADDING,
        width: pointsBox.width + SELECTION_PADDING * 2,
        height: pointsBox.height + SELECTION_PADDING * 2,
      };
    } else {
      // For other shapes, use regular bounds plus padding
      box = {
        x: shape.x - SELECTION_PADDING,
        y: shape.y - SELECTION_PADDING,
        width: shape.width + SELECTION_PADDING * 2,
        height: shape.height + SELECTION_PADDING * 2,
      };
    }

    return [
      ["top-left", box.x, box.y],
      ["top-right", box.x + box.width, box.y],
      ["bottom-right", box.x + box.width, box.y + box.height],
      ["bottom-left", box.x, box.y + box.height],
    ] as [ResizeHandle, number, number][];
  };

  const handlePositions = getHandlePositions();

  return (
    <g className="resize-handles">
      {handlePositions.map(([position, x, y]) => (
        <ResizeHandleComponent
          key={position}
          position={position}
          x={x}
          y={y}
          onMouseDown={(handle, e) => onResizeStart(handle, e)}
        />
      ))}
    </g>
  );
};
