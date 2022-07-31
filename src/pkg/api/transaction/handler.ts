import { BigNumber } from "ethers";
import { Request, Response } from "express";
import { utils } from "ethers";
import { Network } from "../../../synchronizer";
import { isNetworkValid } from "../../../util";
import { BalacesResponse, Context, DepositsResponse, WithdrawsResponse } from "./type";

export const getDepositsHandler = (ctx: Context) => {
  return async (req: Request, res: Response) => {
    // get params
    const { wallet, contract } = req.params;
    const { network: networkName } = req.query;

    // check wallet parm
    if (!wallet || !utils.isAddress(wallet)) {
      const response: DepositsResponse = {
        error: `invalid param wallet=${wallet}`,
      };

      return res.json(response);
    }

    // check wallet contract
    if (!contract || !utils.isAddress(contract)) {
      const response: DepositsResponse = {
        error: `invalid param contract=${contract}`,
      };

      return res.json(response);
    }

    // check network param
    if (!networkName || !isNetworkValid(networkName as Network)) {
      const response: DepositsResponse = {
        error: `invalid param network=${networkName}`,
      };

      return res.json(response);
    }

    try {
      // get deposits from database
      const deposits = await ctx.db.listDeposits(networkName as Network, wallet, contract);

      // prepare and send api response
      const response: DepositsResponse = {
        data: {
          deposits,
        },
        meta: {
          count: deposits.length,
        },
      };
      res.json(response);
    } catch (err: any) {
      const response: DepositsResponse = {
        error: err.message,
      };

      res.json(response);
    }
  };
};

export const getWithdrawsHandler = (ctx: Context) => {
  return async (req: Request, res: Response) => {
    // get params
    const { wallet, contract } = req.params;
    const { network: networkName } = req.query;

    // check wallet parm
    if (!wallet || !utils.isAddress(wallet)) {
      const response: DepositsResponse = {
        error: `invalid param wallet=${wallet}`,
      };

      return res.json(response);
    }

    // check wallet contract
    if (!contract || !utils.isAddress(contract)) {
      const response: DepositsResponse = {
        error: `invalid param contract=${contract}`,
      };

      return res.json(response);
    }

    // check network param
    if (!networkName || !isNetworkValid(networkName as Network)) {
      const response: DepositsResponse = {
        error: `invalid param network=${networkName}`,
      };

      return res.json(response);
    }

    try {
      // get withdraws from database
      const withdraws = await ctx.db.listWithdraws(networkName as Network, wallet, contract);

      // prepare and send api response
      const response: WithdrawsResponse = {
        data: {
          withdraws,
        },
        meta: {
          count: withdraws.length,
        },
      };
      res.json(response);
    } catch (err: any) {
      const response: WithdrawsResponse = {
        error: err.message,
      };

      res.json(response);
    }
  };
};

export const getBalancesHandler = (ctx: Context) => {
  return async (req: Request, res: Response) => {
    // get params
    const { wallet, contract } = req.params;
    const { network: networkName } = req.query;

    // check wallet parm
    if (!wallet || !utils.isAddress(wallet)) {
      const response: DepositsResponse = {
        error: `invalid param wallet=${wallet}`,
      };

      return res.json(response);
    }

    // check wallet contract
    if (!contract || !utils.isAddress(contract)) {
      const response: DepositsResponse = {
        error: `invalid param contract=${contract}`,
      };

      return res.json(response);
    }

    // check network param
    if (!networkName || !isNetworkValid(networkName as Network)) {
      const response: DepositsResponse = {
        error: `invalid param network=${networkName}`,
      };

      return res.json(response);
    }

    try {
      // get deposits from database
      const deposits = await ctx.db.listDeposits(networkName as Network, wallet, contract);
      const sumDeposits: BigNumber = deposits.reduce(
        (sum, deposit) => sum.add(BigNumber.from(deposit.amount)),
        BigNumber.from(0)
      );

      // get withdraws from database
      const withdraws = await ctx.db.listWithdraws(networkName as Network, wallet, contract);
      const sumWithdraws: BigNumber = withdraws.reduce(
        (sum, withdraw) => sum.add(BigNumber.from(withdraw.amount)),
        BigNumber.from(0)
      );

      // prepare and send api response
      const response: BalacesResponse = {
        data: {
          deposits: sumDeposits.toString(),
          withdraws: sumWithdraws.toString(),
          balance: sumDeposits.sub(sumWithdraws).toString(),
        },
      };
      res.json(response);
    } catch (err: any) {
      const response: BalacesResponse = {
        error: err.message,
      };

      res.json(response);
    }
  };
};
