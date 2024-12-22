import React from "react";
import { Shape } from "../../types/drawing";

interface FrameLabelProps {
  shape: Shape;
}

export const FrameLabel: React.FC<FrameLabelProps> = ({ shape }) => (
  <text
    x={shape.x}
    y={shape.y - 8}
    fill={shape.strokeColor}
    fontSize="14"
    fontFamily="sans-serif"
    dominantBaseline="text-after-edge"
    className="select-none"
  >
    {shape.name || "Frame"}
  </text>
);
