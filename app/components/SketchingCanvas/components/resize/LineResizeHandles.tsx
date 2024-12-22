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

  const handleTouchStart = (handle: ResizeHandle, e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onResizeStart(handle, {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
      preventDefault: () => { },
      stopPropagation: () => { },
    } as React.MouseEvent);
  };

  const handleSize = 8; // Increased size for better touch targets

  return (
    <g className="resize-handles" style={{ touchAction: "none" }}>
      {/* Start point handle */}
      <g>
        <circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={handleSize + 1}
          fill="white"
          className="pointer-events-none"
        />
        <circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={handleSize}
          fill="white"
          stroke="#2563eb"
          strokeWidth={1.5}
          style={{ cursor: "pointer", touchAction: "none" }}
          onMouseDown={(e) => handleMouseDown("start", e)}
          onTouchStart={(e) => handleTouchStart("start", e)}
        />
      </g>

      {/* End point handle */}
      <g>
        <circle
          cx={endPoint.x}
          cy={endPoint.y}
          r={handleSize + 1}
          fill="white"
          className="pointer-events-none"
        />
        <circle
          cx={endPoint.x}
          cy={endPoint.y}
          r={handleSize}
          fill="white"
          stroke="#2563eb"
          strokeWidth={1.5}
          style={{ cursor: "pointer", touchAction: "none" }}
          onMouseDown={(e) => handleMouseDown("end", e)}
          onTouchStart={(e) => handleTouchStart("end", e)}
        />
      </g>
    </g>
  );
};
