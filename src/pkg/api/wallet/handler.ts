import { Request, Response } from "express";
import { utils } from "ethers";
import { isNetworkValid } from "../../../util";
import { Network } from "../../../synchronizer";
import { Context, ListWalletsResponse, LoginWalletResponse } from "./type";

export const walletsHandler = (ctx: Context) => {
  return async (req: Request, res: Response) => {
    // get params
    const { network: networkName } = req.query;

    // check network param
    if (!networkName || !isNetworkValid(networkName as Network)) {
      const response: ListWalletsResponse = {
        error: `invalid param network=${networkName}`,
      };

      return res.json(response);
    }

    try {
      // get wallet count from database
      const wallets = await ctx.db.listWallets(networkName as Network);

      // prepare and send api response
      const response: ListWalletsResponse = {
        meta: {
          count: wallets.length,
        },
      };
      res.json(response);
    } catch (err: any) {
      const response: ListWalletsResponse = {
        error: err.message,
      };

      res.json(response);
    }
  };
};

export const loginHandler = (ctx: Context) => {
  return async (req: Request, res: Response) => {
    // get params
    const { wallet: walletAddr } = req.params;
    const { network: networkName } = req.query;

    // check wallet parm
    if (!walletAddr || !utils.isAddress(walletAddr)) {
      const response: LoginWalletResponse = {
        error: `invalid param wallet=${walletAddr}`,
      };

      return res.json(response);
    }

    // check network param
    if (!networkName || !isNetworkValid(networkName as Network)) {
      const response: LoginWalletResponse = {
        error: `invalid param network=${networkName}`,
      };

      return res.json(response);
    }

    try {
      // make login into database
      const wallet = await ctx.db.login(networkName as Network, walletAddr);

      // prepare and send api response
      const response: LoginWalletResponse = {
        data: {
          address: wallet.address,
          ens: "",
        },
      };
      res.json(response);
    } catch (err: any) {
      const response: LoginWalletResponse = {
        error: err.message,
      };

      res.json(response);
    }
  };
};
