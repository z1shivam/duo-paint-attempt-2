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
    setLocalContext: (ctx: CanvasRenderingContext2D) => void;
    isDrawing: boolean;
    setColor: (color: string) => void;
    toggleEraser: () => void;
    setBrushSize: (size: number) => void;
    setIsDrawing: (isDrawing: boolean) => void;
    addPath: (path: Path) => void;
    addRemotePath: (path: Path) => void;
}

interface Path {
    color: string;
    brushSize: number;
    startX: number;
    startY: number;
    points: [number, number][];
}

const useDrawingStore = create<DrawingState>()(
    persist(
        (set) => ({
            availableColors: ["Red", "Black", "Green"],
            selectedColor: "Red",
            brushSize: 4,
            paths: [],
            remotePaths: [],
            localContext: null,
            isDrawing: false,
            isEraserOn: true,

            setLocalContext: (ctx: CanvasRenderingContext2D) =>
                set({ localContext: ctx }),
            setColor: (color: string) =>
                set((state) => {
                    if (state.localContext) {
                        state.localContext.strokeStyle = color;
                        state.isEraserOn = false;
                    }
                    return { selectedColor: color, isEraserOn: false };
                }),

            toggleEraser: () =>
                set((state) => ({ isEraserOn: !state.isEraserOn , selectedColor: "NA"})),

            setBrushSize: (size: number) =>
                set((state) => {
                    if (state.localContext) {
                        state.localContext.lineWidth = size;
                    }
                    return { brushSize: size };
                }),

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
        }),
        {
            name: "drawingStore",
        },
    ),
);

export default useDrawingStore;
