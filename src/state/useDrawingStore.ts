import { create } from "zustand";

interface DrawingState {
    availableColors: string[];
    selectedColor: string;
    brushSize: number;
    paths: Path[];
    remotePaths: Path[];
    localContext: CanvasRenderingContext2D | null;
    setLocalContext: (ctx: CanvasRenderingContext2D) => void;
    isDrawing: boolean;
    setColor: (color: string) => void;
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

const useDrawingStore = create<DrawingState>((set) => ({
    availableColors: ["Red", "Black", "Green"],
    selectedColor: "Red",
    brushSize: 2,
    paths: [],
    remotePaths: [],
    localContext: null,
    isDrawing: false,

    setLocalContext: (ctx: CanvasRenderingContext2D) =>
        set({ localContext: ctx }),
    setColor: (color: string) =>
        set((state) => {
            if (state.localContext) {
                state.localContext.strokeStyle = color;
            }
            return { selectedColor: color };
        }),

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
}));

export default useDrawingStore;
