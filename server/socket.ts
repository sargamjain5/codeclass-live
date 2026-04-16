import { Server } from "socket.io";
import http from "http";

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "*", // In production, replace with your frontend URL
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log("🚀 User connected:", socket.id);

  // 1. Join a specific session/room
  socket.on("join-session", (sessionId: string) => {
    socket.join(sessionId);
    console.log(`👤 User ${socket.id} joined room: ${sessionId}`);
  });

  // 2. Handle real-time code updates
  socket.on("code-change", ({ sessionId, code }: { sessionId: string; code: string }) => {
    // .to(sessionId) sends to everyone in the room EXCEPT the sender
    socket.to(sessionId).emit("code-update", code);
  });

  // 3. Handle Raise Hand
  socket.on("raise-hand", (sessionId: string) => {
    // .in(sessionId) sends to EVERYONE in the room including the sender
    io.in(sessionId).emit("hand-raised", { 
      userId: socket.id,
      timestamp: new Date().toLocaleTimeString() 
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`📡 Socket.io server running on http://localhost:${PORT}`);
});