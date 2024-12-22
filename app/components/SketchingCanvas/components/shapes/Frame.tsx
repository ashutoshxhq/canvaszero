import React from "react";
import { BaseShapeProps } from "./types";
import { FrameLabel } from "./FrameLabel";
import { ResizeHandles } from "../resize/ResizeHandles";
import { SELECTION_PADDING } from "../../utils/constants";

export const Frame: React.FC<BaseShapeProps> = ({
  shape,
  isSelected,
  onResizeStart,
}) => {
  return (
    <g>
      {/* Selection highlight with padding */}
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

      {/* Frame label */}
      <FrameLabel shape={shape} />

      {/* Invisible hit area */}
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill="transparent"
        className="pointer-events-none"
      />

      {/* Main frame outline */}
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill="none"
        stroke={shape.strokeColor}
        strokeWidth="2"
        strokeDasharray="5,5"
      />

      {/* Corner decorations */}
      <g stroke={shape.strokeColor} strokeWidth="2" fill="none">
        {/* Top-left corner */}
        <path
          d={`M ${shape.x} ${shape.y + 20}
              L ${shape.x} ${shape.y}
              L ${shape.x + 20} ${shape.y}`}
        />

        {/* Top-right corner */}
        <path
          d={`M ${shape.x + shape.width - 20} ${shape.y}
              L ${shape.x + shape.width} ${shape.y}
              L ${shape.x + shape.width} ${shape.y + 20}`}
        />

        {/* Bottom-left corner */}
        <path
          d={`M ${shape.x} ${shape.y + shape.height - 20}
              L ${shape.x} ${shape.y + shape.height}
              L ${shape.x + 20} ${shape.y + shape.height}`}
        />

        {/* Bottom-right corner */}
        <path
          d={`M ${shape.x + shape.width - 20} ${shape.y + shape.height}
              L ${shape.x + shape.width} ${shape.y + shape.height}
              L ${shape.x + shape.width} ${shape.y + shape.height - 20}`}
        />
      </g>

      {/* Resize handles */}
      {isSelected && onResizeStart && (
        <ResizeHandles shape={shape} onResizeStart={onResizeStart} />
      )}
    </g>
  );
};
