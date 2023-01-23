import { listWallet, newPostWallet } from "../controller/Wallet.js";
import { Router } from "express";
import { validateSchima } from "../middleware/validateSchema.js";
import { walletSchema } from "../model/walletSchema.js";

const walletRouter = Router();
//rotas de dados da carteira
walletRouter.get("/wallet", listWallet);
walletRouter.post("/wallet", validateSchima(walletSchema), newPostWallet);

export default walletRouter;
