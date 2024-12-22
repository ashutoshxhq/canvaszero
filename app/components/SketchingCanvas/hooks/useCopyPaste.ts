import { useCallback, useState } from 'react';
import { Shape } from '../types/drawing';

interface UseCopyPasteProps {
    shapes: Shape[];
    onShapeUpdate: (shapes: Shape[]) => void;
}

export const useCopyPaste = ({ shapes, onShapeUpdate }: UseCopyPasteProps) => {
    const [copiedShapes, setCopiedShapes] = useState<Shape[]>([]);

    const handleCopy = useCallback(() => {
        const selectedShapes = shapes.filter(shape => shape.isSelected);
        if (selectedShapes.length > 0) {
            setCopiedShapes(selectedShapes);
        }
    }, [shapes]);

    const handlePaste = useCallback(() => {
        if (copiedShapes.length > 0) {
            // Create new shapes with new IDs and slightly offset positions
            const newShapes = copiedShapes.map(shape => ({
                ...shape,
                id: Math.random().toString(36).substr(2, 9),
                x: shape.x + 20, // Offset by 20 pixels
                y: shape.y + 20,
                isSelected: true // Select the newly pasted shapes
            }));

            // Deselect all current shapes and add the new ones
            const updatedShapes = [
                ...shapes.map(shape => ({ ...shape, isSelected: false })),
                ...newShapes
            ];

            onShapeUpdate(updatedShapes);
        }
    }, [shapes, copiedShapes, onShapeUpdate]);

    return {
        handleCopy,
        handlePaste,
    };
}; 