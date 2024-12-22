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
    if (event.buttons === 2 || (event.buttons === 1 && event.altKey)) {
      setIsPanning(true);
    }
  }, []);

  const updatePan = useCallback((event: React.MouseEvent, prevPan: Point) => {
    if (!isPanning) return prevPan;
    
    return {
      x: prevPan.x + event.movementX * PAN_SPEED,
      y: prevPan.y + event.movementY * PAN_SPEED
    };
  }, [isPanning]);

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      // Zoom
      const delta = -event.deltaY * ZOOM_SPEED;
      setZoom(prevZoom => {
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom * (1 + delta)));
        return newZoom;
      });
    } else {
      // Pan
      setPan(prevPan => ({
        x: prevPan.x - event.deltaX * WHEEL_PAN_SPEED,
        y: prevPan.y - event.deltaY * WHEEL_PAN_SPEED
      }));
    }
  }, []);

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