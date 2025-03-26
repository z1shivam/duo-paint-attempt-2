"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useDrawingStore from "@/state/useDrawingStore";

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
    const router = useRouter();
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

    const remoteContextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isCreator, setIsCreator] = useState<boolean>(false);
    const [onlineUsers, setOnlineUsers] = useState<
        { username: string; isDrawing: boolean }[]
    >([]);

    // Load from localStorage
    useEffect(() => {
        const storedRoomId = localStorage.getItem("roomId");
        const storedIsCreator = localStorage.getItem("isCreator") === "true";
        if (storedRoomId) {
            setRoomId(storedRoomId);
            setIsCreator(storedIsCreator);
        }
    }, []);

    // WebSocket setup
    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        setWs(socket);

        socket.onopen = () => {
            console.log("Connected to WebSocket server");
            const storedRoomId = localStorage.getItem("roomId");
            const storedUsername = localStorage.getItem("username");
            if (storedRoomId && storedUsername && isLocal) {
                socket.send(
                    JSON.stringify({
                        type: "joinRoom",
                        roomId: storedRoomId,
                        username: storedUsername,
                    }),
                );
            }
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case "roomCreated":
                    setRoomId(data.roomId);
                    setIsCreator(true);
                    localStorage.setItem("roomId", data.roomId);
                    localStorage.setItem("isCreator", "true");
                    router.push(`/draw/${data.roomId}`);
                    break;
                case "roomJoined":
                    setRoomId(data.roomId);
                    setIsCreator(false);
                    localStorage.setItem("roomId", data.roomId);
                    localStorage.setItem("isCreator", "false");
                    if (data.paths) {
                        data.paths.forEach((path: Path) => addRemotePath(path));
                    }
                    router.push(`/draw/${data.roomId}`);
                    break;
                case "drawStart":
                    addRemotePath(data.path);
                    break;
                case "draw":
                    useDrawingStore.setState((state) => {
                        const updatedRemotePaths = [...state.remotePaths];
                        const lastPath =
                            updatedRemotePaths[updatedRemotePaths.length - 1];
                        if (lastPath) {
                            lastPath.points = [
                                ...lastPath.points,
                                [data.x, data.y],
                            ];
                            return { remotePaths: updatedRemotePaths };
                        }
                        return state;
                    });
                    break;
                case "drawEnd":
                    break;
                case "onlineStatus":
                    setOnlineUsers(data.users);
                    break;
                case "error":
                    console.error(data.message);
                    break;
                case "roomDestroyed":
                    setRoomId(null);
                    setIsCreator(false);
                    localStorage.removeItem("roomId");
                    localStorage.removeItem("isCreator");
                    localStorage.removeItem("username");
                    router.push("/");
                    break;
            }
        };

        socket.onclose = () => {
            console.log("Disconnected from WebSocket server");
        };

        return () => {
            socket.close();
        };
    }, [router, addRemotePath, isLocal]);

    // Initialize canvas context
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (isLocal) {
            setLocalContext(ctx);
        } else {
            remoteContextRef.current = ctx;
        }
    }, [isLocal, setLocalContext]);

    // Redraw canvas based on paths
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = isLocal
            ? useDrawingStore.getState().localContext
            : remoteContextRef.current;
        if (!ctx) return;

        const currentPaths = isLocal ? paths : remotePaths;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentPaths.forEach((path) => {
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.brushSize;
            ctx.beginPath();
            ctx.moveTo(path.startX, path.startY);
            path.points.forEach(([x, y]) => ctx.lineTo(x, y));
            ctx.stroke();
        });
    }, [paths, remotePaths, isLocal]);

    // Drawing handlers (only for local canvas)
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isLocal || !ws || !roomId) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = useDrawingStore.getState().localContext;
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        const path = {
            color: selectedColor,
            brushSize,
            startX: x,
            startY: y,
            points: [],
        };
        addPath(path);
        ws.send(JSON.stringify({ type: "drawStart", ...path }));
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isLocal || !isDrawing || !ws || !roomId) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = useDrawingStore.getState().localContext;
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();

        useDrawingStore.setState((state) => {
            const updatedPaths = [...state.paths];
            const lastPath = updatedPaths[updatedPaths.length - 1];
            if (lastPath) {
                lastPath.points = [...lastPath.points, [x, y]];
                return { paths: updatedPaths };
            }
            return state;
        });

        ws.send(JSON.stringify({ type: "draw", x, y }));
    };

    const stopDrawing = () => {
        if (!isLocal || !ws || !roomId) return;
        setIsDrawing(false);
        ws.send(JSON.stringify({ type: "drawEnd" }));
    };

    // Functions to interact with the WebSocket server
    const createRoom = (username: string) => {
        if (ws) {
            ws.send(JSON.stringify({ type: "createRoom", username }));
        }
    };

    const joinRoom = (roomId: string, username: string) => {
        if (ws) {
            ws.send(JSON.stringify({ type: "joinRoom", roomId, username }));
        }
    };

    const destroyRoom = () => {
        if (ws && roomId && isCreator) {
            ws.send(JSON.stringify({ type: "destroyRoom", roomId }));
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
                    onMouseDown={isLocal ? startDrawing : undefined}
                    onMouseMove={isLocal ? draw : undefined}
                    onMouseUp={isLocal ? stopDrawing : undefined}
                    onMouseOut={isLocal ? stopDrawing : undefined}
                    className={`${isLocal ? "pointer-events-auto" : "pointer-events-none"} bg-red-200`}
                >
                    Enable JavaScript to draw here.
                </canvas>
            </div>
            {roomId && (
                <div className="mt-2">
                    <p>Room ID: {roomId}</p>
                    <p>You are: {isCreator ? "Creator" : "Guest"}</p>
                    <p>Online Users:</p>
                    <ul>
                        {onlineUsers.map((user) => (
                            <li key={user.username}>
                                {user.username}{" "}
                                {user.isDrawing ? "(Drawing)" : "(Idle)"}
                            </li>
                        ))}
                    </ul>
                    {isCreator && (
                        <button
                            onClick={destroyRoom}
                            className="mt-2 rounded bg-red-500 px-4 py-2 text-white"
                        >
                            Destroy Room
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}
