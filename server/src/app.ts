import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
const PORT = 4000;
const server = http.createServer(app);

// socket 서버 생성
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  allowEIO3: true,
});

app.use(cors());

server.listen(PORT, () => {
  console.log(`✅ server ON ${PORT}`);
});
