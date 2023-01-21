import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import dayjs from "dayjs";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

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

    const token = uuid();

    const verifyPassword = bcrypt.compareSync(password, verifyEmail.password);

    if (!verifyEmail || !verifyPassword)
      return res.status(422).send("E-mail ou senha incorretos");

    await db
      .collection("sessions")
      .insertOne({ userId: verifyEmail._id, token });

    return res.status(200).send(token);
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
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.status(420).send("informe o token");

  try {
    const checkSession = await db.collection("sessions").findOne({ token });
    if (!checkSession) return res.status(401).send("token invalido");

    const wallet = await db
      .collection("wallet")
      .find({ userId: checkSession.userId })
      .toArray();
    return res.send(wallet);
  } catch (err) {
    res.status(500).send("Erro no servidor");
  }
});

server.post("/wallet", async (req, res) => {
  const { description, value, type } = req.body;
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.status(420).send("informe o token");

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

    const checkSession = await db.collection("sessions").findOne({ token });

    if (!checkSession)
      return res
        .status(401)
        .send("você não tem autorização para cadastrar entradas ou saidas");

    await db.collection("wallet").insertOne({
      description,
      value,
      type,
      date: day,
      userId: checkSession.userId,
    });

    return res.send("ok");
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro no servidor");
  }
});

const PORT = 5000;
server.listen(PORT);
