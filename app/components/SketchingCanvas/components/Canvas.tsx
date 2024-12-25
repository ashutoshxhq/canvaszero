import React, { useRef } from "react";
import { Point, Shape, Tool, SelectionBox } from "../types/drawing";
import { useDrawing } from "../hooks/useDrawing";
import { useViewport } from "../hooks/useViewport";
import { useShapeInteractions } from "../hooks/useShapeInteractions";
import { useCanvasEvents } from "../hooks/useCanvasEvents";
import { useResize } from "../hooks/useResize";
import { useResizeHandlers } from "../hooks/useResizeHandlers";
import { ShapeRenderer } from "./shapes/ShapeRenderer";
import { Grid } from "./Grid";
import { sortShapesByType } from "../utils/frameUtils";

interface CanvasProps {
  shapes: Shape[];
  selectedTool: Tool;
  fillColor: string;
  strokeColor: string;
  onShapeUpdate: (shapes: Shape[]) => void;
  onShapeComplete: () => void;
  onToolSelect: (tool: Tool) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  shapes,
  selectedTool,
  fillColor,
  strokeColor,
  onShapeUpdate,
  onShapeComplete,
  onToolSelect,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { updateShapePosition } = useDrawing();
  const { handleShapeSelection } = useShapeInteractions({ onShapeUpdate });
  const { isResizing, startResize, calculateResize, endResize } = useResize();
  const { pan, setPan, zoom, startPan, updatePan, stopPan, handleWheel } =
    useViewport();

  const getCanvasPoint = (clientX: number, clientY: number): Point | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  };

  const { handleResizeStart, handleResizeMove, handleResizeEnd } =
    useResizeHandlers({
      shapes,
      onShapeUpdate,
      getCanvasPoint,
    });

  const {
    isDrawing,
    previewShape,
    selectionBox,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCanvasEvents({
    shapes,
    selectedTool,
    fillColor,
    strokeColor,
    onShapeUpdate,
    getCanvasPoint,
    updateShapePosition,
    canvasRef,
    zoom,
    pan,
  });

  const onMouseDown = (e: React.MouseEvent) => {
    if (selectedTool === "select") {
      const point = getCanvasPoint(e.clientX, e.clientY);
      if (point) {
        handleShapeSelection(shapes, point, e.shiftKey);
      }
      return;
    }

    if (e.target instanceof SVGElement || e.target instanceof SVGGElement) {
      handleMouseDown(e as React.MouseEvent<SVGSVGElement>);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (e.target instanceof SVGElement || e.target instanceof SVGGElement) {
      if (isResizing) {
        handleResizeMove(e as React.MouseEvent<SVGSVGElement>, isResizing, calculateResize);
      } else {
        handleMouseMove(e as React.MouseEvent<SVGSVGElement>);
      }
    }
  };

  const onMouseUp = () => {
    if (isResizing) {
      handleResizeEnd(endResize);
    } else {
      handleMouseUp({} as React.MouseEvent<SVGSVGElement>);
      if (previewShape) {
        onShapeComplete();
      }
    }
  };

  const bounds = shapes.reduce(
    (acc, shape) => ({
      minX: Math.min(acc.minX, shape.x),
      minY: Math.min(acc.minY, shape.y),
      maxX: Math.max(acc.maxX, shape.x + shape.width),
      maxY: Math.max(acc.maxY, shape.y + shape.height),
    }),
    { minX: 0, minY: 0, maxX: 2000, maxY: 2000 }
  );

  const padding = 1000;
  const viewBoxWidth = bounds.maxX - bounds.minX + padding * 2;
  const viewBoxHeight = bounds.maxY - bounds.minY + padding * 2;

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative bg-gray-50 overflow-hidden"
      style={{
        cursor:
          selectedTool === "select"
            ? "default"
            : selectedTool === "text"
              ? "text"
              : "crosshair",
        touchAction: "none",
      }}
      onWheel={(e) => handleWheel(e.nativeEvent)}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Grid zoom={zoom} pan={pan} />

      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          touchAction: "none",
        }}
      >
        <svg
          className="absolute"
          style={{
            width: viewBoxWidth,
            height: viewBoxHeight,
            left: -padding + bounds.minX,
            top: -padding + bounds.minY,
            touchAction: "none",
          }}
          viewBox={`${-padding + bounds.minX} ${-padding + bounds.minY} ${viewBoxWidth} ${viewBoxHeight}`}
        >
          {sortShapesByType(shapes).map((shape) => (
            <g key={shape.id} className={shape.type === "frame" ? "frame-layer" : "shape-layer"}>
              <ShapeRenderer
                shape={shape}
                isSelected={shape.isSelected}
                onResizeStart={(handle, e) =>
                  handleResizeStart(handle, e, startResize)
                }
              />
            </g>
          ))}

          {previewShape && <ShapeRenderer shape={previewShape} />}
          {selectionBox && (
            <rect
              x={Math.min(selectionBox.startPoint?.x || 0, selectionBox.endPoint?.x || 0)}
              y={Math.min(selectionBox.startPoint?.y || 0, selectionBox.endPoint?.y || 0)}
              width={Math.abs(
                (selectionBox.endPoint?.x || 0) - (selectionBox.startPoint?.x || 0)
              )}
              height={Math.abs(
                (selectionBox.endPoint?.y || 0) - (selectionBox.startPoint?.y || 0)
              )}
              fill="rgba(37, 99, 235, 0.1)"
              stroke="#2563eb"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="pointer-events-none"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
