import { Shape } from "../types/drawing";

export const getNextFrameNumber = (shapes: Shape[]): number => {
  const frameNumbers = shapes
    .filter((s) => s.type === "frame")
    .map((s) => {
      const match = s.name?.match(/Frame (\d+)/);
      return match ? parseInt(match[1], 10) : -1;
    });
  return frameNumbers.length > 0 ? Math.max(...frameNumbers) + 1 : 0;
};

const getOverlapArea = (
  shape: Shape,
  frame: Shape,
  titleBarHeight: number,
): number => {
  const frameContentY = frame.y + titleBarHeight;
  const frameContentHeight = frame.height - titleBarHeight;

  const xOverlap = Math.max(
    0,
    Math.min(shape.x + shape.width, frame.x + frame.width) -
      Math.max(shape.x, frame.x),
  );

  const yOverlap = Math.max(
    0,
    Math.min(shape.y + shape.height, frameContentY + frameContentHeight) -
      Math.max(shape.y, frameContentY),
  );

  return xOverlap * yOverlap;
};

export const isShapeInsideFrame = (shape: Shape, frame: Shape): boolean => {
  const titleBarHeight = 32;

  const shapeArea = shape.width * shape.height;

  const overlapArea = getOverlapArea(shape, frame, titleBarHeight);

  const overlapPercentage = (overlapArea / shapeArea) * 100;
  return overlapPercentage >= 10;
};

export const getContainingFrame = (
  shape: Shape,
  frames: Shape[],
): Shape | null => {
  const sortedFrames = [...frames]
    .filter((f) => f.type === "frame")
    .sort((a, b) => a.width * a.height - b.width * b.height);

  return sortedFrames.find((frame) => isShapeInsideFrame(shape, frame)) || null;
};

export const sortShapesByType = (shapes: Shape[]): Shape[] => {
  const shapesCopy = shapes.map((shape) => ({
    ...shape,
    type: shape.type,
    id: shape.id,
    scale: { ...shape.scale },
    points: shape.points ? [...shape.points] : undefined,
    startPoint: shape.startPoint ? { ...shape.startPoint } : undefined,
    endPoint: shape.endPoint ? { ...shape.endPoint } : undefined,
    isSelected: shape.isSelected,
    isFrame: shape.type === "frame",
    name:
      shape.name ||
      (shape.type === "frame"
        ? `Frame ${getNextFrameNumber(shapes)}`
        : undefined),
    borderRadius: shape.borderRadius,
    fillColor: shape.fillColor,
    strokeColor: shape.strokeColor,
    rotation: shape.rotation,
    width: Math.max(1, shape.width),
    height: Math.max(1, shape.height),
  }));

  const frames = shapesCopy.filter((s) => s.type === "frame");
  const nonFrames = shapesCopy.filter((s) => s.type !== "frame");

  const orderedFrames = frames.sort((a, b) => {
    const aNum = parseInt(a.name?.match(/Frame (\d+)/)?.[1] || "0", 10);
    const bNum = parseInt(b.name?.match(/Frame (\d+)/)?.[1] || "0", 10);
    return aNum - bNum;
  });

  const result = [...orderedFrames, ...nonFrames];
  return result;
};
