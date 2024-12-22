import React from "react";
import { BaseShapeProps } from "./types";
import { SELECTION_PADDING } from "../../utils/constants";
import { LineResizeHandles } from "../resize/LineResizeHandles";

export const Line: React.FC<BaseShapeProps> = ({
  shape,
  isSelected,
  onResizeStart,
}) => {
  const x1 = shape.x;
  const y1 = shape.y;
  const x2 = shape.x + shape.width;
  const y2 = shape.y + shape.height;

  // Calculate the angle of the line
  const angle = Math.atan2(y2 - y1, x2 - x1);
  // Width of the hit area (10px total, 5px on each side of the line)
  const hitAreaWidth = 10;

  // Calculate the points for a wider hit area around the line
  const dx = (hitAreaWidth / 2) * Math.sin(angle);
  const dy = (hitAreaWidth / 2) * -Math.cos(angle);

  const hitAreaPoints = `
    ${x1 - dx},${y1 - dy}
    ${x2 - dx},${y2 - dy}
    ${x2 + dx},${y2 + dy}
    ${x1 + dx},${y1 + dy}
  `;

  return (
    <g>
      {/* Invisible hit area for easier selection */}
      <polygon
        points={hitAreaPoints}
        fill="transparent"
        stroke="transparent"
        strokeWidth="1"
        style={{ cursor: "pointer" }}
      />

      {/* Selection highlight */}
      {isSelected && (
        <rect
          x={Math.min(x1, x2) - SELECTION_PADDING}
          y={Math.min(y1, y2) - SELECTION_PADDING}
          width={Math.abs(x2 - x1) + SELECTION_PADDING * 2}
          height={Math.abs(y2 - y1) + SELECTION_PADDING * 2}
          fill="none"
          stroke="#2563eb"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="pointer-events-none"
        />
      )}

      {/* Main line */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={shape.strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        className="pointer-events-none"
      />

      {/* Resize handles */}
      {isSelected && onResizeStart && (
        <LineResizeHandles shape={shape} onResizeStart={onResizeStart} />
      )}
    </g>
  );
};
