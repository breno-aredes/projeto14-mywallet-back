import { listWallet, newPostWallet } from "../controller/Wallet.js";
import { Router } from "express";
import { validateSchima } from "../middleware/validateSchema.js";
import { walletSchema } from "../model/walletSchema.js";
import { authValidation } from "../middleware/AuthValidation.js";

const walletRouter = Router();
//rotas de dados da carteira
walletRouter.get("/wallet", authValidation, listWallet);
walletRouter.post(
  "/wallet",
  authValidation,
  validateSchima(walletSchema),
  newPostWallet
);

export default walletRouter;
