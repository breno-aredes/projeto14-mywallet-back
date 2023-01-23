import { listWallet, newPostWallet } from "../controller/Wallet.js";
import { Router } from "express";

const walletRouter = Router();
//rotas de dados da carteira
walletRouter.get("/wallet", listWallet);
walletRouter.post("/wallet", newPostWallet);

export default walletRouter;
