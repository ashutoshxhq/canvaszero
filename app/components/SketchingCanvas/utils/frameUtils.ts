import { Shape } from '../types/drawing';

export const getNextFrameNumber = (shapes: Shape[]): number => {
  const frameNumbers = shapes
    .filter(s => s.type === 'frame')
    .map(s => {
      const match = s.name?.match(/Frame (\d+)/);
      return match ? parseInt(match[1], 10) : -1;
    });
  return frameNumbers.length > 0 ? Math.max(...frameNumbers) + 1 : 0;
};

const getOverlapArea = (shape: Shape, frame: Shape, titleBarHeight: number): number => {
  const frameContentY = frame.y + titleBarHeight;
  const frameContentHeight = frame.height - titleBarHeight;

  // Calculate intersection rectangle
  const xOverlap = Math.max(0,
    Math.min(shape.x + shape.width, frame.x + frame.width) -
    Math.max(shape.x, frame.x)
  );

  const yOverlap = Math.max(0,
    Math.min(shape.y + shape.height, frameContentY + frameContentHeight) -
    Math.max(shape.y, frameContentY)
  );

  return xOverlap * yOverlap;
};

export const isShapeInsideFrame = (shape: Shape, frame: Shape): boolean => {
  // For frames, we only consider the content area (below the title bar)
  const titleBarHeight = 32;

  // Calculate the area of the shape
  const shapeArea = shape.width * shape.height;

  // Calculate the overlapping area
  const overlapArea = getOverlapArea(shape, frame, titleBarHeight);

  // Consider the shape inside if at least 10% of its area overlaps with the frame's content area
  const overlapPercentage = (overlapArea / shapeArea) * 100;
  return overlapPercentage >= 10;
};

export const getContainingFrame = (shape: Shape, frames: Shape[]): Shape | null => {
  // Sort frames by area (smallest first) to handle nested frames
  const sortedFrames = [...frames]
    .filter(f => f.type === 'frame')
    .sort((a, b) => (a.width * a.height) - (b.width * b.height));

  // Return the smallest frame that contains the shape
  return sortedFrames.find(frame => isShapeInsideFrame(shape, frame)) || null;
};

export const sortShapesByType = (shapes: Shape[]): Shape[] => {
  console.log('sortShapesByType - Input shapes:', shapes);

  // Create a deep copy of the shapes array to avoid mutating the original
  const shapesCopy = shapes.map(shape => ({
    ...shape,
    type: shape.type,
    id: shape.id,
    scale: { ...shape.scale },
    points: shape.points ? [...shape.points] : undefined,
    startPoint: shape.startPoint ? { ...shape.startPoint } : undefined,
    endPoint: shape.endPoint ? { ...shape.endPoint } : undefined,
    isSelected: shape.isSelected,
    isFrame: shape.type === 'frame',
    name: shape.name || (shape.type === 'frame' ? `Frame ${getNextFrameNumber(shapes)}` : undefined),
    borderRadius: shape.borderRadius,
    fillColor: shape.fillColor,
    strokeColor: shape.strokeColor,
    rotation: shape.rotation,
    width: Math.max(1, shape.width),
    height: Math.max(1, shape.height)
  }));
  console.log('sortShapesByType - After deep copy:', shapesCopy);

  // Separate frames and non-frames
  const frames = shapesCopy.filter(s => s.type === 'frame');
  const nonFrames = shapesCopy.filter(s => s.type !== 'frame');
  console.log('sortShapesByType - Frames:', frames);
  console.log('sortShapesByType - Non-frames:', nonFrames);

  // Sort frames by their number to maintain consistent order
  const orderedFrames = frames.sort((a, b) => {
    const aNum = parseInt(a.name?.match(/Frame (\d+)/)?.[1] || '0', 10);
    const bNum = parseInt(b.name?.match(/Frame (\d+)/)?.[1] || '0', 10);
    return aNum - bNum;
  });

  // Put frames at the beginning (rendering first, thus behind)
  // followed by all other shapes
  const result = [...orderedFrames, ...nonFrames];
  console.log('sortShapesByType - Final result:', result);
  return result;
};