import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
  await mongoClient.connect();
} catch (err) {
  res.status(500).send("Erro no servidor", err.message);
}
const db = mongoClient.db();

export default db;
