import React, { useState } from "react";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { Tool, Shape } from "./types/drawing";
import { useHistory } from "./hooks/useHistory";
import { useKeyboard } from "./hooks/useKeyboard";

function SketchingCanvas() {
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [isToolLocked, setIsToolLocked] = useState(false);
  const [fillColor, setFillColor] = useState("rgba(255, 255, 255, 0)");
  const [strokeColor, setStrokeColor] = useState("rgba(0, 0, 0, 1)");
  const { shapes, pushHistory, undo, redo } = useHistory();

  const handleShapeUpdate = (newShapes: Shape[]) => {
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
      : []; // Clear all shapes if nothing is selected
    pushHistory(updatedShapes);
  };

  // Add keyboard delete handling
  useKeyboard(handleDelete);

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
        onFillColorChange={setFillColor}
        onStrokeColorChange={setStrokeColor}
        onUndo={undo}
        onRedo={redo}
        onDelete={handleDelete}
        onToggleLock={() => setIsToolLocked(!isToolLocked)}
      />
    </div>
  );
}

export default SketchingCanvas;
