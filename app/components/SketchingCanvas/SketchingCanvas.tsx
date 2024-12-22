import React, { useState } from "react";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { Tool, Shape } from "./types/drawing";
import { useHistory } from "./hooks/useHistory";
import { useKeyboard } from "./hooks/useKeyboard";
import { useCopyPaste } from "./hooks/useCopyPaste";

function SketchingCanvas() {
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [isToolLocked, setIsToolLocked] = useState(false);
  const [fillColor, setFillColor] = useState("rgba(255, 255, 255, 0)");
  const [strokeColor, setStrokeColor] = useState("rgba(0, 0, 0, 1)");
  const { shapes, pushHistory, undo, redo } = useHistory();

  const handleShapeUpdate = (newShapes: Shape[]) => {
    const selectedShapes = newShapes.filter((shape) => shape.isSelected);
    if (selectedShapes.length > 0) {
      const lastSelected = selectedShapes[selectedShapes.length - 1];
      setFillColor(lastSelected.fillColor);
      setStrokeColor(lastSelected.strokeColor);
    }
    pushHistory([...newShapes]);
  };

  const handleToolChange = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const handleShapeComplete = () => {
    if (!isToolLocked) {
      setSelectedTool("select");
    }
  };

  const handleDelete = () => {
    const hasSelectedShapes = shapes.some((shape) => shape.isSelected);
    const updatedShapes = hasSelectedShapes
      ? shapes.filter((shape) => !shape.isSelected)
      : [];
    pushHistory(updatedShapes);
  };

  const { handleCopy, handlePaste } = useCopyPaste({
    shapes,
    onShapeUpdate: handleShapeUpdate,
  });

  useKeyboard({
    onDelete: handleDelete,
    onCopy: handleCopy,
    onPaste: handlePaste,
  });

  const handleFillColorChange = (color: string) => {
    setFillColor(color);

    const updatedShapes = shapes.map((shape) =>
      shape.isSelected ? { ...shape, fillColor: color } : shape,
    );
    pushHistory(updatedShapes);
  };

  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);

    const updatedShapes = shapes.map((shape) =>
      shape.isSelected ? { ...shape, strokeColor: color } : shape,
    );
    pushHistory(updatedShapes);
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Canvas
          shapes={shapes}
          selectedTool={selectedTool}
          fillColor={fillColor}
          strokeColor={strokeColor}
          onShapeUpdate={handleShapeUpdate}
          onShapeComplete={handleShapeComplete}
          onToolSelect={handleToolChange}
        />
      </div>
      <Toolbar
        selectedTool={selectedTool}
        fillColor={fillColor}
        strokeColor={strokeColor}
        isToolLocked={isToolLocked}
        onToolSelect={handleToolChange}
        onFillColorChange={handleFillColorChange}
        onStrokeColorChange={handleStrokeColorChange}
        onUndo={undo}
        onRedo={redo}
        onDelete={handleDelete}
        onToggleLock={() => setIsToolLocked(!isToolLocked)}
      />
    </div>
  );
}

export default SketchingCanvas;
