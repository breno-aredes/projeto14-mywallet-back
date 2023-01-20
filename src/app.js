import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import dayjs from "dayjs";
import bcrypt from "bcrypt";

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
server.get("/sing-in", async (req, res) => {
  try {
    const particiapants = await db.collection("login").find().toArray();
    return res.send(particiapants);
  } catch (err) {
    res.status(500).send("Erro no servidor");
  }
});

server.post("/sing-in", async (req, res) => {
  const { email, password } = req.body;

  const dataSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  const validate = dataSchema.validate(
    { email, password },
    { abortEarly: false }
  );

  if (validate.error) {
    const err = validate.error.details.map((detail) => detail.message);
    return res.status(422).send(err);
  }

  try {
    const verifyEmail = await db.collection("login").findOne({ email });

    const verifyPassword = bcrypt.compareSync(password, verifyEmail.password);

    if (!verifyEmail || !verifyPassword)
      return res.status(422).send("E-mail ou senha incorretos");

    return res.send("ok");
  } catch {
    res.status(500).send("Erro no servidor");
  }
});

server.post("/sing-up", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  const dataSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  });

  const validate = dataSchema.validate(
    { name, email, password, confirmPassword },
    { abortEarly: false }
  );

  const passwordHashed = bcrypt.hashSync(password, 10);

  if (validate.error) {
    const err = validate.error.details.map((detail) => detail.message);
    return res.status(422).send(err);
  }

  try {
    const verifyEmail = await db.collection("login").findOne({ email });
    if (verifyEmail) return res.status(409).send("e-mail já cadastrado");

    await db
      .collection("login")
      .insertOne({ name, email, password: passwordHashed });

    res.status(201).send("conta criada");
  } catch {
    res.status(500).send("Erro no servidor");
  }
});

server.get("/wallet", async (req, res) => {
  try {
    const wallet = await db.collection("wallet").find().toArray();
    return res.send(wallet);
  } catch (err) {
    res.status(500).send("Erro no servidor");
  }
});

server.post("/wallet", async (req, res) => {
  const { description, value, type } = req.body;

  const dataSchema = joi.object({
    description: joi.string().required(),
    value: joi.number().required(),
    type: joi.string().valid("output", "entry").required(),
  });

  const validate = dataSchema.validate(
    { description, value, type },
    { abortEarly: false }
  );

  if (validate.error) {
    const err = validate.error.details.map((detail) => detail.message);
    return res.status(422).send(err);
  }

  try {
    const day = dayjs(Date.now()).format("DD/MM");

    await db.collection("wallet").insertOne({
      description,
      value,
      type,
      date: day,
    });

    return res.send("ok");
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro no servidor");
  }
});

const PORT = 5000;
server.listen(PORT);
