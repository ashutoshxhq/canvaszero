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
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={5}
        fill="white"
        className="pointer-events-none"
      />
      <circle
        cx={x}
        cy={y}
        r={4}
        fill="white"
        stroke="#2563eb"
        strokeWidth={1.5}
        style={{ cursor: getCursor(position) }}
        onMouseDown={(e) => onMouseDown(position, e)}
      />
    </g>
  );
};
