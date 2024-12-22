import React, { useState, useRef, useEffect } from "react";
import { RgbaColorPicker } from "react-colorful";
import { usePopper } from "react-popper";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  title: string;
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

const rgbaToString = (rgba: RgbaColor) =>
  `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;

const stringToRgba = (str: string): RgbaColor => {
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)/);
  if (!match) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
    a: match[4] ? parseFloat(match[4]) : 1,
  };
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(
    referenceElement.current,
    popperElement.current,
    {
      modifiers: [
        { name: "arrow", options: { element: arrowElement } },
        { name: "offset", options: { offset: [0, 20] } },
        {
          name: "preventOverflow",
          options: {
            padding: 8,
            altAxis: true,
            mainAxis: true,
          },
        },
      ],
      placement: "top",
    },
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popperElement.current &&
        !popperElement.current.contains(event.target as Node) &&
        referenceElement.current &&
        !referenceElement.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <div
        ref={referenceElement}
        className="relative w-8 h-8 rounded-full border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        title={title}
      >
        {/* Checker pattern background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%)
          `,
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
          }}
        />

        {/* Color overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: value }} />
      </div>

      {isOpen && (
        <div
          ref={popperElement}
          style={styles.popper}
          {...attributes.popper}
          className="z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-2">
            <RgbaColorPicker
              color={stringToRgba(value)}
              onChange={(color) => onChange(rgbaToString(color))}
            />
          </div>
          <div ref={setArrowElement} style={styles.arrow} />
        </div>
      )}
    </div>
  );
};
