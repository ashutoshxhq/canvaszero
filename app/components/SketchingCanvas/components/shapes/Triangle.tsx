import React from "react";
import { BaseShapeProps } from "./types";

export const Triangle: React.FC<BaseShapeProps> = ({ shape, isSelected }) => {
  const points = `
    ${shape.x},${shape.y + shape.height}
    ${shape.x + shape.width / 2},${shape.y}
    ${shape.x + shape.width},${shape.y + shape.height}
  `;

  return (
    <polygon
      points={points}
      fill={shape.fillColor}
      stroke={shape.strokeColor}
      strokeWidth="2"
      className={isSelected ? "outline outline-2 outline-blue-500" : ""}
    />
  );
};
