import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import db from "../config/database.js";

export async function singIn(req, res) {
  const { email, password } = req.body;

  try {
    const token = uuid();

    const verifyEmail = await db.collection("login").findOne({ email });
    if (!verifyEmail) return res.status(422).send("E-mail ou senha incorretos");

    const verifyPassword = bcrypt.compareSync(password, verifyEmail.password);
    if (!verifyPassword)
      return res.status(422).send("E-mail ou senha incorretos");

    await db
      .collection("sessions")
      .insertOne({ userId: verifyEmail._id, token });

    return res.status(200).send({ name: verifyEmail.name, token });
  } catch {
    res.status(500).send("Erro no servidor");
  }
}

export async function singUP(req, res) {
  const { name, email, password } = req.body;

  const passwordHashed = bcrypt.hashSync(password, 10);

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
}
