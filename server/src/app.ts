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

const users = {};
const ROOM_MAX_USER = 2;

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ roomId }: { roomId: string }) => {
    if (users[roomId]) {
      // if (users[roomId].length >= ROOM_MAX_USER) {
      //   console.log("방이 꽉 참");
      //   io.sockets.to(socket.id).emit("roomFull", {
      //     message: "방이 꽉 찼습니다.",
      //   });
      //   return;
      // }
      users[roomId].push({ id: socket.id });
    } else {
      users[roomId] = [{ id: socket.id }];
    }
    socket.join(roomId);
    console.log(`✅ socket join room ${roomId}`);

    const usersInThisRoom = users[roomId].filter(
      (user) => user.id !== socket.id
    );

    io.sockets.to(socket.id).emit("allUsers", usersInThisRoom);
  });
});

app.use(cors());

server.listen(PORT, () => {
  console.log(`✅ server ON ${PORT}`);
});
