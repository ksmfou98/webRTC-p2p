import express from "express";
import cors from "cors";
import http from "http";

const app = express();
const PORT = 8080;
const server = http.createServer(app);

app.use(cors());

server.listen(PORT, () => {
  console.log(`✅ server ON ${PORT}`);
});
