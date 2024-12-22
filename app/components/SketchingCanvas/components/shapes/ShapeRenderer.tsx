import React from "react";
import { Shape, ResizeHandle } from "../../types/drawing";
import { Rectangle } from "./Rectangle";
import { Circle } from "./Circle";
import { Frame } from "./Frame";
import { Line } from "./Line";
import { Pencil } from "./Pencil";
import { ResizeHandles } from "../resize/ResizeHandles";
import { LineResizeHandles } from "../resize/LineResizeHandles";

interface ShapeRendererProps {
  shape: Shape;
  onResizeStart?: (handle: ResizeHandle, e: React.MouseEvent) => void;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  shape,
  onResizeStart,
}) => {
  if (shape.type === "pencil" && (!shape.points || shape.points.length < 2)) {
    return null;
  }

  const renderShape = () => {
    const props = {
      shape,
      isSelected: shape.isSelected,
      onResizeStart,
    };

    switch (shape.type) {
      case "rectangle":
        return <Rectangle {...props} />;
      case "circle":
        return <Circle {...props} />;
      case "frame":
        return <Frame {...props} />;
      case "line":
        return <Line {...props} />;
      case "pencil":
        return <Pencil {...props} />;
      default:
        return null;
    }
  };

  const renderResizeHandles = () => {
    if (!shape.isSelected || !onResizeStart) return null;

    if (shape.type === "line") {
      return <LineResizeHandles shape={shape} onResizeStart={onResizeStart} />;
    }

    return <ResizeHandles shape={shape} onResizeStart={onResizeStart} />;
  };

  return (
    <g>
      {renderShape()}
      {renderResizeHandles()}
    </g>
  );
};
