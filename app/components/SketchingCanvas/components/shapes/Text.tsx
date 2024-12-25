import React, { useEffect, useRef, useCallback, useState } from "react";
import { BaseShapeProps } from "./types";
import { SELECTION_PADDING } from "../../utils/constants";

export const Text: React.FC<BaseShapeProps> = ({ shape, isSelected }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<SVGTextElement>(null);
    const measureSpanRef = useRef<HTMLSpanElement | null>(null);
    const [currentText, setCurrentText] = useState(shape.text || '');
    const [isEditing, setIsEditing] = useState(shape.isEditing || false);
    const [dimensions, setDimensions] = useState({ width: shape.width || 200, height: shape.height || 50 });

    const measureText = useCallback((text: string) => {
        if (!measureSpanRef.current) {
            const span = document.createElement('span');
            span.style.visibility = 'hidden';
            span.style.position = 'absolute';
            span.style.fontSize = `${shape.fontSize || 16}px`;
            span.style.fontFamily = 'sans-serif';
            span.style.whiteSpace = 'pre';
            span.style.left = '-9999px';
            document.body.appendChild(span);
            measureSpanRef.current = span;
        }

        const span = measureSpanRef.current;
        span.textContent = text || 'Type here...';
        const rect = span.getBoundingClientRect();
        const padding = 20;
        const newDimensions = {
            width: Math.max(100, rect.width + padding),
            height: Math.max(24, rect.height + padding)
        };
        console.log('measureText:', { text, rect, newDimensions });
        return newDimensions;
    }, [shape.fontSize]);

    // Update shape dimensions whenever text content changes
    useEffect(() => {
        if (!isEditing) {
            console.log('Text element ref:', textRef.current);
            let newDimensions = dimensions;

            if (textRef.current) {
                const bbox = textRef.current.getBBox();
                console.log('SVG text bbox:', bbox);
                newDimensions = {
                    width: Math.max(100, bbox.width + 20),
                    height: Math.max(24, bbox.height + 20)
                };
            } else {
                newDimensions = measureText(currentText);
            }

            console.log('Updating shape dimensions:', { currentText, newDimensions, shape });
            setDimensions(newDimensions);

            const event = new CustomEvent('shapeupdate', {
                detail: {
                    id: shape.id,
                    updates: {
                        width: newDimensions.width,
                        height: newDimensions.height,
                        text: currentText,
                    },
                },
            });
            window.dispatchEvent(event);
        }

        return () => {
            if (measureSpanRef.current) {
                document.body.removeChild(measureSpanRef.current);
                measureSpanRef.current = null;
            }
        };
    }, [currentText, shape.fontSize, shape.id, isEditing, measureText]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isEditing) {
            console.log('Click event:', {
                shape,
                clickX: e.clientX,
                clickY: e.clientY,
                target: e.target,
                currentTarget: e.currentTarget,
                dimensions,
                shapeBox: {
                    x: shape.x,
                    y: shape.y,
                    width: dimensions.width,
                    height: dimensions.height
                }
            });
            const event = new CustomEvent('shapeupdate', {
                detail: {
                    id: shape.id,
                    updates: {
                        isSelected: true,
                    },
                },
            });
            window.dispatchEvent(event);
        }
    }, [shape.id, isEditing, dimensions, shape.x, shape.y]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        console.log('Double click event:', { currentText, shape });
        const event = new CustomEvent('shapeupdate', {
            detail: {
                id: shape.id,
                updates: {
                    isEditing: true,
                    text: currentText,
                },
            },
        });
        window.dispatchEvent(event);
    }, [shape.id, currentText]);

    useEffect(() => {
        setIsEditing(shape.isEditing || false);
    }, [shape.isEditing]);

    useEffect(() => {
        if (shape.text !== undefined) {
            console.log('Text changed from prop:', { from: currentText, to: shape.text });
            setCurrentText(shape.text);
        }
    }, [shape.text]);

    useEffect(() => {
        if (isEditing && textRef.current) {
            const textElement = textRef.current;
            const textRect = textElement.getBoundingClientRect();
            console.log('Text element rect:', textRect);

            // Create container for input
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.zIndex = '9999';
            container.style.pointerEvents = 'all';
            container.style.display = 'flex';
            container.style.alignItems = 'flex-start';
            document.body.appendChild(container);
            containerRef.current = container;

            // Create input element
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText;
            input.style.position = 'relative';
            input.style.background = 'transparent';
            input.style.border = 'none';
            input.style.padding = '0';
            input.style.margin = '0';
            input.style.fontSize = `${shape.fontSize || 16}px`;
            input.style.fontFamily = 'sans-serif';
            input.style.outline = 'none';
            input.style.cursor = 'text';
            input.style.color = shape.strokeColor;
            input.style.minWidth = '100px';
            input.style.lineHeight = '1.5';
            input.placeholder = 'Type here...';
            inputRef.current = input;

            // Function to update input width based on content
            const updateWidth = (text: string) => {
                const newDimensions = measureText(text);
                input.style.width = `${newDimensions.width}px`;
                container.style.width = input.style.width;
                setDimensions(newDimensions);
                console.log('Input width updated:', { text, newDimensions, inputWidth: input.style.width });

                // Update shape dimensions while typing
                const event = new CustomEvent('shapeupdate', {
                    detail: {
                        id: shape.id,
                        updates: {
                            text: text,
                            isEditing: true,
                            width: newDimensions.width,
                            height: newDimensions.height,
                        },
                    },
                });
                window.dispatchEvent(event);
            };

            // Position the container at the text element's position
            container.style.left = `${textRect.left}px`;
            container.style.top = `${textRect.top}px`;

            container.appendChild(input);
            updateWidth(currentText);

            // Focus and select text
            requestAnimationFrame(() => {
                input.focus();
                input.select();
            });

            // Event handlers
            const handleInput = (e: Event) => {
                const target = e.target as HTMLInputElement;
                const newText = target.value;
                console.log('Input event:', { newText, oldText: currentText });
                setCurrentText(newText);
                updateWidth(newText);
            };

            const handleBlur = () => {
                if (containerRef.current) {
                    document.body.removeChild(containerRef.current);
                    containerRef.current = null;
                }
                setIsEditing(false);

                // Get final dimensions and update shape
                const newDimensions = measureText(currentText);
                console.log('Blur event - final dimensions:', { currentText, newDimensions });
                const event = new CustomEvent('shapeupdate', {
                    detail: {
                        id: shape.id,
                        updates: {
                            text: currentText,
                            isEditing: false,
                            width: newDimensions.width,
                            height: newDimensions.height,
                        },
                    },
                });
                window.dispatchEvent(event);
            };

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            };

            input.addEventListener('input', handleInput);
            input.addEventListener('blur', handleBlur);
            input.addEventListener('keydown', handleKeyDown);

            return () => {
                input.removeEventListener('input', handleInput);
                input.removeEventListener('blur', handleBlur);
                input.removeEventListener('keydown', handleKeyDown);
                if (containerRef.current) {
                    document.body.removeChild(containerRef.current);
                    containerRef.current = null;
                }
            };
        }
    }, [isEditing, shape.x, shape.y, shape.id, shape.fontSize, shape.strokeColor, measureText]);

    const fontSize = shape.fontSize || 16;

    console.log('Text render:', {
        currentText,
        isEditing,
        shapeWidth: dimensions.width,
        shapeHeight: dimensions.height,
        isSelected,
        fontSize,
        shapeX: shape.x,
        shapeY: shape.y,
        hitArea: {
            x: shape.x,
            y: shape.y,
            width: dimensions.width,
            height: dimensions.height
        }
    });

    return (
        <g id={shape.id} className="pointer-events-all">
            {/* Selection rectangle */}
            {isSelected && (
                <rect
                    x={shape.x - SELECTION_PADDING}
                    y={shape.y - SELECTION_PADDING}
                    width={dimensions.width + SELECTION_PADDING * 2}
                    height={dimensions.height + SELECTION_PADDING * 2}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="pointer-events-none"
                    style={{ pointerEvents: 'none' }}
                />
            )}
            {/* Hit area for interaction */}
            <rect
                x={shape.x}
                y={shape.y}
                width={dimensions.width}
                height={dimensions.height}
                fill="transparent"
                stroke="transparent"
                strokeWidth="0"
                className="pointer-events-all"
                style={{ pointerEvents: 'all', cursor: 'pointer' }}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
            />
            <text
                ref={textRef}
                x={shape.x}
                y={shape.y}
                fontSize={fontSize}
                fill={shape.strokeColor}
                fontFamily="sans-serif"
                dominantBaseline="hanging"
                opacity={isEditing ? 0 : 1}
                className="pointer-events-none"
                style={{ pointerEvents: 'none' }}
            >
                {currentText || 'Type here...'}
            </text>
        </g>
    );
};