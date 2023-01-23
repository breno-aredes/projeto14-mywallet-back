import dayjs from "dayjs";
import db from "../config/database.js";

export async function listWallet(req, res) {
  const checkSession = res.locals.session;
  try {
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
  const checkSession = res.locals.session;
  try {
    const day = dayjs(Date.now()).format("DD/MM");

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
