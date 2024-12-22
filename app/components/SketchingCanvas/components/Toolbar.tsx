import React from "react";
import { Tool } from "../types/drawing";
import {
  Square,
  Circle,
  MousePointer,
  Frame,
  Undo2,
  Redo2,
  Trash,
  Pencil,
  Minus,
  Lock,
  Unlock,
} from "lucide-react";
import { ColorPicker } from "./ColorPicker";

interface ToolbarProps {
  selectedTool: Tool;
  fillColor: string;
  strokeColor: string;
  isToolLocked: boolean;
  onToolSelect: (tool: Tool) => void;
  onFillColorChange: (color: string) => void;
  onStrokeColorChange: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  fillColor,
  strokeColor,
  isToolLocked,
  onToolSelect,
  onFillColorChange,
  onStrokeColorChange,
  onUndo,
  onRedo,
  onDelete,
  onToggleLock,
}) => {
  const tools = [
    { id: "select", icon: MousePointer },
    { id: "frame", icon: Frame },
    { id: "rectangle", icon: Square },
    { id: "circle", icon: Circle },
    { id: "line", icon: Minus },
    { id: "pencil", icon: Pencil },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {tools.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onToolSelect(id as Tool)}
              className={`p-2 rounded-lg transition-colors ${
                selectedTool === id
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              title={id.charAt(0).toUpperCase() + id.slice(1)}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <div className="flex items-center space-x-1">
          <ColorPicker
            value={fillColor}
            onChange={onFillColorChange}
            title="Fill Color"
          />
          <ColorPicker
            value={strokeColor}
            onChange={onStrokeColorChange}
            title="Stroke Color"
          />
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <div className="flex items-center space-x-1">
          <button
            onClick={onUndo}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            title="Undo"
          >
            <Undo2 size={20} />
          </button>
          <button
            onClick={onRedo}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            title="Redo"
          >
            <Redo2 size={20} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
            title="Delete"
          >
            <Trash size={20} />
          </button>
          <button
            onClick={onToggleLock}
            className={`p-2 rounded-lg transition-colors ${
              isToolLocked ? "text-blue-600" : "text-gray-700"
            } hover:bg-gray-100`}
            title={isToolLocked ? "Unlock Tool" : "Lock Tool"}
          >
            {isToolLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};
