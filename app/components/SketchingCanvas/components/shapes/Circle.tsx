import React from "react";
import { BaseShapeProps } from "./types";
import { SELECTION_PADDING } from "../../utils/constants";

export const Circle: React.FC<BaseShapeProps> = ({ shape, isSelected }) => {
  const centerX = shape.x + shape.width / 2;
  const centerY = shape.y + shape.height / 2;
  const radiusX = shape.width / 2;
  const radiusY = shape.height / 2;

  return (
    <g>
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={radiusX}
        ry={radiusY}
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth="2"
      />
      {/* Square selection box */}
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
