import React from 'react';
import { Point } from '../types/drawing';

interface GridProps {
  zoom: number;
  pan: Point;
}

export const Grid: React.FC<GridProps> = ({ zoom, pan }) => {
  const smallGridSize = 50;
  const largeGridSize = smallGridSize * 2;
  const gridOpacity = Math.min(1, Math.max(0.1, zoom * 0.5));

  // Calculate grid offset based on pan position to create infinite effect
  // Remove the negative sign to make grid move in same direction as shapes
  const offsetX = (pan.x % largeGridSize);
  const offsetY = (pan.y % largeGridSize);

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        minWidth: '200%',
        minHeight: '200%',
        left: offsetX - largeGridSize,
        top: offsetY - largeGridSize,
      }}
    >
      <defs>
        <pattern
          id="smallGrid"
          width={smallGridSize}
          height={smallGridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${smallGridSize} 0 L 0 0 0 ${smallGridSize}`}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="0.5"
            opacity={gridOpacity}
          />
        </pattern>
        <pattern
          id="grid"
          width={largeGridSize}
          height={largeGridSize}
          patternUnits="userSpaceOnUse"
        >
          <rect width={largeGridSize} height={largeGridSize} fill="url(#smallGrid)" />
          <path
            d={`M ${largeGridSize} 0 L 0 0 0 ${largeGridSize}`}
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1"
            opacity={gridOpacity}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
};