"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [joinUsername, setJoinUsername] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();

  // Load initial values from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRoomId = localStorage.getItem("roomId");
    if (storedUsername) {
      setJoinUsername(storedUsername);
      setCreateUsername(storedUsername);
    }
    if (storedRoomId) {
      setJoinRoomId(storedRoomId);
    }
  }, []);

  // Initialize WebSocket
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setWs(socket);

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      // Auto-join if roomId exists in localStorage
      const storedRoomId = localStorage.getItem("roomId");
      const storedUsername = localStorage.getItem("username");
      if (storedRoomId && storedUsername) {
        socket.send(
          JSON.stringify({
            type: "joinRoom",
            roomId: storedRoomId,
            username: storedUsername,
          })
        );
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "roomCreated":
          localStorage.setItem("roomId", data.roomId);
          localStorage.setItem("username", createUsername);
          localStorage.setItem("isCreator", "true");
          router.push(`/draw/${data.roomId}`);
          break;
        case "roomJoined":
          localStorage.setItem("roomId", data.roomId);
          localStorage.setItem("username", joinUsername);
          localStorage.setItem("isCreator", "false");
          router.push(`/draw/${data.roomId}`);
          break;
        case "error":
          console.error(data.message);
          alert(data.message);
          break;
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    return () => {
      socket.close();
    };
  }, [router, createUsername, joinUsername]);

  // Handle form submissions
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ws && joinUsername && joinRoomId) {
      ws.send(
        JSON.stringify({
          type: "joinRoom",
          roomId: joinRoomId,
          username: joinUsername,
        })
      );
    } else {
      alert("Please enter both username and room ID");
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ws && createUsername) {
      ws.send(
        JSON.stringify({
          type: "createRoom",
          username: createUsername,
        })
      );
    } else {
      alert("Please enter a username");
    }
  };

  return (
    <main className="p-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Join Room</h2>
        <form onSubmit={handleJoinSubmit} className="space-y-4">
          <div>
            <label htmlFor="joinUsername" className="block mb-1">
              Enter username
            </label>
            <input
              id="joinUsername"
              type="text"
              value={joinUsername}
              onChange={(e) => setJoinUsername(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="roomId" className="block mb-1">
              Enter room ID
            </label>
            <input
              id="roomId"
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Join
          </button>
        </form>

        <h2 className="text-xl font-bold mt-8 mb-4">Create Room</h2>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label htmlFor="createUsername" className="block mb-1">
              Enter username
            </label>
            <input
              id="createUsername"
              type="text"
              value={createUsername}
              onChange={(e) => setCreateUsername(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create
          </button>
        </form>
      </div>
    </main>
  );
}