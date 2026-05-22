import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { documentRoutes } from "./routes/document.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { registerDocumentSocket } from "./sockets/document.socket.js";

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use(errorHandler);

registerDocumentSocket(io);

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
