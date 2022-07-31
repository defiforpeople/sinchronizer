import { Router } from "express";
import { Context } from "./type";
import { loginHandler, walletsHandler } from "./handler";

export const router = (ctx: Context) => {
  const router = Router();

  router.post("/wallets/:wallet/login", loginHandler(ctx));
  router.get("/wallets", walletsHandler(ctx));

  return router;
};
