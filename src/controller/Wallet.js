import dayjs from "dayjs";
import db from "../config/database.js";

export async function listWallet(req, res) {
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
}

export async function newPostWallet(req, res) {
  const { description, value, type } = req.body;
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.status(420).send("informe o token");

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
}
