import { Shape, ResizeHandle } from "../../types/drawing";

export interface BaseShapeProps {
  shape: Shape;
  isSelected: boolean;
  onResizeStart?: (handle: ResizeHandle, e: React.MouseEvent) => void;
}
