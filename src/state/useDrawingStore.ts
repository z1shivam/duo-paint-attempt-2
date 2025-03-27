import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DrawingState {
    availableColors: string[];
    selectedColor: string;
    brushSize: number;
    paths: Path[];
    isEraserOn: boolean;
    remotePaths: Path[];
    localContext: CanvasRenderingContext2D | null;
    remoteContext: CanvasRenderingContext2D | null;
    setLocalContext: (ctx: CanvasRenderingContext2D) => void;
    setRemoteContext: (ctx: CanvasRenderingContext2D) => void;
    isDrawing: boolean;
    setColor: (color: string) => void;
    toggleEraser: () => void;
    clearCanvas: () => void;
    setBrushSize: (size: number) => void;
    setIsDrawing: (isDrawing: boolean) => void;
    addPath: (path: Path) => void;
    addRemotePath: (path: Path) => void;
    redrawCanvas: () => void;
}

export interface Path {
    color: string;
    brushSize: number;
    startX: number;
    startY: number;
    points: [number, number][];
}

const useDrawingStore = create<DrawingState>()(
    persist(
        (set, get) => ({
            availableColors: ["Red", "Black", "Green"],
            selectedColor: "NA",
            brushSize: 4,
            paths: [],
            remotePaths: [],
            localContext: null,
            remoteContext: null,
            isDrawing: false,
            isEraserOn: true,

            setLocalContext: (ctx: CanvasRenderingContext2D) =>
                set({ localContext: ctx }),
            setRemoteContext: (ctx: CanvasRenderingContext2D) =>
                set({ remoteContext: ctx }),
            setColor: (color: string) =>
                set((state) => {
                    if (state.localContext) {
                        state.localContext.strokeStyle = color;
                        state.isEraserOn = false;
                    }
                    return { selectedColor: color, isEraserOn: false };
                }),

            toggleEraser: () =>
                set((state) => ({
                    isEraserOn: !state.isEraserOn,
                    selectedColor: "NA",
                })),

            setBrushSize: (size: number) =>
                set((state) => {
                    if (state.localContext) {
                        state.localContext.lineWidth = size;
                    }
                    return { brushSize: size };
                }),

            clearCanvas: () => {
                const { localContext } = get();
                if (localContext) {
                    const canvas = localContext.canvas;
                    localContext.clearRect(0, 0, canvas.width, canvas.height);
                }
                set({ paths: [] });
            },
            setIsDrawing: (isDrawing: boolean) => set({ isDrawing }),

            addPath: (path: Path) =>
                set((state) => ({
                    paths: [...state.paths, path],
                })),
            addRemotePath: (path: Path) => {
                set((state) => ({
                    remotePaths: [...state.remotePaths, path],
                }));
            },
            redrawCanvas: () => {
                const { localContext, paths } = get();
                if (!localContext) return;
                localContext.clearRect(
                    0,
                    0,
                    localContext.canvas.width,
                    localContext.canvas.height,
                );
                paths.forEach((path) => {
                    localContext.beginPath();
                    localContext.strokeStyle = path.color;
                    localContext.lineWidth = path.brushSize;
                    localContext.moveTo(path.startX, path.startY);
                    path.points.forEach(([x, y]) => localContext.lineTo(x, y));
                    localContext.stroke();
                    localContext.closePath();
                });
            },
        }),
        {
            name: "drawingStore",
        },
    ),
);

export default useDrawingStore;
