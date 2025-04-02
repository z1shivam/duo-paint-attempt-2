"use client";

import useDrawingStore, { type Path } from "@/state/useDrawingStore";
import { useEffect, useRef } from "react";

interface DrawAreaProps {
    width?: number;
    height?: number;
    borderColor?: string;
    isLocal?: boolean;
}

export default function DrawArea({
    width = 300,
    height = 500,
    borderColor = "border-slate-400",
    isLocal = true,
}: DrawAreaProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const currentPathRef = useRef<Path | null>(null);
    const {
        paths,
        setLocalContext,
        isDrawing,
        setIsDrawing,
        localContext,
        addPath,
        isEraserOn,
        selectedColor,
        brushSize,
        redrawCanvas,
    } = useDrawingStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const canvasContext = canvas.getContext("2d");
            if (canvasContext && isLocal) {
                canvasContext.lineCap = "round";
                canvasContext.lineJoin = "round";
                canvasContext.strokeStyle = isEraserOn ? "#ffffff" : selectedColor;
                canvasContext.lineWidth = brushSize;
                setLocalContext(canvasContext);
            }
        }
    }, [isLocal, setLocalContext, selectedColor, brushSize, isEraserOn]);

    useEffect(() => {
        redrawCanvas();
    }, [paths, redrawCanvas]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isLocal || !localContext) return;
        const { offsetX, offsetY } = e.nativeEvent;
        localContext.beginPath();
        localContext.moveTo(offsetX, offsetY);
        setIsDrawing(true);
        currentPathRef.current = {
            color: isEraserOn ? "#ffffff" : selectedColor,
            brushSize,
            startX: offsetX,
            startY: offsetY,
            points: [],
        };
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !localContext) return;
        const { offsetX, offsetY } = e.nativeEvent;
        localContext.lineTo(offsetX, offsetY);
        localContext.stroke();
        currentPathRef.current &&
            currentPathRef.current.points.push([offsetX, offsetY]);
    };

    const stopDrawing = () => {
        if (!isLocal) return;
        localContext?.closePath();
        setIsDrawing(false);

        if (currentPathRef.current) {
            addPath(currentPathRef.current);
            currentPathRef.current = null;  
        }
    };

    return (
        <section className="px-3">
            <div
                className={`cursor-crosshair rounded-md border-2 border-dotted ${borderColor}`}
                style={{ position: "relative" }}
            >
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className={`${isLocal ? "pointer-events-auto" : "pointer-events-none"} bg-white rounded-md`}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                >
                    Enable JavaScript to draw here.
                </canvas>
            </div>
        </section>
    );
}
