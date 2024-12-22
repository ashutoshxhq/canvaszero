import { Shape } from '../types/drawing';

export const getNextFrameNumber = (shapes: Shape[]): number => {
  const frameNumbers = shapes
    .filter(s => s.type === 'frame')
    .map(s => {
      const match = s.name?.match(/Canvas (\d+)/);
      return match ? parseInt(match[1], 10) : -1;
    });
  return frameNumbers.length > 0 ? Math.max(...frameNumbers) + 1 : 0;
};

export const sortShapesByType = (shapes: Shape[]): Shape[] => {
  // Separate frames and non-frames
  const frames = shapes.filter(s => s.type === 'frame');
  const nonFrames = shapes.filter(s => s.type !== 'frame');

  // Preserve the original order of frames relative to each other
  const orderedFrames = frames.sort((a, b) => {
    const aNum = parseInt(a.name?.match(/Canvas (\d+)/)?.[1] || '0', 10);
    const bNum = parseInt(b.name?.match(/Canvas (\d+)/)?.[1] || '0', 10);
    return aNum - bNum;
  });

  // Put frames at the beginning (rendering first, thus behind)
  // followed by all other shapes
  return [...orderedFrames, ...nonFrames];
};