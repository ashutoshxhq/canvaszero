import React, { useRef, useEffect } from "react";
import { Point, Shape, Tool, ResizeHandle } from "../types/drawing";
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
    isDragging,
    previewShape,
    selectionBox,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: baseHandleMouseUp,
  } = useCanvasEvents({
    shapes,
    selectedTool,
    fillColor,
    strokeColor,
    onShapeUpdate,
    onToolSelect,
    getCanvasPoint,
    updateShapePosition,
    canvasRef,
    zoom,
    pan,
  });

  const handleMouseUp = () => {
    baseHandleMouseUp(stopPan);
    if (previewShape) {
      onShapeComplete();
    }
  };

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const sortedShapes = sortShapesByType(shapes);

  const bounds = shapes.reduce(
    (acc, shape) => ({
      minX: Math.min(acc.minX, shape.x),
      minY: Math.min(acc.minY, shape.y),
      maxX: Math.max(acc.maxX, shape.x + shape.width),
      maxY: Math.max(acc.maxY, shape.y + shape.height),
    }),
    { minX: 0, minY: 0, maxX: 2000, maxY: 2000 },
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
            ? isDragging
              ? "grabbing"
              : "default"
            : "crosshair",
        touchAction: "none",
      }}
      onMouseDown={(e) => handleMouseDown(e, startPan, handleShapeSelection)}
      onMouseMove={(e) => {
        if (isResizing) {
          handleResizeMove(e, isResizing, calculateResize);
        } else {
          handleMouseMove(e, updatePan, setPan);
        }
      }}
      onMouseUp={() => {
        if (isResizing) {
          handleResizeEnd(endResize);
        } else {
          handleMouseUp();
        }
      }}
      onMouseLeave={() => {
        if (isResizing) {
          handleResizeEnd(endResize);
        } else {
          handleMouseUp();
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const point = getCanvasPoint(touch.clientX, touch.clientY);
        if (!point) return;

        handleMouseDown(
          {
            button: 0,
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => { },
            stopPropagation: () => { },
            altKey: false,
            shiftKey: false,
          } as React.MouseEvent,
          startPan,
          handleShapeSelection
        );
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const point = getCanvasPoint(touch.clientX, touch.clientY);
        if (!point) return;

        if (isResizing) {
          handleResizeMove(
            {
              clientX: touch.clientX,
              clientY: touch.clientY,
              preventDefault: () => { },
            } as React.MouseEvent,
            isResizing,
            calculateResize
          );
        } else {
          handleMouseMove(
            {
              buttons: 1,
              clientX: touch.clientX,
              clientY: touch.clientY,
              preventDefault: () => { },
              stopPropagation: () => { },
              altKey: false,
            } as React.MouseEvent,
            updatePan,
            setPan
          );
        }
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        if (isResizing) {
          handleResizeEnd(endResize);
        } else {
          handleMouseUp();
        }
      }}
      onTouchCancel={(e) => {
        e.preventDefault();
        if (isResizing) {
          handleResizeEnd(endResize);
        } else {
          handleMouseUp();
        }
      }}
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
          viewBox={`${-padding + bounds.minX} ${-padding + bounds.minY
            } ${viewBoxWidth} ${viewBoxHeight}`}
        >
          {/* Render frames first (background) */}
          {sortedShapes
            .filter((shape) => shape.type === "frame")
            .map((shape) => {
              return (
                <g key={shape.id} className="frame-layer">
                  <ShapeRenderer
                    shape={shape}
                    isSelected={shape.isSelected}
                    onResizeStart={(handle, e) =>
                      handleResizeStart(handle, e, startResize)
                    }
                  />
                </g>
              );
            })}

          {/* Render non-frame shapes on top */}
          {sortedShapes
            .filter((shape) => shape.type !== "frame")
            .map((shape) => {
              return (
                <g key={shape.id} className="shape-layer">
                  <ShapeRenderer
                    shape={shape}
                    isSelected={shape.isSelected}
                    onResizeStart={(handle, e) =>
                      handleResizeStart(handle, e, startResize)
                    }
                  />
                </g>
              );
            })}

          {previewShape && <ShapeRenderer shape={previewShape} />}
          {selectionBox && (
            <rect
              x={Math.min(selectionBox.startPoint.x, selectionBox.endPoint.x)}
              y={Math.min(selectionBox.startPoint.y, selectionBox.endPoint.y)}
              width={Math.abs(
                selectionBox.endPoint.x - selectionBox.startPoint.x,
              )}
              height={Math.abs(
                selectionBox.endPoint.y - selectionBox.startPoint.y,
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
