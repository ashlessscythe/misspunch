"use client";

import { useRef, useEffect, useState } from "react";

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  onChange?: (signature: string) => void;
  width?: number;
  height?: number;
}

export function SignaturePad({
  onChange,
  width = 400,
  height = 200,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const isInitialized = useRef(false);

  // Initialize canvas once
  useEffect(() => {
    if (isInitialized.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale the context to handle the device pixel ratio
    context.scale(dpr, dpr);

    // Set up canvas
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";

    // Set white background
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    setCtx(context);
    isInitialized.current = true;
  }, [width, height]);

  // Set up event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;

    // Convert coordinates to account for canvas scaling
    const getPoint = (e: MouseEvent | TouchEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      return {
        x: ((clientX - rect.left) / rect.width) * width,
        y: ((clientY - rect.top) / rect.height) * height,
      };
    };

    // Handle drawing
    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;

      e.preventDefault();
      const point = getPoint(e);

      if (lastPoint.current) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }

      lastPoint.current = point;
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      lastPoint.current = getPoint(e);
    };

    const stopDrawing = () => {
      if (!isDrawing.current) return;

      isDrawing.current = false;
      lastPoint.current = null;

      if (onChange) {
        onChange(canvas.toDataURL());
      }
    };

    // Event listeners
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    // Touch events
    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("touchmove", draw);
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("touchcancel", stopDrawing);

    // Cleanup
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
      canvas.removeEventListener("touchcancel", stopDrawing);
    };
  }, [ctx, width, height, onChange]);

  const clearSignature = () => {
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    if (onChange && canvasRef.current) {
      onChange(canvasRef.current.toDataURL());
    }
  };

  return (
    <div className="relative border rounded-md overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none"
      />
      <button
        type="button"
        onClick={clearSignature}
        className="absolute bottom-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded text-sm"
      >
        Clear
      </button>
    </div>
  );
}
