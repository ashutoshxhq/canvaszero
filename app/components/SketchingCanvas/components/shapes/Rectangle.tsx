import React from "react";
import { BaseShapeProps } from "./types";
import { SELECTION_PADDING } from "../../utils/constants";

export const Rectangle: React.FC<BaseShapeProps> = ({ shape, isSelected }) => {
  const borderRadius = shape.borderRadius ?? 8;

  return (
    <g>
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        rx={borderRadius}
        ry={borderRadius}
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth="2"
        style={{
          mixBlendMode: "normal",
        }}
      />

      {/* Selection rectangle without rounded corners */}
      {isSelected && (
        <rect
          x={shape.x - SELECTION_PADDING}
          y={shape.y - SELECTION_PADDING}
          width={shape.width + SELECTION_PADDING * 2}
          height={shape.height + SELECTION_PADDING * 2}
          fill="none"
          stroke="#2563eb"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="pointer-events-none"
        />
      )}
    </g>
  );
};
