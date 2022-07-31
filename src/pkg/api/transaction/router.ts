import { Router } from "express";
import { Context } from "./type";
import { getDepositsHandler, getWithdrawsHandler, getBalancesHandler } from "./handler";

export const router = (ctx: Context) => {
  const router = Router();

  router.get("/transactions/:wallet/deposits/:contract", getDepositsHandler(ctx));
  router.get("/transactions/:wallet/withdraws/:contract", getWithdrawsHandler(ctx));
  router.get("/transactions/:wallet/balances/:contract", getBalancesHandler(ctx));

  return router;
};
