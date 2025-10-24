import React, { useState, useRef, useEffect, useCallback } from "react";

export type TabPosition = "top" | "right" | "bottom" | "left";

interface CollapsibleTabProps {
  position?: TabPosition;
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const CollapsibleTab: React.FC<CollapsibleTabProps> = ({
  position = "right",
  label,
  children,
  className = "",
  tabClassName = "",
  contentClassName = "",
  isOpen: externalIsOpen,
  onToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Control interno/externo del estado
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = useCallback(
    (value: boolean) => {
      if (onToggle) {
        onToggle(value);
      }
      if (externalIsOpen === undefined) {
        setInternalIsOpen(value);
      }
    },
    [externalIsOpen, onToggle],
  );

  const toggleTab = () => {
    setIsOpen(!isOpen);
  };

  // Cerrar al hacer click fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Estilos base para el tab
  const getTabBaseStyles = () => {
    const baseStyles = "transition-colors duration-200 cursor-pointer";

    switch (position) {
      case "top":
        return `${baseStyles} rounded-t-lg px-4 py-2`;
      case "right":
        return `${baseStyles} rounded-r-lg px-4 py-2`;
      case "bottom":
        return `${baseStyles} rounded-b-lg px-4 py-2`;
      case "left":
        return `${baseStyles} rounded-l-lg px-4 py-2`;
      default:
        return `${baseStyles} rounded-lg px-4 py-2`;
    }
  };

  // Estilos para el contenido
  const getContentStyles = () => {
    const baseStyles =
      "shadow-lg absolute z-10 transition-all duration-300";
    const sizeStyles = "max-w-sm max-h-64 overflow-auto";

    switch (position) {
      case "top":
        return `${baseStyles} ${sizeStyles} rounded-lg bottom-full left-0 mb-1 min-w-full`;
      case "right":
        return `${baseStyles} ${sizeStyles} rounded-lg top-0 left-full ml-1 min-h-full`;
      case "bottom":
        return `${baseStyles} ${sizeStyles} rounded-lg top-full left-0 mt-1 min-w-full`;
      case "left":
        return `${baseStyles} ${sizeStyles} rounded-lg top-0 right-full mr-1 min-h-full`;
      default:
        return `${baseStyles} ${sizeStyles} rounded-lg`;
    }
  };

  // Estilos de animación para el contenido
  const getContentAnimationStyles = () => {
    if (!isOpen) {
      switch (position) {
        case "top":
          return "opacity-0 translate-y-2 pointer-events-none";
        case "right":
          return "opacity-0 -translate-x-2 pointer-events-none";
        case "bottom":
          return "opacity-0 -translate-y-2 pointer-events-none";
        case "left":
          return "opacity-0 translate-x-2 pointer-events-none";
        default:
          return "opacity-0 pointer-events-none";
      }
    }

    return "opacity-100 translate-x-0 translate-y-0";
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Botón/Pestaña */}
      <button
        onClick={toggleTab}
        className={`${getTabBaseStyles()} ${tabClassName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center justify-between">
          <span>{label}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                position === "top" || position === "bottom"
                  ? "M19 9l-7 7-7-7"
                  : "M9 5l7 7-7 7"
              }
            />
          </svg>
        </div>
      </button>

      {/* Contenido desplegable */}
      <div
        ref={contentRef}
        className={`${getContentStyles()} ${getContentAnimationStyles()} ${contentClassName}`}
        role="dialog"
        aria-labelledby="tab-label"
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export { CollapsibleTab };
