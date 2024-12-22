import React from "react";
import { ResizeHandle as ResizeHandleType } from "../../types/drawing";

interface ResizeHandleProps {
  position: ResizeHandleType;
  x: number;
  y: number;
  onMouseDown: (handle: ResizeHandleType, e: React.MouseEvent) => void;
}

const getCursor = (position: ResizeHandleType): string => {
  switch (position) {
    case "top-left":
    case "bottom-right":
      return "nwse-resize";
    case "top-right":
    case "bottom-left":
      return "nesw-resize";
    case "top":
    case "bottom":
      return "ns-resize";
    case "left":
    case "right":
      return "ew-resize";
    case "start":
    case "end":
      return "pointer";
    default:
      return "default";
  }
};

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  position,
  x,
  y,
  onMouseDown,
}) => {
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMouseDown(position, {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
      preventDefault: () => { },
      stopPropagation: () => { },
    } as React.MouseEvent);
  };

  const handleSize = 8; // Increased size for better touch targets

  return (
    <g style={{ touchAction: "none" }}>
      <circle
        cx={x}
        cy={y}
        r={handleSize + 1}
        fill="white"
        className="pointer-events-none"
      />
      <circle
        cx={x}
        cy={y}
        r={handleSize}
        fill="white"
        stroke="#2563eb"
        strokeWidth={1.5}
        style={{ cursor: getCursor(position), touchAction: "none" }}
        onMouseDown={(e) => onMouseDown(position, e)}
        onTouchStart={handleTouchStart}
      />
    </g>
  );
};
