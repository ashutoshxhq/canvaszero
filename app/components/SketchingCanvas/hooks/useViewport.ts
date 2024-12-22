import { useState, useCallback } from 'react';
import { Point } from '../types/drawing';

const ZOOM_SPEED = 0.005; // Increased from 0.001 for faster zooming
const PAN_SPEED = 0.8;
const WHEEL_PAN_SPEED = 0.5;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

export const useViewport = () => {
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  const startPan = useCallback((event: React.MouseEvent) => {
    if (event.buttons === 2 || event.buttons === 4 || (event.buttons === 1 && event.altKey) || event.button === 1) {
      setIsPanning(true);
    }
  }, []);

  const updatePan = useCallback((event: React.MouseEvent, prevPan: Point) => {
    if (event.buttons === 2 || event.buttons === 4 || (event.buttons === 1 && event.altKey) || event.buttons === 4) {
      return {
        x: prevPan.x + event.movementX * PAN_SPEED,
        y: prevPan.y + event.movementY * PAN_SPEED
      };
    }
    return prevPan;
  }, []);

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      // Get the cursor position relative to the canvas
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;

      // Calculate cursor position relative to content (accounting for current pan)
      const contentX = (cursorX - pan.x) / zoom;
      const contentY = (cursorY - pan.y) / zoom;

      // Calculate zoom delta
      const delta = -event.deltaY * ZOOM_SPEED;

      setZoom(prevZoom => {
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom * (1 + delta)));

        // Adjust pan to keep the cursor point fixed
        const newPan = {
          x: cursorX - contentX * newZoom,
          y: cursorY - contentY * newZoom
        };

        setPan(newPan);
        return newZoom;
      });
    } else {
      // Pan
      setPan(prevPan => ({
        x: prevPan.x - event.deltaX * WHEEL_PAN_SPEED,
        y: prevPan.y - event.deltaY * WHEEL_PAN_SPEED
      }));
    }
  }, [pan, zoom]);

  const stopPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  return {
    pan,
    setPan,
    zoom,
    setZoom,
    isPanning,
    startPan,
    updatePan,
    stopPan,
    handleWheel
  };
};