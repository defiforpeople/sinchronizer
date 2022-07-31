import { Request, Response } from "express";
import { utils } from "ethers";
import { Network } from "../../../synchronizer";
import { isNetworkValid } from "../../../util";
import { Context, TokensResponse } from "./type";

export const getTokensHandler = (ctx: Context) => {
  return async (req: Request, res: Response) => {
    // get params
    const { wallet } = req.params;
    const { network: networkName } = req.query;

    // check wallet parm
    if (!wallet || !utils.isAddress(wallet)) {
      const response: TokensResponse = {
        error: `invalid param wallet=${wallet}`,
      };

      return res.json(response);
    }

    // check network param
    if (!networkName || !isNetworkValid(networkName as Network)) {
      const response: TokensResponse = {
        error: `invalid param network=${networkName}`,
      };

      return res.json(response);
    }

    try {
      // get tokens from manager
      // TODO(ca): check the hardcoded cotnract address
      const tokens = await ctx.ns[networkName as Network].tm.getTokens(
        wallet,
        "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
      );

      // prepare and send api response
      const response: TokensResponse = {
        data: {
          tokens,
        },
        meta: {
          count: tokens.length,
        },
      };
      res.json(response);
    } catch (err: any) {
      const response: TokensResponse = {
        error: err.message,
      };

      res.json(response);
    }
  };
};
