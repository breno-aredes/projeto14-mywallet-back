import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import walletRouter from "./routes/walletRoutes.js";

const server = express();
server.use(cors());
server.use(express.json());

server.use([authRouter, walletRouter]);

const PORT = 5000;
server.listen(PORT);
