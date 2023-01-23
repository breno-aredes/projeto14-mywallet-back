import { singIn, singUP } from "../controller/Auth.js";
import { Router } from "express";
import { validateSchima } from "../middleware/validateSchema.js";
import { singInSchema, singUpSchema } from "../model/authSchema.js";

const authRouter = Router();
//rotas de autenticação
authRouter.post("/sing-in", validateSchima(singInSchema), singIn);
authRouter.post("/sing-up", validateSchima(singUpSchema), singUP);

export default authRouter;
