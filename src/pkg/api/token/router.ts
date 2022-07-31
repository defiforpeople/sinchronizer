import { Router } from "express";
import { Context } from "./type";
import { getTokensHandler } from "./handler";

export const router = (ctx: Context) => {
  const router = Router();

  router.get("/tokens/:wallet", getTokensHandler(ctx));

  return router;
};
