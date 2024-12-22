import React, { useEffect, useRef } from "react";
import { Shape } from "../types/drawing";

interface TextEditorProps {
  shape: Shape;
  onTextChange: (text: string) => void;
  onBlur: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  shape,
  onTextChange,
  onBlur,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleResize = () => {
    if (!inputRef.current || !shape.startPoint || !shape.endPoint) return;

    const width = inputRef.current.offsetWidth;
    const height = inputRef.current.offsetHeight;

    shape.endPoint = {
      x: (shape.startPoint?.x || 0) + width,
      y: (shape.startPoint?.y || 0) + height,
    };
  };

  if (!shape.startPoint || !shape.endPoint) {
    return null;
  }

  return (
    <textarea
      ref={inputRef}
      className="absolute bg-transparent border border-blue-500 outline-none resize-both overflow-hidden p-1"
      style={{
        left: Math.min(shape.startPoint.x, shape.endPoint.x) + "px",
        top: Math.min(shape.startPoint.y, shape.endPoint.y) + "px",
        width: Math.abs(shape.endPoint.x - shape.startPoint.x) + "px",
        height: Math.abs(shape.endPoint.y - shape.startPoint.y) + "px",
        color: shape.strokeColor,
        fontSize: `${shape.fontSize || 16}px`,
        lineHeight: "1.2",
        minWidth: "100px",
        minHeight: "24px",
      }}
      value={shape.text === "Enter text..." ? "" : shape.text}
      onChange={(e) => onTextChange(e.target.value)}
      onMouseUp={handleResize}
      onBlur={onBlur}
      placeholder="Enter text..."
    />
  );
};
