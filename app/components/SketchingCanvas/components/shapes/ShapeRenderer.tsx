import React from "react";
import { Shape, ResizeHandle } from "../../types/drawing";
import { Rectangle } from "./Rectangle";
import { Circle } from "./Circle";
import { Frame } from "./Frame";
import { Pencil } from "./Pencil";
import { Line } from "./Line";
import { ResizeHandles } from "../resize/ResizeHandles";
import { LineResizeHandles } from "../resize/LineResizeHandles";

interface ShapeRendererProps {
  shape: Shape;
  isSelected?: boolean;
  onResizeStart?: (handle: ResizeHandle, e: React.MouseEvent) => void;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  shape,
  isSelected = false,
  onResizeStart,
}) => {
  if (shape.type === "pencil" && (!shape.points || shape.points.length < 2)) {
    return null;
  }

  const props = { shape, isSelected, onResizeStart };

  return (
    <>
      {(() => {
        switch (shape.type) {
          case "rectangle":
            return <Rectangle {...props} />;
          case "circle":
            return <Circle {...props} />;
          case "frame":
            return <Frame {...props} />;
          case "pencil":
            return <Pencil {...props} />;
          case "line":
            return <Line {...props} />;
          default:
            return null;
        }
      })()}
      {isSelected && onResizeStart && (
        shape.type === "line" ?
          <LineResizeHandles shape={shape} onResizeStart={onResizeStart} /> :
          <ResizeHandles shape={shape} onResizeStart={onResizeStart} />
      )}
    </>
  );
};
