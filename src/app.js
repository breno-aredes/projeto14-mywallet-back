import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";

dotenv.config();

const server = express();
server.use(cors());
server.use(express.json());
const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
  await mongoClient.connect();

  console.log("servidor conectado ao banco de dados mongodb");
} catch (err) {
  res.status(500).send("Erro no servidor", err.message);
}
const db = mongoClient.db();

const PORT = 5000;
server.listen(PORT);
