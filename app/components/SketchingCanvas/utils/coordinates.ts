import { Point } from "../types/drawing";

export const getCanvasPoint = (clientX: number, clientY: number): Point | null => {
    const svg = document.querySelector('svg');
    if (!svg) return null;

    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;

    const transform = svg.getScreenCTM();
    if (!transform) return null;

    const transformedPoint = point.matrixTransform(transform.inverse());
    return {
        x: transformedPoint.x,
        y: transformedPoint.y
    };
}; 