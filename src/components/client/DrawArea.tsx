"use client";

import useDrawingStore from "@/state/useDrawingStore";
import { useEffect, useRef } from "react";

interface DrawAreaProps {
    width?: number;
    height?: number;
    borderColor?: string;
    isLocal?: boolean;
}

interface Path {
    color: string;
    brushSize: number;
    startX: number;
    startY: number;
    points: [number, number][];
}

export default function DrawArea({
    width = 300,
    height = 500,
    borderColor = "border-slate-400",
    isLocal = true,
}: DrawAreaProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const {
        paths,
        remotePaths,
        setLocalContext,
        isDrawing,
        setIsDrawing,
        addPath,
        addRemotePath,
        selectedColor,
        brushSize,
    } = useDrawingStore();

    // initialize canvas context
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const canvasContext = canvas.getContext("2d");
            canvasContext && isLocal && setLocalContext(canvasContext);
        }
    }, [isLocal, setLocalContext]);

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
                    className={`${isLocal ? "pointer-events-auto" : "pointer-events-none"} bg-red-100`}
                >
                    Enable JavaScript to draw here.
                </canvas>
            </div>
        </section>
    );
}
