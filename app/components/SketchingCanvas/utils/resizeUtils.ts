import { Point, Shape, ResizeHandle } from "../types/drawing";
import { getBoundingBox } from "./shapeUtils";

const MIN_SIZE = 10;

interface ResizeResult {
  x: number;
  y: number;
  width: number;
  height: number;
  scale?: { x: number; y: number };
}

function getFixedPoints(shape: Shape) {
  return {
    fixedRight: shape.x + shape.width,
    fixedBottom: shape.y + shape.height,
    fixedLeft: shape.x,
    fixedTop: shape.y,
  };
}

function initializeResizeValues(shape: Shape): ResizeResult {
  return {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  };
}

function calculateScale(
  newWidth: number,
  newHeight: number,
  originalBox: { width: number; height: number },
): { x: number; y: number } {
  return {
    x: newWidth / (originalBox.width || 1),
    y: newHeight / (originalBox.height || 1),
  };
}

function handleTopLeftResize(
  shape: Shape,
  movementX: number,
  movementY: number,
): ResizeResult {
  const { fixedRight, fixedBottom } = getFixedPoints(shape);
  const newWidth = Math.max(MIN_SIZE, fixedRight - (shape.x + movementX));
  const newHeight = Math.max(MIN_SIZE, fixedBottom - (shape.y + movementY));

  return {
    x: fixedRight - newWidth,
    y: fixedBottom - newHeight,
    width: newWidth,
    height: newHeight,
  };
}

function handleTopRightResize(
  shape: Shape,
  movementX: number,
  movementY: number,
): ResizeResult {
  const { fixedLeft, fixedBottom } = getFixedPoints(shape);
  const newWidth = Math.max(MIN_SIZE, shape.width + movementX);
  const newHeight = Math.max(MIN_SIZE, fixedBottom - (shape.y + movementY));

  return {
    x: fixedLeft,
    y: fixedBottom - newHeight,
    width: newWidth,
    height: newHeight,
  };
}

function handleBottomLeftResize(
  shape: Shape,
  movementX: number,
  movementY: number,
): ResizeResult {
  const { fixedRight, fixedTop } = getFixedPoints(shape);
  const newWidth = Math.max(MIN_SIZE, fixedRight - (shape.x + movementX));
  const newHeight = Math.max(MIN_SIZE, shape.height + movementY);

  return {
    x: fixedRight - newWidth,
    y: fixedTop,
    width: newWidth,
    height: newHeight,
  };
}

function handleBottomRightResize(
  shape: Shape,
  movementX: number,
  movementY: number,
): ResizeResult {
  const { fixedLeft, fixedTop } = getFixedPoints(shape);
  const newWidth = Math.max(MIN_SIZE, shape.width + movementX);
  const newHeight = Math.max(MIN_SIZE, shape.height + movementY);

  return {
    x: fixedLeft,
    y: fixedTop,
    width: newWidth,
    height: newHeight,
  };
}

function handleAspectRatioResize(
  shape: Shape,
  handle: ResizeHandle,
  movementX: number,
  movementY: number,
): ResizeResult {
  const aspectRatio = shape.width / shape.height;
  const { fixedRight, fixedBottom, fixedLeft, fixedTop } =
    getFixedPoints(shape);

  const useWidth = Math.abs(movementX) > Math.abs(movementY);
  let result = initializeResizeValues(shape);

  switch (handle) {
    case "top-left": {
      if (useWidth) {
        result.width = Math.max(MIN_SIZE, fixedRight - (shape.x + movementX));
        result.height = result.width / aspectRatio;
      } else {
        result.height = Math.max(MIN_SIZE, fixedBottom - (shape.y + movementY));
        result.width = result.height * aspectRatio;
      }
      result.x = fixedRight - result.width;
      result.y = fixedBottom - result.height;
      break;
    }
    case "top-right": {
      if (useWidth) {
        result.width = Math.max(MIN_SIZE, shape.width + movementX);
        result.height = result.width / aspectRatio;
      } else {
        result.height = Math.max(MIN_SIZE, fixedBottom - (shape.y + movementY));
        result.width = result.height * aspectRatio;
      }
      result.x = fixedLeft;
      result.y = fixedBottom - result.height;
      break;
    }
    case "bottom-left": {
      if (useWidth) {
        result.width = Math.max(MIN_SIZE, fixedRight - (shape.x + movementX));
        result.height = result.width / aspectRatio;
      } else {
        result.height = Math.max(MIN_SIZE, shape.height + movementY);
        result.width = result.height * aspectRatio;
      }
      result.x = fixedRight - result.width;
      result.y = fixedTop;
      break;
    }
    case "bottom-right": {
      if (useWidth) {
        result.width = Math.max(MIN_SIZE, shape.width + movementX);
        result.height = result.width / aspectRatio;
      } else {
        result.height = Math.max(MIN_SIZE, shape.height + movementY);
        result.width = result.height * aspectRatio;
      }
      result.x = fixedLeft;
      result.y = fixedTop;
      break;
    }
  }

  return result;
}
export function calculateLineResize(
  shape: Shape,
  handle: ResizeHandle,
  currentPoint: Point,
): ResizeResult {
  if (handle === "start") {
    return {
      x: currentPoint.x,
      y: currentPoint.y,
      width: shape.x + shape.width - currentPoint.x,
      height: shape.y + shape.height - currentPoint.y,
    };
  } else if (handle === "end") {
    return {
      x: shape.x,
      y: shape.y,
      width: currentPoint.x - shape.x,
      height: currentPoint.y - shape.y,
    };
  }

  return {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  };
}

export function calculatePencilResize(
  shape: Shape,
  originalShape: Shape,
  handle: ResizeHandle,
  movementX: number,
  movementY: number,
  keepAspectRatio: boolean = false,
): ResizeResult {
  if (!shape.points || !originalShape.points) {
    return initializeResizeValues(shape);
  }

  const fixedAnchors = {
    topLeft: { x: shape.x, y: shape.y },
    topRight: { x: shape.x + shape.width, y: shape.y },
    bottomLeft: { x: shape.x, y: shape.y + shape.height },
    bottomRight: { x: shape.x + shape.width, y: shape.y + shape.height },
  };

  let newX = shape.x;
  let newY = shape.y;
  let newWidth = shape.width;
  let newHeight = shape.height;

  switch (handle) {
    case "bottom-left": {
      const anchor = fixedAnchors.topRight;
      newWidth = Math.max(MIN_SIZE, anchor.x - (shape.x + movementX));
      newHeight = Math.max(MIN_SIZE, shape.height + movementY);
      newX = anchor.x - newWidth;
      newY = anchor.y;
      break;
    }
    case "bottom-right": {
      const anchor = fixedAnchors.topLeft;
      newWidth = Math.max(MIN_SIZE, shape.width + movementX);
      newHeight = Math.max(MIN_SIZE, shape.height + movementY);
      newX = anchor.x;
      newY = anchor.y;
      break;
    }
    case "top-left": {
      const anchor = fixedAnchors.bottomRight;
      newWidth = Math.max(MIN_SIZE, anchor.x - (shape.x + movementX));
      newHeight = Math.max(MIN_SIZE, anchor.y - (shape.y + movementY));
      newX = anchor.x - newWidth;
      newY = anchor.y - newHeight;
      break;
    }
    case "top-right": {
      const anchor = fixedAnchors.bottomLeft;
      newWidth = Math.max(MIN_SIZE, shape.width + movementX);
      newHeight = Math.max(MIN_SIZE, anchor.y - (shape.y + movementY));
      newX = anchor.x;
      newY = anchor.y - newHeight;
      break;
    }
  }

  if (keepAspectRatio) {
    const aspectRatio = shape.width / shape.height;
    const useWidth = Math.abs(movementX) > Math.abs(movementY);

    switch (handle) {
      case "bottom-left": {
        const anchor = fixedAnchors.topRight;
        if (useWidth) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
        newX = anchor.x - newWidth;
        break;
      }
      case "bottom-right": {
        const anchor = fixedAnchors.topLeft;
        if (useWidth) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
        newX = anchor.x;
        newY = anchor.y;
        break;
      }
      case "top-left": {
        const anchor = fixedAnchors.bottomRight;
        if (useWidth) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
        newX = anchor.x - newWidth;
        newY = anchor.y - newHeight;
        break;
      }
      case "top-right": {
        const anchor = fixedAnchors.bottomLeft;
        if (useWidth) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
        newX = anchor.x;
        newY = anchor.y - newHeight;
        break;
      }
    }
  }

  const originalBox = getBoundingBox(originalShape.points);
  const scale = {
    x: newWidth / originalBox.width,
    y: newHeight / originalBox.height,
  };

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
    scale,
  };
}

export function calculateRectangleResize(
  shape: Shape,
  handle: ResizeHandle,
  movementX: number,
  movementY: number,
  keepAspectRatio: boolean = false,
): ResizeResult {
  if (keepAspectRatio) {
    return handleAspectRatioResize(shape, handle, movementX, movementY);
  }

  switch (handle) {
    case "top-left":
      return handleTopLeftResize(shape, movementX, movementY);
    case "top-right":
      return handleTopRightResize(shape, movementX, movementY);
    case "bottom-left":
      return handleBottomLeftResize(shape, movementX, movementY);
    case "bottom-right":
      return handleBottomRightResize(shape, movementX, movementY);
    default:
      return initializeResizeValues(shape);
  }
}
