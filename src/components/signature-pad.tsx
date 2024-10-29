"use client";

import { useRef, useEffect } from "react";

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
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Handle drawing
    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current || !ctx || !canvas) return;

      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const point: Point = {
        x:
          "touches" in e
            ? e.touches[0].clientX - rect.left
            : e.clientX - rect.left,
        y:
          "touches" in e
            ? e.touches[0].clientY - rect.top
            : e.clientY - rect.top,
      };

      if (lastPoint.current) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }

      lastPoint.current = point;
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true;
      const rect = canvas.getBoundingClientRect();
      lastPoint.current = {
        x:
          "touches" in e
            ? e.touches[0].clientX - rect.left
            : e.clientX - rect.left,
        y:
          "touches" in e
            ? e.touches[0].clientY - rect.top
            : e.clientY - rect.top,
      };
    };

    const stopDrawing = () => {
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

    // Cleanup
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
    };
  }, [onChange]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="signature-area border rounded-md cursor-crosshair touch-none"
    />
  );
}
