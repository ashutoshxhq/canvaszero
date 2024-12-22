import { SELECTION_PADDING } from "../../utils/constants";
import { getBoundingBox } from "../../utils/shapeUtils";
import { BaseShapeProps } from "./types";

export const Pencil: React.FC<BaseShapeProps> = ({ shape, isSelected }) => {
  if (!shape.points?.length) return null;

  const transformedPoints = shape.points.map((point) => ({
    x: point.x * shape.scale.x,
    y: point.y * shape.scale.y,
  }));

  const pathData = transformedPoints.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, "");

  const boundingBox = getBoundingBox(transformedPoints);

  return (
    <g transform={`translate(${shape.x}, ${shape.y})`}>
      <path
        d={pathData}
        fill="none"
        stroke={shape.strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {isSelected && (
        <rect
          x={boundingBox.x - SELECTION_PADDING}
          y={boundingBox.y - SELECTION_PADDING}
          width={boundingBox.width + SELECTION_PADDING * 2}
          height={boundingBox.height + SELECTION_PADDING * 2}
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
