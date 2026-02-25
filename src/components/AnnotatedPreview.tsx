import React, { useState, useRef, useEffect } from "react";
import { Anchor } from "../domain/types";
import { ZoomIn, ZoomOut, Maximize, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AnnotatedPreviewProps {
  imageUrl: string;
  anchors: Anchor[];
  showAnnotations?: boolean;
}

export const AnnotatedPreview: React.FC<AnnotatedPreviewProps> = ({
  imageUrl,
  anchors,
  showAnnotations = true,
}) => {
  const [zoom, setZoom] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const resetZoom = () => setZoom(1);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setDimensions({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
      setIsLoaded(true);
    }
  };

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current) {
        setDimensions({
          width: imgRef.current.clientWidth,
          height: imgRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clamp = (val: number) => Math.min(Math.max(val, 0), 1);

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
      {/* Toolbar */}
      <div className="p-2 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleZoom(0.25)}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Reset Zoom"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-bold text-slate-400 ml-2">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Preview Area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto scrollbar-hide flex items-start justify-center p-8"
      >
        <div
          className="relative shadow-2xl transition-transform duration-200 ease-out origin-top"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="UX Screen"
            onLoad={handleImageLoad}
            className="max-w-full h-auto block rounded-sm"
            referrerPolicy="no-referrer"
          />

          {/* Annotation Overlay */}
          {isLoaded && showAnnotations && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            >
              <AnimatePresence>
                {anchors.map((anchor, i) => {
                  if (anchor.type === "rect") {
                    const x = clamp(anchor.x) * dimensions.width;
                    const y = clamp(anchor.y) * dimensions.height;
                    const w = clamp(anchor.width) * dimensions.width;
                    const h = clamp(anchor.height) * dimensions.height;

                    return (
                      <motion.g
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <rect
                          x={x}
                          y={y}
                          width={w}
                          height={h}
                          className="fill-indigo-500/10 stroke-indigo-500 stroke-2"
                          rx="4"
                        />
                        {anchor.label && (
                          <foreignObject x={x} y={y - 24} width="200" height="20">
                            <div className="text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded inline-block whitespace-nowrap shadow-sm">
                              {anchor.label}
                            </div>
                          </foreignObject>
                        )}
                      </motion.g>
                    );
                  } else {
                    const x = clamp(anchor.x) * dimensions.width;
                    const y = clamp(anchor.y) * dimensions.height;

                    return (
                      <motion.g
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          className="fill-indigo-500 stroke-white stroke-2 shadow-lg"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="12"
                          className="fill-none stroke-indigo-500 stroke-1 animate-pulse"
                        />
                        {anchor.label && (
                          <foreignObject x={x + 12} y={y - 10} width="200" height="20">
                            <div className="text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded inline-block whitespace-nowrap shadow-sm">
                              {anchor.label}
                            </div>
                          </foreignObject>
                        )}
                      </motion.g>
                    );
                  }
                })}
              </AnimatePresence>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
