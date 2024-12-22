import React from "react";
import { BaseShapeProps } from "./types";
import { SELECTION_PADDING } from "../../utils/constants";

const FrameLabel: React.FC<{ shape: BaseShapeProps["shape"] }> = ({
  shape,
}) => {
  const dimensions = `${Math.round(shape.width)}×${Math.round(shape.height)}`;
  return (
    <text
      x={shape.x + shape.width / 2}
      y={shape.y + 16}
      fontSize={12}
      fill={shape.strokeColor}
      textAnchor="middle"
      dominantBaseline="middle"
      className="select-none"
    >
      {`${shape.name || "Browser Frame"} (${dimensions})`}
    </text>
  );
};

export const Frame: React.FC<BaseShapeProps> = ({
  shape,
  isSelected,
  onResizeStart,
}) => {
  const titleBarHeight = 32;
  const contentHeight = Math.max(0, shape.height - titleBarHeight);

  return (
    <g>
      {/* Selection highlight with padding */}
      {isSelected && (
        <rect
          x={shape.x - SELECTION_PADDING}
          y={shape.y - SELECTION_PADDING}
          width={Math.max(0, shape.width + SELECTION_PADDING * 2)}
          height={Math.max(0, shape.height + SELECTION_PADDING * 2)}
          fill="none"
          stroke="#2563eb"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="pointer-events-none"
        />
      )}

      {/* Main browser window background */}
      <rect
        x={shape.x}
        y={shape.y}
        width={Math.max(0, shape.width)}
        height={Math.max(0, shape.height)}
        fill="white"
        stroke={shape.strokeColor}
        strokeWidth="2"
      />

      {/* Title bar background */}
      <rect
        x={shape.x}
        y={shape.y}
        width={Math.max(0, shape.width)}
        height={Math.min(titleBarHeight, shape.height)}
        fill="#f1f5f9"
        stroke={shape.strokeColor}
        strokeWidth="2"
      />

      {/* Browser controls (circles for close, minimize, maximize) */}
      <circle
        cx={shape.x + 16}
        cy={shape.y + 16}
        r={6}
        fill="#ef4444"
        stroke={shape.strokeColor}
        strokeWidth="1"
      />
      <circle
        cx={shape.x + 36}
        cy={shape.y + 16}
        r={6}
        fill="#fbbf24"
        stroke={shape.strokeColor}
        strokeWidth="1"
      />
      <circle
        cx={shape.x + 56}
        cy={shape.y + 16}
        r={6}
        fill="#22c55e"
        stroke={shape.strokeColor}
        strokeWidth="1"
      />

      {/* Frame label */}
      <FrameLabel shape={shape} />

      {/* Content area separator line */}
      <line
        x1={shape.x}
        y1={shape.y + Math.min(titleBarHeight, shape.height)}
        x2={shape.x + Math.max(0, shape.width)}
        y2={shape.y + Math.min(titleBarHeight, shape.height)}
        stroke={shape.strokeColor}
        strokeWidth="2"
      />

      {/* Hit area for title bar - this makes the entire title bar draggable */}
      <rect
        x={shape.x}
        y={shape.y}
        width={Math.max(0, shape.width)}
        height={Math.min(titleBarHeight, shape.height)}
        fill="transparent"
      />

      {/* Hit area for content */}
      {contentHeight > 0 && (
        <rect
          x={shape.x}
          y={shape.y + titleBarHeight}
          width={Math.max(0, shape.width)}
          height={contentHeight}
          fill="transparent"
        />
      )}
    </g>
  );
};
