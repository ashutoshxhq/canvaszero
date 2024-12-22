import React from "react";
import { Point, Shape } from "../types/drawing";

interface ResizeHandlesProps {
  shape: Shape;
  onResize: (startPoint: Point, endPoint: Point) => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  shape,
  onResize,
}) => {
  if (!shape.startPoint || !shape.endPoint) {
    return null;
  }

  const handlePoints = [
    {
      x: Math.min(shape.startPoint.x, shape.endPoint.x),
      y: Math.min(shape.startPoint.y, shape.endPoint.y),
    },
    {
      x: Math.max(shape.startPoint.x, shape.endPoint.x),
      y: Math.min(shape.startPoint.y, shape.endPoint.y),
    },
    {
      x: Math.max(shape.startPoint.x, shape.endPoint.x),
      y: Math.max(shape.startPoint.y, shape.endPoint.y),
    },
    {
      x: Math.min(shape.startPoint.x, shape.endPoint.x),
      y: Math.max(shape.startPoint.y, shape.endPoint.y),
    },
  ];

  const handleMouseDown = (e: React.MouseEvent, handleIndex: number) => {
    e.stopPropagation();

    const svg = (e.target as SVGElement).closest("svg");
    if (!svg || !shape.startPoint || !shape.endPoint) return;

    const rect = svg.getBoundingClientRect();
    const startDrag = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const originalStartPoint = { ...shape.startPoint };
    const originalEndPoint = { ...shape.endPoint };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();

      const currentPoint = {
        x: moveEvent.clientX - rect.left,
        y: moveEvent.clientY - rect.top,
      };

      const dx = currentPoint.x - startDrag.x;
      const dy = currentPoint.y - startDrag.y;

      let newStartPoint: Point = { ...originalStartPoint };
      let newEndPoint: Point = { ...originalEndPoint };

      switch (handleIndex) {
        case 0:
          newStartPoint = currentPoint;
          break;
        case 1:
          newStartPoint = { ...newStartPoint, y: currentPoint.y };
          newEndPoint = { ...newEndPoint, x: currentPoint.x };
          break;
        case 2:
          newEndPoint = currentPoint;
          break;
        case 3:
          newStartPoint = { ...newStartPoint, x: currentPoint.x };
          newEndPoint = { ...newEndPoint, y: currentPoint.y };
          break;
      }

      onResize(newStartPoint, newEndPoint);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      {handlePoints.map((point, index) => (
        <g key={index} style={{ pointerEvents: "all" }}>
          <circle
            cx={point.x}
            cy={point.y}
            r={4}
            fill="white"
            stroke="#2563eb"
            strokeWidth={2}
            style={{ cursor: "nwse-resize" }}
            onMouseDown={(e) => handleMouseDown(e, index)}
          />
        </g>
      ))}
    </>
  );
};
