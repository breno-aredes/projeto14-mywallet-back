import { singIn, singUP } from "../controller/Auth.js";
import { Router } from "express";

const authRouter = Router();
//rotas de autenticação
authRouter.post("/sing-in", singIn);
authRouter.post("/sing-up", singUP);

export default authRouter;
