import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import e from "express";

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

//get login so para teste, deletar depois.
server.get("/login", async (req, res) => {
  try {
    const particiapants = await db.collection("login").find().toArray();
    return res.send(particiapants);
  } catch (err) {
    res.status(500).send("Erro no servidor");
  }
});

server.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const dataSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().min(5),
  });

  const validade = dataSchema.validate({ email, senha }, { abortEarly: false });

  if (validade.err) {
    const err = validade.err.details.map((detail) => detail.message);
    return res.status(422).send(err);
  }

  try {
    const verifyEmail = await db.collection("login").findOne({ email });

    if (!verifyEmail) return res.send("e-mail não cadastrado").status(422);

    if (verifyEmail.senha !== senha)
      return res.send("senha errada").status(422);

    return res.send("ok");
  } catch {
    return res.send("erro");
  }
});

server.post("/sing-up", async (req, res) => {});

server.get("/wallet", async (req, res) => {});

server.post("/wallet", async (req, res) => {});

const PORT = 5000;
server.listen(PORT);
