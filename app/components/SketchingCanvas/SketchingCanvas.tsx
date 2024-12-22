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
    console.log('handleShapeUpdate called with shapes:', newShapes);
    // Update color pickers when shape selection changes
    const selectedShapes = newShapes.filter(shape => shape.isSelected);
    if (selectedShapes.length > 0) {
      // Use the last selected shape's colors
      const lastSelected = selectedShapes[selectedShapes.length - 1];
      setFillColor(lastSelected.fillColor);
      setStrokeColor(lastSelected.strokeColor);
    }
    console.log('Pushing to history:', newShapes);
    pushHistory([...newShapes]);
    console.log('After pushing to history');
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

  // Add copy-paste functionality
  const { handleCopy, handlePaste } = useCopyPaste({
    shapes,
    onShapeUpdate: handleShapeUpdate,
  });

  // Add keyboard handlers for delete, copy, and paste
  useKeyboard({
    onDelete: handleDelete,
    onCopy: handleCopy,
    onPaste: handlePaste,
  });

  const handleFillColorChange = (color: string) => {
    setFillColor(color);
    // Update selected shapes with new fill color
    const updatedShapes = shapes.map(shape =>
      shape.isSelected ? { ...shape, fillColor: color } : shape
    );
    pushHistory(updatedShapes);
  };

  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
    // Update selected shapes with new stroke color
    const updatedShapes = shapes.map(shape =>
      shape.isSelected ? { ...shape, strokeColor: color } : shape
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
