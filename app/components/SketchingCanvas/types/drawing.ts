export type Point = {
  x: number;
  y: number;
};

export type ShapeType =
  | "rectangle"
  | "circle"
  | "frame"
  | "pencil"
  | "line"
  | "text";

export type ResizeHandle =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "start"
  | "end";

export type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: Point;
  fillColor: string;
  strokeColor: string;
  isSelected: boolean;
  isFrame?: boolean;
  name?: string;
  points?: Point[];
  borderRadius?: number;
  startPoint?: Point;
  endPoint?: Point;
  text?: string;
  fontSize?: number;
};

export type Tool = ShapeType | "select";

export type ResizeData = {
  originalShape: Shape;
  originalBox?: {
    width: number;
    height: number;
  };
  handle: ResizeHandle;
  startPoint: Point;
  aspectRatio?: number;
  originalScale?: Point;
};
