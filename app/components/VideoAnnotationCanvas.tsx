"use client";

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import type { AnnotationTool, AnnotationStyle } from "./AnnotationToolbar";

/**
 * VIDEO ANNOTATION CANVAS - Frame.io-style Drawing System
 * Canvas overlay for drawing annotations on video frames
 */

// Point type for drawing
interface Point {
  x: number;
  y: number;
}

// Annotation shape data
export interface AnnotationShape {
  id: string;
  type: AnnotationTool;
  points: Point[];
  style: AnnotationStyle;
  textContent?: string;
  bounds?: { x: number; y: number; width: number; height: number };
  timecode: number;
}

interface VideoAnnotationCanvasProps {
  width: number;
  height: number;
  currentTime: number;
  isPlaying: boolean;
  selectedTool: AnnotationTool;
  style: AnnotationStyle;
  existingAnnotations?: AnnotationShape[];
  onAnnotationComplete?: (shape: AnnotationShape) => void;
  onAnnotationsChange?: (shapes: AnnotationShape[]) => void;
  showAnnotationsAtTime?: boolean; // Only show annotations at current timecode
  timecodeThreshold?: number; // Seconds threshold for showing annotations (default 0.5)
}

export interface VideoAnnotationCanvasRef {
  clear: () => void;
  undo: () => void;
  getAnnotations: () => AnnotationShape[];
  captureFrame: () => string | null;
  hasAnnotations: () => boolean;
}

const VideoAnnotationCanvas = forwardRef<VideoAnnotationCanvasRef, VideoAnnotationCanvasProps>(
  (
    {
      width,
      height,
      currentTime,
      isPlaying,
      selectedTool,
      style,
      existingAnnotations = [],
      onAnnotationComplete,
      onAnnotationsChange,
      showAnnotationsAtTime = true,
      timecodeThreshold = 0.5,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
    const [annotations, setAnnotations] = useState<AnnotationShape[]>(existingAnnotations);
    const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
    const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean }>({
      x: 0,
      y: 0,
      visible: false,
    });
    const [textValue, setTextValue] = useState("");
    const historyRef = useRef<AnnotationShape[][]>([]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      clear: () => {
        historyRef.current.push([...annotations]);
        setAnnotations([]);
        onAnnotationsChange?.([]);
      },
      undo: () => {
        if (historyRef.current.length > 0) {
          const previousState = historyRef.current.pop();
          if (previousState) {
            setAnnotations(previousState);
            onAnnotationsChange?.(previousState);
          }
        } else if (annotations.length > 0) {
          const newAnnotations = annotations.slice(0, -1);
          setAnnotations(newAnnotations);
          onAnnotationsChange?.(newAnnotations);
        }
      },
      getAnnotations: () => annotations,
      captureFrame: () => canvasRef.current?.toDataURL("image/png") || null,
      hasAnnotations: () => annotations.length > 0,
    }));

    // Filter annotations by current time if enabled
    const visibleAnnotations = showAnnotationsAtTime
      ? annotations.filter(
          (a) => Math.abs(a.timecode - currentTime) <= timecodeThreshold
        )
      : annotations;

    // Get canvas coordinates from mouse event
    const getCanvasPoint = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
      },
      []
    );

    // Draw a single shape on canvas
    const drawShape = useCallback(
      (ctx: CanvasRenderingContext2D, shape: AnnotationShape, isActive: boolean = false) => {
        ctx.save();

        ctx.strokeStyle = shape.style.strokeColor;
        ctx.lineWidth = shape.style.strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = shape.style.opacity;

        if (isActive) {
          ctx.shadowColor = shape.style.strokeColor;
          ctx.shadowBlur = 8;
        }

        switch (shape.type) {
          case "freehand":
            if (shape.points.length < 2) break;
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
              ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
            ctx.stroke();
            break;

          case "arrow":
            if (shape.points.length < 2) break;
            const start = shape.points[0];
            const end = shape.points[shape.points.length - 1];

            // Draw line
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            // Draw arrowhead
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const headLength = 15 + shape.style.strokeWidth * 2;

            ctx.beginPath();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLength * Math.cos(angle - Math.PI / 6),
              end.y - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLength * Math.cos(angle + Math.PI / 6),
              end.y - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
            break;

          case "circle":
            if (!shape.bounds) break;
            const centerX = shape.bounds.x + shape.bounds.width / 2;
            const centerY = shape.bounds.y + shape.bounds.height / 2;
            const radiusX = Math.abs(shape.bounds.width / 2);
            const radiusY = Math.abs(shape.bounds.height / 2);

            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            if (shape.style.fillColor) {
              ctx.fillStyle = shape.style.fillColor;
              ctx.fill();
            }
            ctx.stroke();
            break;

          case "rectangle":
            if (!shape.bounds) break;
            ctx.beginPath();
            ctx.rect(
              shape.bounds.x,
              shape.bounds.y,
              shape.bounds.width,
              shape.bounds.height
            );
            if (shape.style.fillColor) {
              ctx.fillStyle = shape.style.fillColor;
              ctx.fill();
            }
            ctx.stroke();
            break;

          case "text":
            if (!shape.textContent || !shape.bounds) break;
            ctx.font = `${shape.style.fontSize}px Inter, sans-serif`;
            ctx.fillStyle = shape.style.strokeColor;
            ctx.fillText(shape.textContent, shape.bounds.x, shape.bounds.y);
            break;

          case "blur":
            if (!shape.bounds) break;
            // Create blur effect (simulated with semi-transparent overlay)
            ctx.fillStyle = "rgba(128, 128, 128, 0.7)";
            ctx.filter = "blur(8px)";
            ctx.fillRect(
              shape.bounds.x,
              shape.bounds.y,
              shape.bounds.width,
              shape.bounds.height
            );
            ctx.filter = "none";
            break;

          case "spotlight":
            if (!shape.bounds) break;
            // Dim everything except the spotlight area
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(0, 0, width, height);

            // Clear the spotlight area
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.ellipse(
              shape.bounds.x + shape.bounds.width / 2,
              shape.bounds.y + shape.bounds.height / 2,
              Math.abs(shape.bounds.width / 2),
              Math.abs(shape.bounds.height / 2),
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";

            // Draw spotlight border
            ctx.strokeStyle = shape.style.strokeColor;
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
        }

        ctx.restore();
      },
      [width, height]
    );

    // Render all annotations
    const render = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw existing annotations
      visibleAnnotations.forEach((shape) => {
        drawShape(ctx, shape, shape.id === selectedAnnotation);
      });

      // Draw current drawing
      if (isDrawing && currentPoints.length > 0) {
        const tempShape: AnnotationShape = {
          id: "temp",
          type: selectedTool,
          points: currentPoints,
          style,
          timecode: currentTime,
        };

        if (
          ["circle", "rectangle", "blur", "spotlight"].includes(selectedTool) &&
          currentPoints.length >= 2
        ) {
          const start = currentPoints[0];
          const end = currentPoints[currentPoints.length - 1];
          tempShape.bounds = {
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            width: Math.abs(end.x - start.x),
            height: Math.abs(end.y - start.y),
          };
        }

        drawShape(ctx, tempShape, true);
      }
    }, [
      visibleAnnotations,
      isDrawing,
      currentPoints,
      selectedTool,
      style,
      currentTime,
      selectedAnnotation,
      drawShape,
    ]);

    // Re-render on changes
    useEffect(() => {
      render();
    }, [render]);

    // Handle mouse down
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPlaying || selectedTool === "select") return;

      const point = getCanvasPoint(e);

      if (selectedTool === "text") {
        setTextInput({ x: point.x, y: point.y, visible: true });
        setTextValue("");
        return;
      }

      setIsDrawing(true);
      setCurrentPoints([point]);
    };

    // Handle mouse move
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const point = getCanvasPoint(e);

      if (selectedTool === "freehand") {
        setCurrentPoints((prev) => [...prev, point]);
      } else {
        setCurrentPoints((prev) => [prev[0], point]);
      }
    };

    // Handle mouse up
    const handleMouseUp = () => {
      if (!isDrawing || currentPoints.length < 2) {
        setIsDrawing(false);
        setCurrentPoints([]);
        return;
      }

      // Create the annotation shape
      const newShape: AnnotationShape = {
        id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: selectedTool,
        points: [...currentPoints],
        style: { ...style },
        timecode: currentTime,
      };

      // Calculate bounds for shape-based tools
      if (
        ["circle", "rectangle", "blur", "spotlight"].includes(selectedTool) &&
        currentPoints.length >= 2
      ) {
        const start = currentPoints[0];
        const end = currentPoints[currentPoints.length - 1];
        newShape.bounds = {
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y),
        };
      }

      // Save history for undo
      historyRef.current.push([...annotations]);

      // Add annotation
      const newAnnotations = [...annotations, newShape];
      setAnnotations(newAnnotations);
      onAnnotationsChange?.(newAnnotations);
      onAnnotationComplete?.(newShape);

      setIsDrawing(false);
      setCurrentPoints([]);
    };

    // Handle text input submit
    const handleTextSubmit = () => {
      if (!textValue.trim()) {
        setTextInput({ ...textInput, visible: false });
        return;
      }

      const newShape: AnnotationShape = {
        id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "text",
        points: [{ x: textInput.x, y: textInput.y }],
        style: { ...style },
        textContent: textValue,
        bounds: { x: textInput.x, y: textInput.y + style.fontSize, width: 0, height: 0 },
        timecode: currentTime,
      };

      historyRef.current.push([...annotations]);
      const newAnnotations = [...annotations, newShape];
      setAnnotations(newAnnotations);
      onAnnotationsChange?.(newAnnotations);
      onAnnotationComplete?.(newShape);

      setTextInput({ ...textInput, visible: false });
      setTextValue("");
    };

    // Keyboard shortcuts for tools
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
          return;

        if (e.key === "Escape") {
          setIsDrawing(false);
          setCurrentPoints([]);
          setTextInput({ ...textInput, visible: false });
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [textInput]);

    return (
      <div className="relative" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={`absolute inset-0 ${
            selectedTool === "select" ? "cursor-default" : "cursor-crosshair"
          } ${isPlaying ? "pointer-events-none" : ""}`}
          style={{ touchAction: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Text input overlay */}
        {textInput.visible && (
          <div
            className="absolute z-10"
            style={{
              left: textInput.x,
              top: textInput.y,
              transform: "translate(-4px, -4px)",
            }}
          >
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTextSubmit();
                if (e.key === "Escape") setTextInput({ ...textInput, visible: false });
              }}
              onBlur={handleTextSubmit}
              autoFocus
              className="px-2 py-1 text-white bg-black/80 border border-white/30 rounded outline-none min-w-[100px]"
              style={{
                fontSize: style.fontSize,
                color: style.strokeColor,
              }}
              placeholder="Type text..."
            />
          </div>
        )}

        {/* Annotation count indicator */}
        {visibleAnnotations.length > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-teal-500/90 text-white text-xs font-medium">
            {visibleAnnotations.length} annotation{visibleAnnotations.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    );
  }
);

VideoAnnotationCanvas.displayName = "VideoAnnotationCanvas";

export default VideoAnnotationCanvas;
