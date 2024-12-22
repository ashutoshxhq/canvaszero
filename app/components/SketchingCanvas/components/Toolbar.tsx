import React, { useState } from "react";
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
  ChevronDown,
  ChevronUp,
  Palette,
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
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const tools = [
    { id: "select", icon: MousePointer },
    { id: "frame", icon: Frame },
    { id: "rectangle", icon: Square },
    { id: "circle", icon: Circle },
    { id: "line", icon: Minus },
    { id: "pencil", icon: Pencil },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] md:w-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex flex-col md:flex-row items-center gap-2 md:inline-flex">
        {/* Drawing Tools - Always visible */}
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-1 w-full md:w-auto">
          {tools.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onToolSelect(id as Tool)}
              className={`p-3 md:p-2 rounded-lg transition-colors ${selectedTool === id
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100 text-gray-700"
                }`}
              title={id.charAt(0).toUpperCase() + id.slice(1)}
            >
              <Icon size={24} className="md:w-5 md:h-5" />
            </button>
          ))}
        </div>

        <div className="w-full md:w-px h-px md:h-6 bg-gray-200 shrink-0" />

        {/* Color Tools - Collapsible on mobile */}
        <div className="w-full md:w-auto shrink-0">
          <button
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            className="md:hidden w-full p-2 flex items-center justify-between text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Palette size={24} />
              <span>Colors</span>
            </div>
            {isColorPickerOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <div className={`${isColorPickerOpen ? 'flex' : 'hidden'} md:flex items-center justify-center md:justify-start gap-2 p-2 md:p-0`}>
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
        </div>

        <div className="w-full md:w-px h-px md:h-6 bg-gray-200 shrink-0" />

        <div className="w-full md:w-auto shrink-0">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="md:hidden w-full p-2 flex items-center justify-between text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Undo2 size={24} />
              <span>History</span>
            </div>
            {isHistoryOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <div className={`${isHistoryOpen ? 'flex' : 'hidden'} md:flex items-center justify-center md:justify-start gap-1 p-2 md:p-0`}>
            <button
              onClick={onUndo}
              className="p-3 md:p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              title="Undo"
            >
              <Undo2 size={24} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={onRedo}
              className="p-3 md:p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              title="Redo"
            >
              <Redo2 size={24} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-3 md:p-2 rounded-lg hover:bg-gray-100 text-red-600"
              title="Delete"
            >
              <Trash size={24} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={onToggleLock}
              className={`p-3 md:p-2 rounded-lg transition-colors ${isToolLocked ? "text-blue-600" : "text-gray-700"
                } hover:bg-gray-100`}
              title={isToolLocked ? "Unlock Tool" : "Lock Tool"}
            >
              {isToolLocked ? (
                <Lock size={24} className="md:w-5 md:h-5" />
              ) : (
                <Unlock size={24} className="md:w-5 md:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
