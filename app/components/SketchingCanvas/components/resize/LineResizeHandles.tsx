import React from "react";
import { Shape, ResizeHandle } from "../../types/drawing";

interface LineResizeHandlesProps {
  shape: Shape;
  onResizeStart: (handle: ResizeHandle, e: React.MouseEvent) => void;
}

export const LineResizeHandles: React.FC<LineResizeHandlesProps> = ({
  shape,
  onResizeStart,
}) => {
  const startPoint = { x: shape.x, y: shape.y };
  const endPoint = { x: shape.x + shape.width, y: shape.y + shape.height };

  const handleMouseDown = (handle: ResizeHandle, e: React.MouseEvent) => {
    e.stopPropagation();
    onResizeStart(handle, e);
  };

  return (
    <g className="resize-handles">
      {/* Start point handle */}
      <g>
        <circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={5}
          fill="white"
          className="pointer-events-none"
        />
        <circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={4}
          fill="white"
          stroke="#2563eb"
          strokeWidth={1.5}
          style={{ cursor: "pointer" }}
          onMouseDown={(e) => handleMouseDown("start", e)}
        />
      </g>

      {/* End point handle */}
      <g>
        <circle
          cx={endPoint.x}
          cy={endPoint.y}
          r={5}
          fill="white"
          className="pointer-events-none"
        />
        <circle
          cx={endPoint.x}
          cy={endPoint.y}
          r={4}
          fill="white"
          stroke="#2563eb"
          strokeWidth={1.5}
          style={{ cursor: "pointer" }}
          onMouseDown={(e) => handleMouseDown("end", e)}
        />
      </g>
    </g>
  );
};
